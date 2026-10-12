-- Student identity: private base rows, opt-in minimal projection and atomic writes.
begin;
create table public.student_consents (
  user_id uuid primary key references auth.users(id) on delete cascade,
  terms_version text not null, privacy_version text not null,
  terms_effective_date date not null, privacy_effective_date date not null,
  terms_url text not null, privacy_url text not null,
  accepted_at timestamptz not null default now()
);
alter table public.student_consents enable row level security;
create policy "read own consent" on public.student_consents for select to authenticated using(user_id=auth.uid());
revoke all on public.student_consents from anon, authenticated;
grant select on public.student_consents to authenticated;

-- Snapshot signup consent once; later user_metadata edits cannot alter the receipt.
create function public.capture_student_consent() returns trigger language plpgsql security definer set search_path='' as $$
begin
  if new.raw_user_meta_data->>'consent_accepted' = 'true'
    and length(new.raw_user_meta_data->>'consent_terms_version') between 1 and 200
    and length(new.raw_user_meta_data->>'consent_privacy_version') between 1 and 200
    and new.raw_user_meta_data->>'consent_terms_effective_date' ~ '^\d{4}-\d{2}-\d{2}$'
    and new.raw_user_meta_data->>'consent_privacy_effective_date' ~ '^\d{4}-\d{2}-\d{2}$'
    and new.raw_user_meta_data->>'consent_terms_url' like 'https://%'
    and new.raw_user_meta_data->>'consent_privacy_url' like 'https://%' then
    insert into public.student_consents(user_id,terms_version,privacy_version,terms_effective_date,privacy_effective_date,terms_url,privacy_url)
    values(new.id,new.raw_user_meta_data->>'consent_terms_version',new.raw_user_meta_data->>'consent_privacy_version',
      (new.raw_user_meta_data->>'consent_terms_effective_date')::date,(new.raw_user_meta_data->>'consent_privacy_effective_date')::date,new.raw_user_meta_data->>'consent_terms_url',new.raw_user_meta_data->>'consent_privacy_url');
  end if;
  return new;
end $$;
create trigger capture_student_consent after insert on auth.users for each row execute function public.capture_student_consent();
revoke all on function public.capture_student_consent() from public;

-- Earlier UI set completion without persisting normalized institution/interests.
update public.profiles p set onboarding_complete=false where onboarding_complete and (
  length(trim(coalesce(full_name,'')))<2 or length(trim(coalesce(country,'')))<2
  or length(trim(coalesce(city,'')))<2 or length(trim(coalesce(programme,'')))<2
  or length(trim(coalesce(study_level,'')))<1 or institution_id is null
  or not exists(select 1 from public.user_interests i where i.user_id=p.id));

-- Completed profiles were previously readable in full by every authenticated user.
drop policy "profiles authenticated read" on public.profiles;
create policy "profiles owner read" on public.profiles for select to authenticated using(id=auth.uid());
revoke insert, update, delete on public.profiles from authenticated;
revoke insert, update, delete on public.user_interests from authenticated;
revoke insert, update, delete on public.institutions, public.interests, public.roles, public.user_roles from authenticated;
revoke all on public.profiles, public.user_interests, public.student_consents from anon;

create function public.save_student_profile(
  p_full_name text, p_country text, p_city text, p_institution_id uuid,
  p_programme text, p_study_level text, p_biography text, p_interest_ids uuid[],
  p_directory text, p_complete boolean
) returns void language plpgsql security definer set search_path='' as $$
declare uid uuid := auth.uid(); already_complete boolean;
begin
  if uid is null or not exists(select 1 from auth.users where id=uid and email_confirmed_at is not null) then
    raise exception 'Verified authentication required' using errcode='42501';
  end if;
  -- Serialize retries/concurrent edits for the same identity, including first insert.
  perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
  select onboarding_complete into already_complete from public.profiles where id=uid;
  if p_complete is null or p_directory is null or p_directory not in ('private','students') or p_interest_ids is null
    or length(coalesce(p_full_name,'')) > 150 or length(coalesce(p_country,'')) > 100
    or length(coalesce(p_city,'')) > 150 or length(coalesce(p_programme,'')) > 200
    or length(coalesce(p_study_level,'')) > 100 or length(coalesce(p_biography,'')) > 300
    or cardinality(p_interest_ids)>30 then raise exception 'Invalid profile values' using errcode='22023'; end if;
  if p_institution_id is not null and not exists(select 1 from public.institutions where id=p_institution_id) then
    raise exception 'Choose an existing institution' using errcode='22023'; end if;
  if exists(select 1 from unnest(p_interest_ids) x where x is null or not exists(select 1 from public.interests i where i.id=x)) then
    raise exception 'Choose existing interests' using errcode='22023'; end if;
  if p_complete or coalesce(already_complete,false) then
    if length(trim(coalesce(p_full_name,'')))<2 or length(trim(coalesce(p_country,'')))<2
      or length(trim(coalesce(p_city,'')))<2 or length(trim(coalesce(p_programme,'')))<2
      or length(trim(coalesce(p_study_level,'')))<1 or p_institution_id is null or cardinality(p_interest_ids)<1 then
      raise exception 'Complete all required profile fields' using errcode='22023'; end if;
  end if;
  insert into public.profiles(id,full_name,country,city,institution_id,programme,study_level,biography,visibility,onboarding_complete)
  values(uid,trim(coalesce(p_full_name,'')),trim(coalesce(p_country,'')),trim(coalesce(p_city,'')),p_institution_id,
    trim(coalesce(p_programme,'')),trim(coalesce(p_study_level,'')),coalesce(p_biography,''),jsonb_build_object('directory',p_directory),p_complete)
  on conflict(id) do update set full_name=excluded.full_name,country=excluded.country,city=excluded.city,
    institution_id=excluded.institution_id,programme=excluded.programme,study_level=excluded.study_level,
    biography=excluded.biography,visibility=excluded.visibility,
    onboarding_complete=public.profiles.onboarding_complete or excluded.onboarding_complete;
  delete from public.user_interests where user_id=uid;
  insert into public.user_interests(user_id,interest_id) select uid,x from (select distinct unnest(p_interest_ids) x) s;
end $$;
revoke all on function public.save_student_profile(text,text,text,uuid,text,text,text,uuid[],text,boolean) from public;
grant execute on function public.save_student_profile(text,text,text,uuid,text,text,text,uuid[],text,boolean) to authenticated;

-- No email, location, institution, interests, account or deletion metadata in the projection.
create function public.student_directory_entry(p_user_id uuid)
returns table(id uuid, full_name text, biography text) language sql stable security definer set search_path='' as $$
 select p.id,p.full_name,p.biography from public.profiles p
 where auth.uid() is not null and exists(select 1 from auth.users u where u.id=auth.uid() and u.email_confirmed_at is not null)
 and p.id=p_user_id and p.onboarding_complete and p.visibility->>'directory'='students'
$$;
revoke all on function public.student_directory_entry(uuid) from public;
grant execute on function public.student_directory_entry(uuid) to authenticated;
create function public.request_student_deletion() returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 update public.profiles set deletion_requested_at=now() where id=auth.uid();
 if not found then raise exception 'Profile not found'; end if;
end $$;
revoke all on function public.request_student_deletion() from public;
grant execute on function public.request_student_deletion() to authenticated;
commit;
