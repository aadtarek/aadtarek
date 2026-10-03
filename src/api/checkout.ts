import type { WooCart } from '../store/cart'
import type { ShippingAddress } from '../types'
import { storeApi } from './wp'

/** WooCommerce state codes for Egypt (WooCommerce i18n/states). */
export const GOVERNORATE_CODES: Record<string, string> = {
  Alexandria: 'EGALX',
  Aswan: 'EGASN',
  Asyut: 'EGAST',
  'Red Sea': 'EGBA',
  Beheira: 'EGBH',
  'Beni Suef': 'EGBNS',
  Cairo: 'EGC',
  Dakahlia: 'EGDK',
  Damietta: 'EGDT',
  Faiyum: 'EGFYM',
  Gharbia: 'EGGH',
  Giza: 'EGGZ',
  Ismailia: 'EGIS',
  'South Sinai': 'EGJS',
  Qalyubia: 'EGKB',
  'Kafr El Sheikh': 'EGKFS',
  Qena: 'EGKN',
  Luxor: 'EGLX',
  Minya: 'EGMN',
  Monufia: 'EGMNF',
  Matrouh: 'EGMT',
  'Port Said': 'EGPTS',
  Sohag: 'EGSHG',
  Sharqia: 'EGSHR',
  'North Sinai': 'EGSIN',
  Suez: 'EGSUZ',
  'New Valley': 'EGWAD',
}

/** Labels for WooCommerce payment gateway ids. */
export const PAYMENT_LABELS: Record<string, { title: string; text: string }> = {
  cod: { title: 'Cash on delivery', text: 'Pay in cash when your order arrives.' },
  bacs: { title: 'InstaPay transfer', text: 'Transfer instructions appear after you place the order.' },
  instapay: { title: 'InstaPay transfer', text: 'Transfer instructions appear after you place the order.' },
}

function wooAddress(a: ShippingAddress) {
  return {
    first_name: a.firstName.trim(),
    last_name: a.lastName.trim(),
    company: '',
    address_1: a.address.trim(),
    address_2: '',
    city: a.city.trim(),
    state: GOVERNORATE_CODES[a.governorate] ?? '',
    postcode: '',
    country: 'EG',
    phone: a.phone.trim(),
  }
}

/** Sends the address so WooCommerce can calculate shipping for it. */
export function updateCustomer(a: ShippingAddress) {
  const address = wooAddress(a)
  return storeApi<WooCart>('cart/update-customer', {
    method: 'POST',
    body: { billing_address: { ...address, email: a.email.trim() }, shipping_address: address },
  })
}

export interface WooCheckoutResult {
  order_id: number
  order_key: string
  status: string
  customer_note: string
  payment_method: string
  payment_result: { payment_status: string; payment_details: { key: string; value: string }[]; redirect_url: string }
}

export function placeWooOrder(a: ShippingAddress, paymentMethod: string, customerNote: string) {
  const address = wooAddress(a)
  return storeApi<WooCheckoutResult>('checkout', {
    method: 'POST',
    body: {
      billing_address: { ...address, email: a.email.trim() },
      shipping_address: address,
      customer_note: customerNote,
      payment_method: paymentMethod,
      payment_data: [],
    },
  })
}
