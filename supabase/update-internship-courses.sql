-- Run this once on an existing Supabase project to replace the old sample
-- courses with the three internship courses used by the website.

delete from public.courses
where title in (
  'Complete Data Science Bootcamp',
  'Machine Learning A-Z',
  'Frontend Development Internship',
  'Backend Development Internship',
  'Data Science Internship'
);

insert into public.courses (title, description, domain, duration, instructor_name, instructor_bio) values
(
  'Frontend Development Internship',
  'An 8-week internship track focused on HTML, CSS, JavaScript, React, responsive UI, component architecture, and portfolio-ready frontend projects.',
  'Frontend Development',
  '8 weeks',
  'Margros Frontend Mentor',
  'Frontend engineering mentor with practical experience building responsive, production-ready web interfaces.'
),
(
  'Backend Development Internship',
  'An 8-week internship track covering APIs, databases, authentication, server-side architecture, deployment basics, and real-world backend project workflows.',
  'Backend Development',
  '8 weeks',
  'Margros Backend Mentor',
  'Backend engineering mentor experienced in designing secure APIs, data models, and scalable application services.'
),
(
  'Data Science Internship',
  'An 8-week internship track covering Python, data cleaning, visualization, statistics, machine learning fundamentals, and practical data projects.',
  'Data Science',
  '8 weeks',
  'Margros Data Science Mentor',
  'Data science mentor with hands-on experience turning raw datasets into insights, models, and business-ready analysis.'
);

insert into public.course_weeks (course_id, week_number, title)
select id, week_number, title
from public.courses
cross join (
  values
    (1, 'Orientation and fundamentals'),
    (2, 'Core tools and workflow'),
    (3, 'Hands-on practice module 1'),
    (4, 'Hands-on practice module 2'),
    (5, 'Project planning'),
    (6, 'Project implementation'),
    (7, 'Review and refinement'),
    (8, 'Final submission and certification prep')
) as weeks(week_number, title)
where public.courses.title in (
  'Frontend Development Internship',
  'Backend Development Internship',
  'Data Science Internship'
);
