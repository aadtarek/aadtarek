import { Heart, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  familyName,
  fullSizeVariations,
  sampleVariation,
} from "../api/catalog";
import { formatPrice } from "../lib/format";
import { profileChips } from "../lib/profile";
import { useCart } from "../store/cart";
import { useWishlist } from "../store/wishlist";
import type { Product } from "../types";
import { BottleIcon } from "./Icons";

/**
 * Product card: chips (who it's for, family, occasion, season), key notes,
 * DNA, and the bottle sizes so a size can be picked and added right here.
 */
export function ProductCard({
  product,
  badge = product.badge,
}: {
  product: Product;
  badge?: string;
}) {
  const cart = useCart();
  const wishlist = useWishlist();
  const wished = wishlist.has(product.id);
  const sizes = fullSizeVariations(product);
  const sample = sampleVariation(product);
  const [variationId, setVariationId] = useState(
    () => (sizes.find((v) => v.inStock) ?? sizes[0]).id,
  );
  const selected = sizes.find((v) => v.id === variationId) ?? sizes[0];
  const href = `/product/${product.slug}`;
  const chips = profileChips(product, familyName);

  return (
    <article className="motion-product-card flex h-full flex-col overflow-hidden rounded-[10px] bg-card shadow-[0_1px_2px_rgba(60,45,20,0.06),0_0_0_1px_rgba(60,45,20,0.05)] transition-shadow hover:shadow-[0_14px_34px_-14px_rgba(60,45,20,0.28),0_0_0_1px_rgba(60,45,20,0.06)]">
      <div className="relative aspect-[348/200] overflow-hidden">
        <Link to={href} tabIndex={-1} aria-hidden>
          <img
            src={product.images[0].src}
            alt={product.images[0].alt}
            loading="lazy"
            draggable={false}
            className="size-full object-cover transition-transform duration-700 ease-out hover:scale-[1.04]"
          />
        </Link>
        {badge && (
          <span
            className={`pointer-events-none absolute top-3 left-3 rounded-full px-3 py-[5px] text-[11.5px] leading-none font-medium shadow-sm ${
              /best/i.test(badge) ? "bg-olive text-cream" : "bg-card text-ink"
            }`}
          >
            {badge}
          </span>
        )}
        <button
          type="button"
          onClick={() => wishlist.toggle(product.id)}
          aria-pressed={wished}
          aria-label={
            wished
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          className="absolute top-2 right-2 grid size-10 place-items-center rounded-full text-white transition hover:scale-110"
        >
          <Heart
            className={`size-[24px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] transition ${wished ? "fill-white" : ""}`}
            strokeWidth={1.4}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col px-3.5 pt-3.5 pb-3.5 sm:px-4">
        <h3 className="font-serif text-[17px] leading-none uppercase sm:text-[19px]">
          <Link
            to={href}
            className="hover:underline hover:decoration-1 hover:underline-offset-4"
          >
            {product.name}
          </Link>
        </h3>

        <ul
          className="mt-2.5 flex flex-wrap gap-1 sm:gap-1.5"
          aria-label="Profile"
        >
          {chips.map(({ label, Icon }) => (
            <li
              key={label}
              className="inline-flex items-center gap-1 rounded-full bg-chip px-2 py-[3px] text-[10.5px] whitespace-nowrap text-ink-soft sm:gap-1.5 sm:px-2.5 sm:text-[12px]"
            >
              <Icon
                className="size-3 shrink-0 sm:size-3.5"
                strokeWidth={1.4}
                aria-hidden
              />
              {label}
            </li>
          ))}
        </ul>

        <p className="mt-3 text-[10.5px] font-medium tracking-[0.16em] uppercase sm:text-[11px]">
          Fragrance notes
        </p>
        <ul className="mt-1.5 grid grid-cols-4 gap-1">
          {product.notes.slice(0, 4).map((n) => (
            <li key={n.name} className="flex flex-col items-center text-center">
              <img
                src={n.image}
                alt=""
                className="h-[30px] w-auto object-contain"
                loading="lazy"
              />
              <span className="mt-[2px] w-full truncate text-[10.5px] leading-tight text-ink-soft">
                {n.name}
              </span>
            </li>
          ))}
        </ul>

        {product.inspiredBy && (
          <>
            <p className="mt-3 text-[11px] font-medium tracking-[0.08em] uppercase">
              DNA
            </p>
            <p className="text-[13px] leading-snug text-ink-soft">
              {product.inspiredBy}
            </p>
          </>
        )}

        {sizes.length > 1 && (
          <div
            role="radiogroup"
            aria-label={`Size for ${product.name}`}
            className="mt-3 flex flex-wrap gap-1.5"
          >
            {sizes.map((v) => {
              const on = v.id === selected.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  disabled={!v.inStock}
                  onClick={() => setVariationId(v.id)}
                  className={`h-8 min-w-[50px] rounded-[3px] border px-2 sm:min-w-[58px] sm:px-2.5 text-[12px] font-medium tracking-[0.02em] transition disabled:cursor-not-allowed disabled:line-through disabled:opacity-40 ${
                    on
                      ? "border-olive bg-olive text-cream"
                      : "border-line-strong bg-transparent hover:border-ink"
                  }`}
                >
                  {v.size.replace(/\s*ML$/i, " ml")}
                </button>
              );
            })}
          </div>
        )}

        <p
          className="mt-2.5 text-[17px] font-semibold tracking-[0.01em] sm:text-[18px]"
          aria-live="polite"
        >
          {formatPrice(selected.price)}
        </p>

        <div
          className={`mt-auto grid gap-2 pt-2.5 ${sample ? "grid-cols-[1.4fr_1fr]" : ""}`}
        >
          <button
            type="button"
            onClick={() => cart.add(product.id, selected.id)}
            disabled={!selected.inStock}
            className="inline-flex h-[46px] items-center justify-center gap-2 rounded-[3px] bg-olive px-1.5 text-[10px] font-medium tracking-[0.05em] sm:px-2 sm:text-[11px] sm:tracking-[0.07em] whitespace-nowrap text-cream uppercase transition hover:bg-olive-hover disabled:opacity-50 sm:text-[12px]"
          >
            <ShoppingBag
              className="hidden size-[17px] shrink-0 sm:block"
              strokeWidth={1.4}
              aria-hidden
            />
            Add to cart
          </button>
          {sample && (
            <button
              type="button"
              onClick={() => cart.add(product.id, sample.id)}
              disabled={!sample.inStock}
              aria-label={`Try ${sample.size} for ${formatPrice(sample.price)}`}
              className="inline-flex h-[46px] items-center justify-center gap-1.5 rounded-[3px] border border-line-strong disabled:pointer-events-none disabled:opacity-40 px-1 text-[9.5px] leading-[1.25] whitespace-nowrap transition hover:border-ink sm:px-1.5 sm:text-[11px] hover:bg-ink hover:text-cream"
            >
              <BottleIcon className="hidden size-[18px] shrink-0 sm:block" />
              <span className="flex flex-col items-center">
                <span className="font-semibold tracking-[0.04em] uppercase">
                  Try {sample.size}
                </span>
                <span className="tracking-[0.03em]">
                  {formatPrice(sample.price)}
                </span>
              </span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
