-- Store the clinician who actually reviewed a CMS article.
-- NULL means no medical reviewer has been assigned; never infer one from the author.
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS medical_reviewer_key text;

COMMENT ON COLUMN public.blog_posts.medical_reviewer_key IS
  'Team-member initials for the clinician who medically reviewed this article; NULL when not reviewed.';
