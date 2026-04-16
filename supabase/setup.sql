-- ============================================================
-- TABLES
-- ============================================================

create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  name text not null,
  phone text,
  role text not null default 'student' check (role in ('student', 'admin')),
  degree text,
  field_of_study text,
  current_status text check (current_status in ('student', 'professional')),
  city text,
  legal_name text,
  created_at timestamptz default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  domain text not null,
  duration text not null default '8 weeks',
  instructor_name text not null,
  instructor_bio text not null default '',
  thumbnail_url text,
  created_at timestamptz default now()
);

create table public.course_weeks (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade not null,
  week_number int not null,
  title text not null
);

create table public.week_videos (
  id uuid primary key default gen_random_uuid(),
  week_id uuid references public.course_weeks(id) on delete cascade not null,
  title text not null,
  storage_path text not null,
  duration_seconds int,
  order_index int not null default 0
);

create table public.week_assignments (
  id uuid primary key default gen_random_uuid(),
  week_id uuid references public.course_weeks(id) on delete cascade not null,
  type text not null check (type in ('mcq', 'dev_task', 'case_study', 'short_answer')),
  prompt text not null,
  options jsonb,
  correct_option int,
  max_score int not null default 100,
  release_date timestamptz,
  order_index int not null default 0
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  certificate_status text not null default 'not_eligible'
    check (certificate_status in ('not_eligible', 'eligible', 'requested', 'issued')),
  requested_at timestamptz default now(),
  approved_at timestamptz,
  certificate_issued_at timestamptz,
  unique(user_id, course_id)
);

create table public.video_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  video_id uuid references public.week_videos(id) on delete cascade not null,
  enrollment_id uuid references public.enrollments(id) on delete cascade not null,
  percent_watched numeric default 0,
  watched boolean default false,
  completed_at timestamptz,
  unique(user_id, video_id)
);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  enrollment_id uuid references public.enrollments(id) on delete cascade not null,
  assignment_id uuid references public.week_assignments(id) on delete cascade not null,
  response text,
  file_url text,
  auto_score numeric,
  manual_score numeric,
  admin_feedback text,
  submitted_at timestamptz default now(),
  graded_at timestamptz,
  unique(user_id, assignment_id)
);

-- ============================================================
-- TRIGGER: Auto-create user profile on signup
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- users table
alter table public.users enable row level security;
create policy "users_own_read_write" on public.users
  for all using (auth.uid() = id);
create policy "admin_read_all_users" on public.users
  for select using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- courses: public read, admin write
alter table public.courses enable row level security;
create policy "courses_public_read" on public.courses for select using (true);
create policy "courses_admin_write" on public.courses for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- course_weeks
alter table public.course_weeks enable row level security;
create policy "weeks_public_read" on public.course_weeks for select using (true);
create policy "weeks_admin_write" on public.course_weeks for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- week_videos
alter table public.week_videos enable row level security;
create policy "videos_public_read" on public.week_videos for select using (true);
create policy "videos_admin_write" on public.week_videos for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- week_assignments
alter table public.week_assignments enable row level security;
create policy "assignments_public_read" on public.week_assignments for select using (true);
create policy "assignments_admin_write" on public.week_assignments for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- enrollments
alter table public.enrollments enable row level security;
create policy "enrollments_own_read" on public.enrollments
  for select using (auth.uid() = user_id);
create policy "enrollments_own_insert" on public.enrollments
  for insert with check (auth.uid() = user_id);
create policy "enrollments_admin_all" on public.enrollments for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- video_progress
alter table public.video_progress enable row level security;
create policy "vp_own" on public.video_progress
  for all using (auth.uid() = user_id);
create policy "vp_admin_read" on public.video_progress for select using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- submissions
alter table public.submissions enable row level security;
create policy "sub_own_read" on public.submissions
  for select using (auth.uid() = user_id);
create policy "sub_own_insert" on public.submissions
  for insert with check (auth.uid() = user_id);
create policy "sub_admin_all" on public.submissions for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- ============================================================
-- SEED DATA: 1 admin + 2 sample courses with 8 weeks each
-- ============================================================

insert into public.courses (title, description, domain, duration, instructor_name, instructor_bio) values
(
  'Complete Data Science Bootcamp',
  'A comprehensive 8-week program covering Python, statistics, data wrangling, visualization, and machine learning fundamentals. Build real-world projects and earn a professional certificate.',
  'Data Science',
  '8 weeks',
  'Dr. Sarah Ahmed',
  'Data Scientist with 10+ years of industry experience at top tech firms. PhD in Statistics from IIT Delhi.'
),
(
  'Machine Learning A-Z',
  'Master machine learning from scratch — supervised learning, unsupervised learning, neural networks, and model deployment. Hands-on with Python and scikit-learn throughout.',
  'Machine Learning',
  '8 weeks',
  'Prof. Arjun Mehta',
  'ML Engineer and researcher with publications in top-tier AI conferences. Former lead at a Series B AI startup.'
);

-- Insert 8 weeks for each course (run after courses are inserted)
insert into public.course_weeks (course_id, week_number, title)
select id, generate_series(1,8), 'Week ' || generate_series(1,8)
from public.courses;
