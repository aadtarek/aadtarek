import { wp } from './wp'

/** The storefront's account page talks to WordPress (rfaheya.php, admin-ajax) with the login cookie. */

export interface AccountMe {
  loggedIn: boolean
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  points?: number
  accountNonce?: string
  social?: { name: string; url: string }[]
  error?: string
}

export interface AccountOrder {
  id: number
  number: string
  date: string
  status: string
  statusKey: string
  total: number
  shipping: number
  discount: number
  payment: string
  address: string
  items: { name: string; quantity: number; total: number; image: string }[]
}

export interface AccountDetails {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  area: string
  governorate: string
}

async function call<T>(action: string, data?: Record<string, string>): Promise<T & { error?: string }> {
  const url = `${wp!.siteUrl}/wp-admin/admin-ajax.php`
  const res = await fetch(data ? url : `${url}?action=${action}`, {
    method: data ? 'POST' : 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
    body: data ? new URLSearchParams({ action, ...data }) : undefined,
  })
  if (!res.ok) throw new Error(res.status === 403 ? 'Your session has ended. Please sign in again.' : `Something went wrong (${res.status}). Please try again.`)
  return res.json()
}

/** Throws with the message WordPress sent back. */
async function act<T>(action: string, data: Record<string, string>): Promise<T> {
  const out = await call<T>(action, data)
  if (out.error) throw new Error(out.error)
  return out
}

/** Points, coupons and the header follow sign-in / sign-out. */
const changed = () => window.dispatchEvent(new Event('rf:account'))

export const accountApi = {
  me: () => call<AccountMe>('rfaheya_account_me'),
  login: (email: string, password: string) => act('rfaheya_login', { email, password }).then(changed),
  register: (d: { firstName: string; lastName: string; email: string; phone: string; password: string; website?: string }) => act('rfaheya_register', { ...d, website: d.website ?? '', fullName: `${d.firstName} ${d.lastName}`.trim() }).then(changed),
  lostPassword: (email: string) => act<{ message: string }>('rfaheya_lost_password', { email }),
  resetPassword: (d: { key: string; login: string; id: string; password: string }) => act('rfaheya_reset_password', d).then(changed),
  logout: (nonce: string) => act('rfaheya_logout', { _ajax_nonce: nonce }).then(changed),
  data: (nonce: string) => act<{ orders: AccountOrder[]; details: AccountDetails }>('rfaheya_account_data', { _ajax_nonce: nonce }),
  save: (nonce: string, d: AccountDetails & { currentPassword: string; newPassword: string }) => act('rfaheya_save_account', { _ajax_nonce: nonce, ...d }),
}
