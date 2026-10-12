-- Execute only on an isolated database. These tests simulate JWT claims in SQL;
-- tests/integration/student-identity.mjs separately tests real user JWT requests.
begin;
select plan(4);
insert into auth.users(id,email,role,aud,email_confirmed_at)
values('11111111-1111-4111-8111-111111111111','unverified-rls@example.test','authenticated','authenticated',null);
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}',true);
select throws_ok(
 $$select public.save_student_profile('Student','Nigeria','Lagos',null,'Science','100','',array[]::uuid[],'private',false)$$,
 '42501','Verified authentication required','unverified JWT cannot save a profile');
select is((select count(*) from public.student_directory_entry('11111111-1111-4111-8111-111111111111')),0::bigint,'unverified JWT cannot read directory');
select is(public.has_role('moderator'),false,'unassigned user has no moderator role');
select is(public.is_staff(),false,'unassigned user cannot become staff through claims');
reset role;
select * from finish();
rollback;
