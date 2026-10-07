import type { WearVideo } from "../types";

/**
 * Demo "Wear report" videos, used when the site runs without WordPress.
 * With WordPress connected they come from Products → Videos.
 */
const files = import.meta.glob<string>("../assets/videos/*", {
  eager: true,
  import: "default",
});
const file = (name: string) => files[`../assets/videos/${name}`];

export const videos: WearVideo[] = [
  {
    id: 1,
    title: "Vanilla Oud",
    tags: "Warm · Bold · Evening",
    slug: "vanilla-oud",
    productId: 101,
  },
  {
    id: 2,
    title: "Citrus Leather",
    tags: "Fresh · Clean · Daytime",
    slug: "citrus-leather",
    productId: 103,
  },
  {
    id: 3,
    title: "Rose Noir",
    tags: "Floral · Dark · Layered",
    slug: "rose-noir",
    productId: 102,
  },
  {
    id: 4,
    title: "Deep Current",
    tags: "Aquatic · Cool · Everyday",
    slug: "deep-current",
    productId: 104,
  },
].map(({ slug, ...v }) => ({
  ...v,
  label: "Rfaheya Wear Report",
  src: file(`${slug}.mp4`),
  poster: file(`${slug}-poster.webp`),
}));
