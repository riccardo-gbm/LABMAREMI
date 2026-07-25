-- 0003_product_images_bucket.sql — LABMAREMI Phase 2, P4
-- Public Storage bucket for product photos.
-- Run in the Supabase SQL editor AFTER 0002.

-- Public bucket: object URLs under /storage/v1/object/public/product-images/…
-- are served without auth, which is what the public catalog needs.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

-- Writes stay admin-only. (The service role bypasses RLS, so the upload script
-- works either way; these policies let a signed-in admin upload too.)
do $$ begin
  create policy "product-images admin write"
    on storage.objects for insert to authenticated
    with check (bucket_id = 'product-images');
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "product-images admin update"
    on storage.objects for update to authenticated
    using (bucket_id = 'product-images')
    with check (bucket_id = 'product-images');
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "product-images admin delete"
    on storage.objects for delete to authenticated
    using (bucket_id = 'product-images');
exception when duplicate_object then null;
end $$;
