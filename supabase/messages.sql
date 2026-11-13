create table public.messages (
  id bigint generated always as identity primary key,
  author text not null,
  body text not null check (char_length(btrim(body)) between 1 and 500),
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;
revoke all on public.messages from anon, authenticated;
grant select on public.messages to anon, authenticated;
create policy "Anyone can read messages" on public.messages for select using (true);

create function public.post_guestbook_message(message_body text)
returns setof public.messages
language plpgsql security definer set search_path = ''
as $$
declare
  github_login text;
begin
  select identity_data ->> 'user_name'
    into github_login
    from auth.identities
   where user_id = auth.uid() and provider = 'github'
   limit 1;

  if github_login is null or github_login !~ '^[A-Za-z0-9-]{1,39}$' then
    raise exception 'GitHub sign-in required' using errcode = '42501';
  end if;

  return query
    insert into public.messages (author, body)
    values (github_login, btrim(message_body))
    returning *;
end;
$$;

revoke execute on function public.post_guestbook_message(text) from public, anon;
grant execute on function public.post_guestbook_message(text) to authenticated;
