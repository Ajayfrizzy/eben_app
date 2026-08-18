-- Authors may edit content, but moderation state and pinning remain staff-controlled.
revoke update on public.posts from authenticated;
grant update(body, deleted_at, updated_at) on public.posts to authenticated;

revoke update on public.comments from authenticated;
grant update(body, deleted_at, updated_at) on public.comments to authenticated;

-- Prevent a user from changing another user's RSVP while retaining programme oversight.
drop policy if exists "own rsvps" on public.event_rsvps;
create policy "own rsvps read" on public.event_rsvps for select to authenticated
using(user_id=auth.uid() or public.has_role('programme_manager') or public.has_role('admin') or public.has_role('super_admin'));
create policy "own rsvps insert" on public.event_rsvps for insert to authenticated
with check(user_id=auth.uid());
create policy "own rsvps update" on public.event_rsvps for update to authenticated
using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "own rsvps delete" on public.event_rsvps for delete to authenticated
using(user_id=auth.uid());
