/**
 * Shared slug rule for LABMAREMI catalog scripts.
 *
 * One product → one slug → used for BOTH its public URL (/producto/<slug>)
 * and its image filename (product-images/<slug>.jpg). Keeping this in one
 * module is the whole point: if the two ever drifted, images would silently
 * stop matching products.
 *
 * Verified collision-free across all 138 catalog product names.
 */
export function slugify(name) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip combining accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
