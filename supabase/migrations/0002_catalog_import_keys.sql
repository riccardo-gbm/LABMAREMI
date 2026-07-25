-- 0002_catalog_import_keys.sql — LABMAREMI Phase 2, P4
-- Natural-key uniqueness so the catalog import (scripts/import-catalog.mjs)
-- can upsert instead of insert, making it safe to re-run.
-- Run in the Supabase SQL editor AFTER 0001.

-- categories.slug is already unique (0001). Name must be unique too, because
-- the CSV links products to categories by NAME, not slug.
create unique index if not exists categories_name_key on categories (name);

create unique index if not exists business_types_name_key on business_types (name);

-- Product names are the natural key from the catalog CSV. Verified unique
-- across all 138 rows before adding this.
create unique index if not exists products_name_key on products (name);
