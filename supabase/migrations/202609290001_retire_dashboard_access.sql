-- Retire dashboard access without deleting content or audit history.
begin;
drop policy if exists "user roles own read" on public.user_roles;
create policy "user roles own read" on public.user_roles for select to authenticated using(user_id=auth.uid());
drop policy if exists "channels admin manage" on public.channels;
drop policy if exists "published resources read" on public.resources;
create policy "published resources read" on public.resources for select to authenticated using(status='published' or created_by=auth.uid() or public.has_role('content_creator'));
drop policy if exists "content staff resources" on public.resources;
create policy "content staff resources" on public.resources for all to authenticated using(public.has_role('content_creator')) with check(public.has_role('content_creator'));
drop policy if exists "own resource views read" on public.resource_views;
create policy "own resource views read" on public.resource_views for select to authenticated using(user_id=auth.uid());
drop policy if exists "published events read" on public.events;
create policy "published events read" on public.events for select to authenticated using(status='published' or public.has_role('programme_manager'));
drop policy if exists "programme staff events" on public.events;
create policy "programme staff events" on public.events for all to authenticated using(public.has_role('programme_manager')) with check(public.has_role('programme_manager'));
drop policy if exists "published opportunities read" on public.opportunities;
create policy "published opportunities read" on public.opportunities for select to authenticated using(status='published' or public.has_role('content_creator'));
drop policy if exists "content staff opportunities" on public.opportunities;
create policy "content staff opportunities" on public.opportunities for all to authenticated using(public.has_role('content_creator')) with check(public.has_role('content_creator'));
drop policy if exists "admin audit read" on public.audit_logs;
drop policy if exists "settings admin manage" on public.app_settings;
drop policy if exists "own rsvps read" on public.event_rsvps;
create policy "own rsvps read" on public.event_rsvps for select to authenticated
using(user_id=auth.uid() or public.has_role('programme_manager'));
create or replace function public.is_staff() returns boolean stable language sql security definer set search_path=public as $$select public.has_role('moderator')$$;
delete from public.roles where name::text in ('admin', 'super_admin');
alter table public.roles add constraint supported_roles check (name::text not in ('admin', 'super_admin'));
commit;
