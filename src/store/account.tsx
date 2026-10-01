import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { readStorage, usePersistentState, writeStorage } from '../lib/storage'
import type { Customer, Order } from '../types'

/**
 * Customer accounts and orders. This is a local stand-in for WooCommerce
 * customers (JWT / cookie auth) and `POST /wc/store/v1/checkout`.
 * Passwords are NOT secure here — it only exists so the flows work end to end
 * before the real backend is connected.
 */

interface StoredUser extends Customer {
  password: string
}

interface AccountContextValue {
  customer: Customer | null
  orders: Order[]
  login: (email: string, password: string) => string | null
  register: (data: { firstName: string; lastName: string; email: string; password: string }) => string | null
  logout: () => void
  placeOrder: (order: Omit<Order, 'id' | 'number' | 'createdAt' | 'status'>) => Order
}

const AccountContext = createContext<AccountContextValue | null>(null)
const USERS_KEY = 'rfaheya.users'

export function AccountProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = usePersistentState<Customer | null>('rfaheya.customer', null)
  const [orders, setOrders] = usePersistentState<Order[]>('rfaheya.orders', [], (raw) =>
    Array.isArray(raw) ? raw.filter((o): o is Order => !!o && typeof o.number === 'string' && Array.isArray(o.items)) : undefined,
  )

  const login = useCallback(
    (email: string, password: string) => {
      const user = readStorage<StoredUser[]>(USERS_KEY, []).find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
      )
      if (!user || user.password !== password) return 'Incorrect email or password.'
      setCustomer({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName })
      return null
    },
    [setCustomer],
  )

  const register = useCallback<AccountContextValue['register']>(
    (data) => {
      const users = readStorage<StoredUser[]>(USERS_KEY, [])
      const email = data.email.trim().toLowerCase()
      if (users.some((u) => u.email === email)) return 'An account with this email already exists.'
      const user: StoredUser = { ...data, email, id: Date.now() }
      writeStorage(USERS_KEY, [...users, user])
      setCustomer({ id: user.id, email, firstName: user.firstName, lastName: user.lastName })
      return null
    },
    [setCustomer],
  )

  const placeOrder = useCallback<AccountContextValue['placeOrder']>(
    (data) => {
      const id = Date.now()
      const order: Order = {
        ...data,
        id,
        number: `RF-${String(id).slice(-6)}`,
        createdAt: new Date().toISOString(),
        status: 'processing',
      }
      setOrders((prev) => [order, ...prev])
      return order
    },
    [setOrders],
  )

  const value = useMemo<AccountContextValue>(
    () => ({ customer, orders, login, register, logout: () => setCustomer(null), placeOrder }),
    [customer, orders, login, register, setCustomer, placeOrder],
  )

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
}

export function useAccount() {
  const ctx = useContext(AccountContext)
  if (!ctx) throw new Error('useAccount must be used inside <AccountProvider>')
  return ctx
}
