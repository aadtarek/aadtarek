import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { isWoo, money, storeApi, wp } from '../api/wp'
import { LOYALTY } from '../config'
import { usePersistentState } from '../lib/storage'
import { useAccount } from './account'
import { useCart, type WooCart } from './cart'

/**
 * Loyalty points and the welcome discount. With WordPress the signed-in customer
 * comes from WooCommerce's My Account (rfaheya.php, admin-ajax "rfaheya_me"); both
 * discounts are one-time WooCommerce coupons applied to the storefront cart.
 * Without WordPress a local stand-in keeps the flows working for the demo.
 */

export interface Me {
  loggedIn: boolean
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  points?: number
  welcome?: { code: string; percent: number; used: boolean } | null
  redeem?: { code: string; amount: number; points: number } | null
  nonce?: string
}

export interface AppliedCoupon {
  code: string
  label: string
  amount: number
}

interface RewardsValue {
  me: Me
  /** False until the signed-in state is known (WordPress). */
  ready: boolean
  /** Discounts applied to the cart (welcome / points / other coupons) */
  coupons: AppliedCoupon[]
  couponTotal: number
  busy: boolean
  error: string | null
  redeem: () => Promise<void>
  cancelRedeem: () => Promise<void>
  removeCoupon: (code: string) => Promise<void>
  /** After checkout: the used discounts are spent. */
  orderPlaced: () => void
}

const RewardsContext = createContext<RewardsValue | null>(null)
const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

export function couponLabel(code: string) {
  if (/^welcome-/i.test(code)) return `First order ${LOYALTY.welcomePercent}% off`
  if (/^points-/i.test(code)) return 'Points discount'
  return `Coupon ${code.toUpperCase()}`
}

async function ajax(action: string, data: Record<string, string> = {}): Promise<Me & { error?: string }> {
  const url = `${wp!.siteUrl}/wp-admin/admin-ajax.php`
  const body = new URLSearchParams({ action, ...data })
  const res = await fetch(action === 'rfaheya_me' ? `${url}?action=rfaheya_me` : url, {
    method: action === 'rfaheya_me' ? 'GET' : 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json' },
    body: action === 'rfaheya_me' ? undefined : body,
  })
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json()
}

export function RewardsProvider({ children }: { children: ReactNode }) {
  const account = useAccount()
  const cart = useCart()
  const [wooMe, setWooMe] = useState<Me>({ loggedIn: false })
  const [loaded, setLoaded] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Demo stand-in (no WordPress): points and coupons kept in this browser.
  const [demoPoints, setDemoPoints] = usePersistentState('rfaheya.demoPoints', 1250)
  const [demoRedeem, setDemoRedeem] = usePersistentState<Me['redeem']>('rfaheya.demoRedeem', null)
  const [demoWelcomeUsed, setDemoWelcomeUsed] = usePersistentState('rfaheya.demoWelcomeUsed', false)
  const [demoCodes, setDemoCodes] = usePersistentState<string[]>('rfaheya.demoCoupons', [])
  // Welcome codes the customer took off the cart themselves are not put back.
  const [declined, setDeclined] = usePersistentState<string[]>('rfaheya.declinedCoupons', [])

  const me: Me = useMemo(() => {
    if (isWoo) return wooMe
    const c = account.customer
    if (!c) return { loggedIn: false }
    return {
      loggedIn: true,
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      points: demoPoints,
      welcome: LOYALTY.welcome && account.orders.length === 0 ? { code: 'WELCOME-DEMO', percent: LOYALTY.welcomePercent, used: demoWelcomeUsed } : null,
      redeem: demoRedeem,
    }
  }, [wooMe, account.customer, account.orders.length, demoPoints, demoRedeem, demoWelcomeUsed])

  const refresh = useCallback(async () => {
    if (!isWoo) return
    try {
      setWooMe(await ajax('rfaheya_me'))
    } catch {
      /* the shop works without it */
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    // After the products: it never delays the first page.
    const id = window.setTimeout(refresh, 600)
    const onVisible = () => document.visibilityState === 'visible' && refresh()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearTimeout(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [refresh])

  const wooCart = cart.woo?.cart ?? null
  const applyWoo = cart.woo?.apply
  const merchandise = cart.subtotal - cart.discount

  const coupons: AppliedCoupon[] = useMemo(() => {
    if (isWoo) {
      return (wooCart?.coupons ?? []).map((c) => ({
        code: c.code,
        label: couponLabel(c.code),
        amount: money(c.totals.total_discount, c.totals.currency_minor_unit),
      }))
    }
    let left = merchandise
    return demoCodes.flatMap((code) => {
      let amount = 0
      if (same(code, 'WELCOME-DEMO')) amount = Math.round((merchandise * LOYALTY.welcomePercent) / 100)
      else if (demoRedeem && same(code, demoRedeem.code)) amount = demoRedeem.amount
      else return []
      amount = Math.min(amount, left)
      left -= amount
      return [{ code, label: couponLabel(code), amount }]
    })
  }, [wooCart, demoCodes, demoRedeem, merchandise])
  const couponTotal = coupons.reduce((n, c) => n + c.amount, 0)

  const applyCoupon = useCallback(
    async (code: string) => {
      if (!isWoo) {
        setDemoCodes((list) => (list.some((c) => same(c, code)) ? list : [...list, code]))
        return
      }
      const next = await storeApi<WooCart>('cart/apply-coupon', { method: 'POST', body: { code } })
      applyWoo?.(next)
    },
    [applyWoo, setDemoCodes],
  )

  const dropCoupon = useCallback(
    async (code: string) => {
      if (!isWoo) {
        setDemoCodes((list) => list.filter((c) => !same(c, code)))
        return
      }
      const next = await storeApi<WooCart>('cart/remove-coupon', { method: 'POST', body: { code } })
      applyWoo?.(next)
    },
    [applyWoo, setDemoCodes],
  )

  const run = useCallback(async (job: () => Promise<void>) => {
    setBusy(true)
    setError(null)
    try {
      await job()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }, [])

  const redeem = useCallback(
    () =>
      run(async () => {
        const cap = Math.max(0, merchandise - coupons.filter((c) => !/^points-/i.test(c.code)).reduce((n, c) => n + c.amount, 0))
        if (!isWoo) {
          if (me.redeem) await dropCoupon(me.redeem.code)
          const points = demoPoints + (demoRedeem?.points ?? 0)
          if (points < LOYALTY.min) throw new Error(`You need at least ${LOYALTY.min} points.`)
          const amount = Math.min(Math.floor(points * LOYALTY.value), Math.floor(cap))
          if (amount < 1) throw new Error('Not enough points for a discount yet.')
          const spend = Math.min(points, Math.ceil(amount / LOYALTY.value))
          setDemoPoints(points - spend)
          setDemoRedeem({ code: 'POINTS-DEMO', amount, points: spend })
          await applyCoupon('POINTS-DEMO')
          return
        }
        if (me.redeem) await dropCoupon(me.redeem.code).catch(() => undefined)
        const next = await ajax('rfaheya_redeem', { _ajax_nonce: me.nonce ?? '', max: String(Math.floor(cap)) })
        if (next.error) throw new Error(next.error)
        setWooMe(next)
        if (next.redeem) await applyCoupon(next.redeem.code)
      }),
    [run, merchandise, coupons, me, demoPoints, demoRedeem, dropCoupon, applyCoupon, setDemoPoints, setDemoRedeem],
  )

  const cancelRedeem = useCallback(
    () =>
      run(async () => {
        if (!me.redeem) return
        await dropCoupon(me.redeem.code).catch(() => undefined)
        if (!isWoo) {
          setDemoPoints((p) => p + (demoRedeem?.points ?? 0))
          setDemoRedeem(null)
          return
        }
        const next = await ajax('rfaheya_unredeem', { _ajax_nonce: me.nonce ?? '' })
        if (next.error) throw new Error(next.error)
        setWooMe(next)
      }),
    [run, me, dropCoupon, demoRedeem, setDemoPoints, setDemoRedeem],
  )

  const removeCoupon = useCallback(
    (code: string) => {
      if (/^points-/i.test(code)) return cancelRedeem()
      return run(async () => {
        if (/^welcome-/i.test(code)) setDeclined((d) => [...d, code.toLowerCase()])
        await dropCoupon(code)
      })
    },
    [cancelRedeem, run, dropCoupon, setDeclined],
  )

  // Put the customer's discounts on the cart once it has something in it.
  const tried = useRef(new Set<string>())
  const hasLines = cart.lines.length > 0
  useEffect(() => {
    if (!hasLines || !me.loggedIn) return
    const wanted = [
      me.welcome && !me.welcome.used && !declined.includes(me.welcome.code.toLowerCase()) ? me.welcome.code : null,
      me.redeem?.code ?? null,
    ].filter((c): c is string => Boolean(c))
    for (const code of wanted) {
      if (coupons.some((c) => same(c.code, code)) || tried.current.has(code)) continue
      tried.current.add(code)
      applyCoupon(code).catch(() => undefined)
    }
  }, [hasLines, me, coupons, declined, applyCoupon])

  const orderPlaced = useCallback(() => {
    if (isWoo) {
      refresh()
      return
    }
    if (demoCodes.some((c) => same(c, 'WELCOME-DEMO'))) setDemoWelcomeUsed(true)
    if (demoRedeem && demoCodes.some((c) => same(c, demoRedeem.code))) setDemoRedeem(null)
    setDemoCodes([])
  }, [refresh, demoCodes, demoRedeem, setDemoWelcomeUsed, setDemoRedeem, setDemoCodes])

  const value = useMemo<RewardsValue>(
    () => ({ me, ready: !isWoo || loaded, coupons, couponTotal, busy, error, redeem, cancelRedeem, removeCoupon, orderPlaced }),
    [me, loaded, coupons, couponTotal, busy, error, redeem, cancelRedeem, removeCoupon, orderPlaced],
  )
  return <RewardsContext.Provider value={value}>{children}</RewardsContext.Provider>
}

export function useRewards() {
  const ctx = useContext(RewardsContext)
  if (!ctx) throw new Error('useRewards must be used inside <RewardsProvider>')
  return ctx
}
