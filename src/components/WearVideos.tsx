import {
  ChevronLeft,
  ChevronRight,
  Play,
  ShoppingBag,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  familyName,
  findProductById,
  fullSizeVariations,
  getVideos,
  sampleVariation,
} from "../api/catalog";
import { formatPrice } from "../lib/format";
import { profileChips } from "../lib/profile";
import { useCart } from "../store/cart";
import type { WearVideo } from "../types";
import { Carousel } from "./Carousel";
import { BottleIcon } from "./Icons";
import { Overlay } from "./Overlay";

/** Plays muted while on screen (cards), paused otherwise. */
function useAutoplay(ref: React.RefObject<HTMLVideoElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
}

export function WearVideoCard({
  video,
  index,
  onOpen,
}: {
  video: WearVideo;
  index: number;
  onOpen: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  useAutoplay(ref);
  const product = findProductById(video.productId);
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Play ${video.title}`}
      className="group relative block aspect-[9/16] w-full overflow-hidden rounded-[6px] bg-ink text-left ring-1 ring-white/10"
    >
      <video
        ref={ref}
        src={video.src}
        poster={video.poster || product?.images[0].src}
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
      />
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/45 to-transparent"
      />
      {product && (
        <img
          src={product.images[0].src}
          alt=""
          className="absolute right-3 bottom-[118px] size-14 rounded-[4px] border-2 border-white object-cover shadow-lg sm:size-16"
        />
      )}
      <span className="absolute inset-x-3 bottom-3 flex items-end gap-3 rounded-[4px] bg-[#f4f1ec] px-4 py-3.5 shadow-lg">
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2 text-[8.5px] font-semibold tracking-[0.1em] text-ink-soft uppercase">
            <span className="truncate">{video.label}</span>
            <span className="tracking-normal">
              {String(index + 1).padStart(2, "0")}
            </span>
          </span>
          <span className="mt-1 block truncate text-[17px] leading-tight font-medium text-ink">
            {video.title}
          </span>
          {video.tags && (
            <span className="mt-1 block truncate text-[9.5px] font-semibold tracking-[0.14em] text-ink-soft uppercase">
              {video.tags}
            </span>
          )}
        </span>
        <span className="grid size-10 shrink-0 place-items-center rounded-[3px] bg-ink text-white transition group-hover:bg-olive">
          <Play className="size-4 fill-current" strokeWidth={0} />
        </span>
      </span>
    </button>
  );
}

/** "Wear reports" carousel (home page / product page). Hidden when there are no videos. */
export function WearVideosSection({
  productId,
  title = "Worn by you.",
}: {
  productId?: number;
  title?: string;
}) {
  const videos = getVideos(productId);
  const [open, setOpen] = useState<number | null>(null);
  if (videos.length === 0) return null;
  return (
    <section
      aria-labelledby="wear-title"
      className="bg-[#16120d] py-12 text-cream lg:py-16"
    >
      <div className="container-x">
        <p className="text-[12px] tracking-[0.3em] text-cream/65 uppercase sm:text-[14px]">
          Rfaheya wear reports
        </p>
        <h2
          id="wear-title"
          className="mt-2 font-serif text-[36px] leading-[1.05] sm:text-[48px]"
        >
          {title}
        </h2>
        <div className="mt-8">
          <Carousel
            label="Wear report videos"
            itemLabel="video"
            items={videos}
            getKey={(v) => v.id}
            renderItem={(v) => (
              <WearVideoCard
                video={v}
                index={videos.indexOf(v)}
                onOpen={() => setOpen(videos.indexOf(v))}
              />
            )}
            perViewFor={(w) =>
              w >= 1180 ? 5 : w >= 860 ? 4 : w >= 560 ? 2.6 : 1.6
            }
            arrowTop="50%"
            gap={14}
          />
        </div>
      </div>
      {open != null && (
        <VideoModal
          videos={videos}
          index={open}
          onIndex={setOpen}
          onClose={() => setOpen(null)}
        />
      )}
    </section>
  );
}

/** Full video with sound, plus the product's details and add to cart. */
export function VideoModal({
  videos,
  index,
  onIndex,
  onClose,
}: {
  videos: WearVideo[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const video = videos[index];
  const product = findProductById(video.productId);
  const cart = useCart();
  const [muted, setMuted] = useState(false);
  const sizes = product ? fullSizeVariations(product) : [];
  const sample = product ? sampleVariation(product) : undefined;
  const [variationId, setVariationId] = useState<number | undefined>(undefined);
  const selected =
    sizes.find((v) => v.id === variationId) ??
    sizes.find((v) => v.inStock) ??
    sizes[0];
  const go = (d: number) => {
    setVariationId(undefined);
    onIndex((index + d + videos.length) % videos.length);
  };

  return (
    <Overlay onClose={onClose} label={`${video.title} video`}>
      <div
        className="absolute inset-0 overflow-y-auto sm:grid sm:place-items-center sm:p-6"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="relative mx-auto flex w-full max-w-[920px] flex-col overflow-hidden bg-cream text-ink shadow-2xl [animation:pop-in_.25s_ease-out] sm:max-h-[min(88vh,820px)] sm:flex-row sm:rounded-xl">
          <div className="relative aspect-[9/16] max-h-[78vh] w-full shrink-0 bg-black sm:aspect-auto sm:max-h-none sm:w-[min(46%,420px)]">
            <video
              key={video.id}
              src={video.src}
              poster={video.poster || product?.images[0].src}
              autoPlay
              loop
              playsInline
              muted={muted}
              controls={false}
              className="absolute inset-0 size-full object-cover"
            />
            <button
              type="button"
              onClick={() => setMuted(!muted)}
              aria-label={muted ? "Unmute" : "Mute"}
              className="absolute bottom-3 left-3 grid size-10 place-items-center rounded-full bg-black/45 text-white backdrop-blur hover:bg-black/60"
            >
              {muted ? (
                <VolumeX className="size-5" strokeWidth={1.5} />
              ) : (
                <Volume2 className="size-5" strokeWidth={1.5} />
              )}
            </button>
            {videos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous video"
                  className="absolute top-1/2 left-2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-ink hover:bg-white"
                >
                  <ChevronLeft className="size-5" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next video"
                  className="absolute top-1/2 right-2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-ink hover:bg-white"
                >
                  <ChevronRight className="size-5" strokeWidth={1.5} />
                </button>
              </>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col overflow-y-auto p-5 sm:p-7">
            <p className="pr-10 text-[10.5px] font-semibold tracking-[0.2em] text-ink-soft uppercase">
              {video.label}
            </p>
            <h2 className="mt-1 pr-10 text-[22px] leading-tight font-medium">
              {video.title}
            </h2>
            {video.tags && (
              <p className="mt-1 text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
                {video.tags}
              </p>
            )}

            {product && (
              <div className="mt-5 border-t border-line pt-5">
                <div className="flex gap-4">
                  <img
                    src={product.images[0].src}
                    alt=""
                    className="size-20 shrink-0 rounded-md object-cover"
                  />
                  <div className="min-w-0">
                    <p className="font-serif text-[22px] leading-none uppercase">
                      {product.name}
                    </p>
                    <p className="mt-1.5 text-[14px] text-ink-soft">
                      {product.tagline}
                    </p>
                    {product.inspiredBy && (
                      <p className="mt-1 text-[12.5px] text-muted">
                        <span className="font-medium tracking-[0.08em] text-ink-soft uppercase">
                          DNA
                        </span>{" "}
                        · {product.inspiredBy}
                      </p>
                    )}
                  </div>
                </div>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {profileChips(product, familyName).map(({ label, Icon }) => (
                    <li
                      key={label}
                      className="inline-flex items-center gap-1.5 rounded-full bg-chip px-2.5 py-1 text-[12px] text-ink-soft"
                    >
                      <Icon
                        className="size-3.5"
                        strokeWidth={1.4}
                        aria-hidden
                      />
                      {label}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-[11px] font-medium tracking-[0.16em] uppercase">
                  Fragrance notes
                </p>
                <ul className="mt-2 grid grid-cols-5 gap-1">
                  {product.notes.slice(0, 5).map((n) => (
                    <li
                      key={n.name}
                      className="flex flex-col items-center text-center"
                    >
                      <img
                        src={n.image}
                        alt=""
                        className="h-8 w-auto object-contain"
                      />
                      <span className="mt-0.5 w-full truncate text-[11px] text-ink-soft">
                        {n.name}
                      </span>
                    </li>
                  ))}
                </ul>

                {sizes.length > 0 && selected && (
                  <>
                    <p className="mt-5 text-[11px] font-medium tracking-[0.16em] uppercase">
                      Choose your size
                    </p>
                    <div
                      role="radiogroup"
                      aria-label="Size"
                      className="mt-2 grid grid-cols-3 gap-2"
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
                            className={`rounded-[4px] border px-2 py-2 text-center transition disabled:opacity-40 ${on ? "border-olive bg-olive text-cream" : "border-line-strong hover:border-ink"}`}
                          >
                            <span className="block text-[13px] font-semibold">
                              {v.size}
                            </span>
                            <span
                              className={`block text-[12px] ${on ? "text-cream/80" : "text-muted"}`}
                            >
                              {formatPrice(v.price)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <div
                      className={`mt-4 grid gap-2 ${sample ? "grid-cols-[1.4fr_1fr]" : ""}`}
                    >
                      <button
                        type="button"
                        onClick={() => cart.add(product.id, selected.id)}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-[3px] bg-olive text-[12px] font-medium tracking-[0.1em] text-cream uppercase hover:bg-olive-hover"
                      >
                        <ShoppingBag
                          className="size-[18px]"
                          strokeWidth={1.4}
                        />
                        Add to cart · {formatPrice(selected.price)}
                      </button>
                      {sample && (
                        <button
                          type="button"
                          onClick={() => cart.add(product.id, sample.id)}
                          disabled={!sample.inStock}
                          className="inline-flex h-12 items-center justify-center gap-1.5 rounded-[3px] border border-line-strong text-[11.5px] hover:border-ink"
                        >
                          <BottleIcon className="size-[18px]" />
                          <span className="font-semibold tracking-[0.04em] uppercase">
                            Try {sample.size}
                          </span>
                        </button>
                      )}
                    </div>
                  </>
                )}
                <Link
                  to={`/product/${product.slug}`}
                  onClick={onClose}
                  className="mt-4 block text-center text-[12px] tracking-[0.1em] text-muted uppercase underline-offset-4 hover:text-ink hover:underline"
                >
                  View full details
                </Link>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 z-10 grid size-10 place-items-center rounded-full bg-cream/90 text-ink shadow hover:bg-chip"
          >
            <X className="size-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </Overlay>
  );
}
