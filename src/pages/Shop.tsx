import {
  ChevronDown,
  LayoutGrid,
  Rows3,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  getAllProducts,
  getFamilies,
  matchesSearch,
  priceRange,
  sortProducts,
  type ProductSort,
} from "../api/catalog";
import { Overlay } from "../components/Overlay";
import { ProductCard } from "../components/ProductCard";
import banner from "../assets/shop-banner.webp";
import { GENDERS, OCCASIONS, SEASONS } from "../lib/profile";
import type { FamilySlug, Gender, Occasion, Product, Season } from "../types";

const sorts: { value: ProductSort; label: string }[] = [
  { value: "best-sellers", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name A–Z" },
];

type ListKey = "gender" | "family" | "occasion" | "season" | "accord";
const LIST_KEYS: ListKey[] = [
  "gender",
  "family",
  "occasion",
  "season",
  "accord",
];
const list = (v: string | null) => (v ? v.split(",").filter(Boolean) : []);

interface Filters {
  q: string;
  gender: string[];
  family: string[];
  occasion: string[];
  season: string[];
  accord: string[];
  min: number | null;
  max: number | null;
}

/** Products matching every active filter group (any value within a group). */
function applyFilters(all: Product[], f: Filters, skip?: ListKey) {
  return all.filter((p) => {
    if (!matchesSearch(p, f.q)) return false;
    if (
      skip !== "gender" &&
      f.gender.length &&
      !f.gender.includes(p.profile.gender)
    )
      return false;
    if (
      skip !== "family" &&
      f.family.length &&
      !p.families.some((x) => f.family.includes(x))
    )
      return false;
    if (
      skip !== "occasion" &&
      f.occasion.length &&
      !p.profile.occasions.some((x) => f.occasion.includes(x))
    )
      return false;
    if (
      skip !== "season" &&
      f.season.length &&
      !p.profile.seasons.some((x) => f.season.includes(x))
    )
      return false;
    if (
      skip !== "accord" &&
      f.accord.length &&
      !p.accords.some((x) => f.accord.includes(x))
    )
      return false;
    const r = priceRange(p);
    if (f.min != null && r.max < f.min) return false;
    if (f.max != null && r.min > f.max) return false;
    return true;
  });
}

export function Shop() {
  const [params, setParams] = useSearchParams();
  const sort = (params.get("sort") as ProductSort) || "best-sellers";
  const num = (k: string) => (params.get(k) ? Number(params.get(k)) : null);
  const filters: Filters = {
    q: params.get("q") ?? "",
    gender: list(params.get("gender")),
    family: list(params.get("family")),
    occasion: list(params.get("occasion")),
    season: list(params.get("season")),
    accord: list(params.get("accord")),
    min: num("min"),
    max: num("max"),
  };
  const all = getAllProducts();
  const products = sortProducts(applyFilters(all, filters), sort);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [columns, setColumns] = useState<1 | 2>(2);

  const prices = all.flatMap((p) => Object.values(priceRange(p)));
  const bounds = {
    min: Math.floor(Math.min(...prices, 0) / 100) * 100,
    max: Math.ceil(Math.max(...prices, 100) / 100) * 100,
  };

  const update = (changes: Record<string, string>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    setParams(next, { replace: true });
  };
  const toggle = (key: ListKey, value: string) => {
    const current = filters[key];
    update({
      [key]: (current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      ).join(","),
    });
  };
  const clearAll = () =>
    setParams(sort !== "best-sellers" ? { sort } : {}, { replace: true });

  const families = getFamilies();
  const labelOf = (key: ListKey, value: string) =>
    key === "gender"
      ? GENDERS[value as Gender]?.label
      : key === "family"
        ? families.find((f) => f.slug === value)?.name
        : key === "occasion"
          ? OCCASIONS[value as Occasion]?.label
          : key === "season"
            ? SEASONS[value as Season]?.label
            : value;
  const active = [
    ...(filters.q
      ? [{ label: `“${filters.q}”`, remove: () => update({ q: "" }) }]
      : []),
    ...LIST_KEYS.flatMap((key) =>
      filters[key].map((v) => ({
        label: labelOf(key, v) ?? v,
        remove: () => toggle(key, v),
      })),
    ),
    ...(filters.min != null || filters.max != null
      ? [
          {
            label: `${filters.min ?? bounds.min} – ${filters.max ?? bounds.max} EGP`,
            remove: () => update({ min: "", max: "" }),
          },
        ]
      : []),
  ];

  const panel = (
    <FilterPanel
      filters={filters}
      all={all}
      bounds={bounds}
      toggle={toggle}
      update={update}
      clearAll={clearAll}
      activeCount={active.length}
    />
  );
  const genderCounts = applyFilters(all, filters, "gender");

  return (
    <div className="pb-16 lg:pb-24">
      <div className="lg:container-x lg:grid lg:grid-cols-[264px_minmax(0,1fr)] lg:gap-8 lg:pt-5 xl:gap-10">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="no-scrollbar sticky top-[86px] max-h-[calc(100vh-100px)] overflow-y-auto rounded-xl bg-card px-6 py-6 shadow-[0_1px_2px_rgba(60,45,20,0.05),0_0_0_1px_rgba(60,45,20,0.05)]">
            {panel}
          </div>
        </aside>

        <div className="min-w-0">
          {/* Banner */}
          <div className="relative overflow-hidden bg-[#efe4d6] lg:rounded-xl">
            <img
              src={banner}
              alt=""
              className="absolute inset-0 size-full object-cover object-right"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#f3ebe1] via-[#f3ebe1]/85 to-transparent" />
            <div className="relative px-4 py-7 sm:px-8 lg:px-8 lg:py-8">
              <h1 className="font-serif text-[38px] leading-[1.02] tracking-[-0.01em] sm:text-[52px]">
                {filters.q ? `Results for “${filters.q}”` : "All Fragrances"}
              </h1>
              <p className="mt-2 text-[15px] text-ink-soft sm:text-[18px]">
                Find the fragrance that speaks to you.
              </p>
            </div>
          </div>

          <div className="px-4 sm:px-6 lg:px-0">
            {/* Phone: who it's for */}
            <ul
              className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:hidden"
              aria-label="Who it's for"
            >
              <li className="shrink-0">
                <PillButton
                  active={filters.gender.length === 0}
                  onClick={() => update({ gender: "" })}
                >
                  All ({genderCounts.length})
                </PillButton>
              </li>
              {(Object.keys(GENDERS) as Gender[]).map((g) => (
                <li key={g} className="shrink-0">
                  <PillButton
                    active={
                      filters.gender.length === 1 && filters.gender[0] === g
                    }
                    onClick={() =>
                      update({
                        gender:
                          filters.gender.length === 1 && filters.gender[0] === g
                            ? ""
                            : g,
                      })
                    }
                  >
                    {GENDERS[g].label} (
                    {genderCounts.filter((p) => p.profile.gender === g).length})
                  </PillButton>
                </li>
              ))}
            </ul>

            {/* Toolbar */}
            <div className="mt-4 flex items-center gap-3 lg:mt-5">
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg border border-line bg-card px-3.5 text-[14px] lg:hidden"
              >
                <SlidersHorizontal className="size-[18px]" strokeWidth={1.4} />
                Filters
                {active.length > 0 && (
                  <span className="grid size-5 place-items-center rounded-full bg-olive text-[11px] text-cream">
                    {active.length}
                  </span>
                )}
              </button>

              <ul
                className="hidden flex-1 flex-wrap items-center gap-2 lg:flex"
                aria-label="Active filters"
              >
                {active.map((a) => (
                  <li key={a.label}>
                    <span className="inline-flex h-10 items-center gap-3 rounded-full bg-chip pr-2 pl-4 text-[14px]">
                      {a.label}
                      <button
                        type="button"
                        onClick={a.remove}
                        aria-label={`Remove ${a.label}`}
                        className="grid size-6 place-items-center rounded-full hover:bg-line"
                      >
                        <X className="size-4" strokeWidth={1.5} />
                      </button>
                    </span>
                  </li>
                ))}
                {active.length > 0 && (
                  <li>
                    <button
                      type="button"
                      onClick={clearAll}
                      className="ml-1 text-[14px] underline underline-offset-4 hover:text-ink-soft"
                    >
                      Clear all
                    </button>
                  </li>
                )}
              </ul>

              <label className="ml-auto flex min-w-0 items-center gap-2 text-[14px] text-ink-soft lg:ml-0">
                <span className="hidden whitespace-nowrap sm:inline">
                  Sort by:
                </span>
                <span className="relative">
                  <select
                    value={sort}
                    onChange={(e) =>
                      update({
                        sort:
                          e.target.value === "best-sellers"
                            ? ""
                            : e.target.value,
                      })
                    }
                    className="h-11 w-[150px] appearance-none rounded-lg border border-line bg-card pr-9 pl-3.5 text-[14px] text-ink outline-none focus:border-olive sm:w-[170px]"
                  >
                    {sorts.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
                    strokeWidth={1.5}
                  />
                </span>
              </label>
              <p
                className="hidden shrink-0 text-[14px] text-ink-soft lg:block"
                aria-live="polite"
              >
                {products.length}{" "}
                {products.length === 1 ? "product" : "products"}
              </p>
              <button
                type="button"
                onClick={() => setColumns(columns === 2 ? 1 : 2)}
                aria-label={
                  columns === 2 ? "Show one per row" : "Show two per row"
                }
                className="grid size-11 shrink-0 place-items-center rounded-lg sm:hidden"
              >
                {columns === 2 ? (
                  <Rows3 className="size-5" strokeWidth={1.4} />
                ) : (
                  <LayoutGrid className="size-5" strokeWidth={1.4} />
                )}
              </button>
            </div>

            {products.length === 0 ? (
              <div className="mt-6 rounded-xl bg-card px-6 py-16 text-center shadow-[0_0_0_1px_rgba(60,45,20,0.05)]">
                <p className="font-serif text-[32px]">Nothing matches yet.</p>
                <p className="mx-auto mt-2 max-w-sm text-ink-soft">
                  Try removing a filter — or explore the full collection.
                </p>
                <button
                  type="button"
                  onClick={clearAll}
                  className="mt-6 inline-flex h-12 items-center rounded-[3px] bg-olive px-8 text-[12px] font-medium tracking-[0.12em] text-cream uppercase hover:bg-olive-hover"
                >
                  View all fragrances
                </button>
              </div>
            ) : (
              <ul
                className={`mt-4 grid gap-2.5 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-4 ${columns === 2 ? "grid-cols-2" : "grid-cols-1"}`}
              >
                {products.map((p) => (
                  <li key={p.id}>
                    <ProductCard product={p} />
                  </li>
                ))}
              </ul>
            )}

            <TryFirstBanner />
          </div>
        </div>
      </div>

      {sheetOpen && (
        <Overlay onClose={() => setSheetOpen(false)} label="Filters">
          <div className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-[22px] bg-cream shadow-2xl [animation:slide-up_.32s_cubic-bezier(.22,1,.36,1)]">
            <span
              aria-hidden
              className="mx-auto mt-3 h-1 w-10 rounded-full bg-line-strong"
            />
            <div className="flex-1 overflow-y-auto px-6 pt-4 pb-4">{panel}</div>
            <div className="border-t border-line px-5 py-4">
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="h-[52px] w-full rounded-lg bg-olive text-[15px] text-cream transition hover:bg-olive-hover"
              >
                Show {products.length}{" "}
                {products.length === 1 ? "product" : "products"}
              </button>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  );
}

function PillButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-10 rounded-full border px-4 text-[14px] whitespace-nowrap transition ${active ? "border-olive bg-olive text-cream" : "border-line-strong bg-transparent hover:border-ink"}`}
    >
      {children}
    </button>
  );
}

function FilterPanel({
  filters,
  all,
  bounds,
  toggle,
  update,
  clearAll,
  activeCount,
}: {
  filters: Filters;
  all: Product[];
  bounds: { min: number; max: number };
  toggle: (key: ListKey, value: string) => void;
  update: (changes: Record<string, string>) => void;
  clearAll: () => void;
  activeCount: number;
}) {
  // Each count shows what that option would return with the other groups applied.
  const count = (key: ListKey, test: (p: Product) => boolean) =>
    applyFilters(all, filters, key).filter(test).length;
  const families = getFamilies().filter((f) =>
    all.some((p) => p.families.includes(f.slug)),
  );
  return (
    <div>
      <div className="flex items-baseline justify-between border-b border-line pb-4">
        <p className="font-serif text-[26px] leading-none">Filters</p>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-[14px] underline underline-offset-4 hover:text-ink-soft"
          >
            Clear all
          </button>
        )}
      </div>

      <Group title="Gender">
        {(Object.keys(GENDERS) as Gender[]).map((g) => (
          <Check
            key={g}
            label={GENDERS[g].label}
            count={count("gender", (p) => p.profile.gender === g)}
            checked={filters.gender.includes(g)}
            onChange={() => toggle("gender", g)}
          />
        ))}
      </Group>
      <Group title="Fragrance Family">
        {families.map((f) => (
          <Check
            key={f.slug}
            label={f.name}
            count={count("family", (p) =>
              p.families.includes(f.slug as FamilySlug),
            )}
            checked={filters.family.includes(f.slug)}
            onChange={() => toggle("family", f.slug)}
          />
        ))}
      </Group>
      <Group title="Occasion">
        {(Object.keys(OCCASIONS) as Occasion[]).map((o) => (
          <Check
            key={o}
            label={OCCASIONS[o].label}
            count={count("occasion", (p) => p.profile.occasions.includes(o))}
            checked={filters.occasion.includes(o)}
            onChange={() => toggle("occasion", o)}
          />
        ))}
      </Group>
      <Group title="Season">
        {(Object.keys(SEASONS) as Season[]).map((s) => (
          <Check
            key={s}
            label={SEASONS[s].label}
            count={count("season", (p) => p.profile.seasons.includes(s))}
            checked={filters.season.includes(s)}
            onChange={() => toggle("season", s)}
          />
        ))}
      </Group>
      <Group title="Price Range (EGP)" last>
        <PriceRange
          bounds={bounds}
          min={filters.min}
          max={filters.max}
          onChange={(min, max) =>
            update({
              min: min === bounds.min ? "" : String(min),
              max: max === bounds.max ? "" : String(max),
            })
          }
        />
      </Group>
    </div>
  );
}

function Group({
  title,
  children,
  last,
}: {
  title: string;
  children: ReactNode;
  last?: boolean;
}) {
  const [open, setOpen] = useState(true);
  return (
    <section className={`py-4 ${last ? "" : "border-b border-line"}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-left text-[16px] font-medium"
      >
        {title}
        <ChevronDown
          className={`size-[18px] transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={1.5}
        />
      </button>
      {open && <div className="mt-3 space-y-0.5">{children}</div>}
    </section>
  );
}

function Check({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3.5 rounded-md py-1.5 text-[15px] text-ink-soft transition hover:text-ink ${count === 0 && !checked ? "opacity-45" : ""}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className="grid size-[19px] shrink-0 place-items-center rounded-[4px] border border-line-strong bg-cream transition peer-checked:border-olive peer-checked:bg-olive peer-focus-visible:outline-2 peer-focus-visible:outline-olive"
      >
        <svg
          viewBox="0 0 12 12"
          className={`size-3 text-cream ${checked ? "" : "invisible"}`}
        >
          <path
            d="M2.5 6.2l2.3 2.3L9.5 3.8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="flex-1">{label}</span>
      <span className="text-[13.5px] text-muted tabular-nums">({count})</span>
    </label>
  );
}

function PriceRange({
  bounds,
  min,
  max,
  onChange,
}: {
  bounds: { min: number; max: number };
  min: number | null;
  max: number | null;
  onChange: (min: number, max: number) => void;
}) {
  const lo = Math.max(bounds.min, min ?? bounds.min);
  const hi = Math.min(bounds.max, max ?? bounds.max);
  const span = bounds.max - bounds.min || 1;
  const pct = (v: number) => ((v - bounds.min) / span) * 100;
  const thumb =
    "pointer-events-none absolute inset-0 h-5 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-olive [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-olive";
  const box = (label: string, value: number, set: (v: number) => void) => (
    <label className="flex-1">
      <span className="sr-only">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        min={bounds.min}
        max={bounds.max}
        step={50}
        onChange={(e) => set(Number(e.target.value) || 0)}
        className="h-11 w-full rounded-lg border border-line bg-cream px-3.5 text-[14px] outline-none focus:border-olive"
      />
    </label>
  );
  return (
    <div>
      <div className="relative mx-1 h-5">
        <span className="absolute top-1/2 h-[2px] w-full -translate-y-1/2 rounded bg-line-strong" />
        <span
          className="absolute top-1/2 h-[2px] -translate-y-1/2 rounded bg-olive"
          style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}
        />
        <input
          type="range"
          aria-label="Minimum price"
          min={bounds.min}
          max={bounds.max}
          step={50}
          value={lo}
          onChange={(e) => onChange(Math.min(Number(e.target.value), hi), hi)}
          className={thumb}
        />
        <input
          type="range"
          aria-label="Maximum price"
          min={bounds.min}
          max={bounds.max}
          step={50}
          value={hi}
          onChange={(e) => onChange(lo, Math.max(Number(e.target.value), lo))}
          className={thumb}
        />
      </div>
      <div className="mt-4 flex gap-3">
        {box("Minimum price", lo, (v) => onChange(Math.min(v, hi), hi))}
        {box("Maximum price", hi, (v) => onChange(lo, Math.max(v, lo)))}
      </div>
    </div>
  );
}

function TryFirstBanner() {
  return (
    <div className="mt-12 grid items-center gap-6 overflow-hidden rounded-xl bg-olive p-8 text-cream sm:grid-cols-[1fr_auto] lg:mt-16 lg:p-10">
      <div>
        <p className="text-[12px] tracking-[0.3em] text-cream/70 uppercase">
          Not sure yet?
        </p>
        <p className="mt-2 font-serif text-[30px] leading-[1.1] sm:text-[36px]">
          Try any scent in 10 ML for 60 EGP.
        </p>
        <p className="mt-2 max-w-lg text-[15px] text-cream/75">
          Live with it for a few days — then commit to the full bottle.
        </p>
      </div>
      <Link
        to="/finder"
        className="inline-flex h-[50px] items-center justify-center rounded-[3px] border border-cream/70 px-8 text-[12px] font-medium tracking-[0.12em] uppercase transition hover:bg-cream hover:text-olive"
      >
        Find your scent
      </Link>
    </div>
  );
}
