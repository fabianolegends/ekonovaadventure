-- Perfil individual da equipe e foto de identificação.
alter table public.team_members add column if not exists avatar_url text;

insert into storage.buckets (id, name, public)
values ('team-avatars', 'team-avatars', true)
on conflict (id) do update set public = true;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'team members manage own avatar') then
    create policy "team members manage own avatar" on storage.objects
      for all to authenticated
      using (bucket_id = 'team-avatars' and (storage.foldername(name))[1] = auth.uid()::text)
      with check (bucket_id = 'team-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;
end $$;
