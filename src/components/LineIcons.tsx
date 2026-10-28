import type { ReactNode, SVGProps } from 'react'

/**
 * The store's own fine-line icons (header, tab bar, cards). Each has a small
 * animation that plays on hover / tap (see `.rf-ic` in index.css).
 */
export type LineIconProps = { className?: string; strokeWidth?: number } & Omit<SVGProps<SVGSVGElement>, 'children'>

function Svg({ name, className = '', strokeWidth = 1.3, children, ...rest }: LineIconProps & { name: string; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`rf-ic rf-ic-${name} ${className}`}
      {...rest}
    >
      {children}
    </svg>
  )
}

export function HomeIcon(props: LineIconProps) {
  return (
    <Svg name="home" {...props}>
      <path d="M4 10.6 12 4l8 6.6V19a1.5 1.5 0 0 1-1.5 1.5H15v-5.5H9v5.5H5.5A1.5 1.5 0 0 1 4 19z" />
    </Svg>
  )
}

/** Shop: a perfume bottle */
export function ShopIcon(props: LineIconProps) {
  return (
    <Svg name="shop" {...props}>
      <path d="M10 3.5h4v3h-4z" />
      <rect x="5.5" y="6.5" width="13" height="14" rx="3.5" />
      <path d="M8.5 14h7" />
    </Svg>
  )
}

export function SearchIcon(props: LineIconProps) {
  return (
    <Svg name="search" {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </Svg>
  )
}

export function HeartIcon(props: LineIconProps) {
  return (
    <Svg name="heart" {...props}>
      <path d="M12 20s-7.2-4.5-9.2-8.8C1.4 8.1 3.4 4.7 6.9 4.7c2.1 0 3.4 1.1 5.1 2.9 1.7-1.8 3-2.9 5.1-2.9 3.5 0 5.5 3.4 4.1 6.5C19.2 15.5 12 20 12 20z" />
    </Svg>
  )
}

export function UserIcon(props: LineIconProps) {
  return (
    <Svg name="user" {...props}>
      <circle cx="12" cy="8" r="3.8" />
      <path d="M4.5 20.5c1.3-3.8 4.2-5.6 7.5-5.6s6.2 1.8 7.5 5.6" />
    </Svg>
  )
}

export function BagIcon(props: LineIconProps) {
  return (
    <Svg name="bag" {...props}>
      <path d="M5.5 8.5h13l-1 11.2a1.5 1.5 0 0 1-1.5 1.3H8a1.5 1.5 0 0 1-1.5-1.3z" />
      <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" />
    </Svg>
  )
}

export function MoonIcon(props: LineIconProps) {
  return (
    <Svg name="moon" {...props}>
      <path d="M19.5 14.5A8 8 0 1 1 9.5 4.5a6.3 6.3 0 0 0 10 10z" />
    </Svg>
  )
}

export function SunIcon(props: LineIconProps) {
  return (
    <Svg name="sun" {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
    </Svg>
  )
}
