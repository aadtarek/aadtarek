const egp = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

export function formatPrice(amount: number): string {
  return `${egp.format(amount)} EGP`
}

export function formatPriceRange(min: number, max: number): string {
  return min === max ? formatPrice(min) : `${egp.format(min)} - ${egp.format(max)} EGP`
}
