-- 0004_catalog_presentation.sql — LABMAREMI Phase 2, P5
-- Columns the public pages need that the P1 schema didn't model, plus a
-- readable URL key for products. Run in the Supabase SQL editor AFTER 0003.

-- Home renders each category's marketing copy and hero image. That copy lived
-- only in src/data/categories.ts; it moves into the DB here so the mock file
-- can be deleted without losing it.
alter table categories
  add column if not exists description text not null default '',
  add column if not exists image_url   text,
  add column if not exists image_alt   text;

alter table business_types
  add column if not exists description text not null default '';

-- Readable product URLs (/producto/lidex-alcohol-gel) instead of raw UUIDs.
-- Same slug the image uploader uses for filenames, so one product has one
-- identifier across the URL and its photo. Nullable here; the import script
-- backfills every row, and the unique index keeps it honest.
alter table products
  add column if not exists slug text;

create unique index if not exists products_slug_key on products (slug);
