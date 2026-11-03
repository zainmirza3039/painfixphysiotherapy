-- PainFix production repair: contact message workflow + team blog author permissions.
-- Review and run once in Supabase SQL Editor for project vagsksstptqqcloccavs.
-- Idempotent: safe to rerun.

BEGIN;

-- 1) Contact inbox status column used by /admin/messages.
ALTER TABLE public.contact_submissions
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new';

UPDATE public.contact_submissions
SET status = 'new'
WHERE status IS NULL OR status = 'unread';

ALTER TABLE public.contact_submissions
  ALTER COLUMN status SET DEFAULT 'new',
  ALTER COLUMN status SET NOT NULL;

-- Keep contact submissions private; only administrators can read/manage them.
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read contact messages" ON public.contact_submissions;
CREATE POLICY "Admins can read contact messages"
  ON public.contact_submissions FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update contact messages" ON public.contact_submissions;
CREATE POLICY "Admins can update contact messages"
  ON public.contact_submissions FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete contact messages" ON public.contact_submissions;
CREATE POLICY "Admins can delete contact messages"
  ON public.contact_submissions FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- Preserve public form submission, but do not grant public reads.
GRANT INSERT (name, email, phone, message)
  ON TABLE public.contact_submissions TO anon, authenticated;
GRANT SELECT, DELETE ON TABLE public.contact_submissions TO authenticated;
REVOKE UPDATE ON TABLE public.contact_submissions FROM authenticated;
GRANT UPDATE (status) ON TABLE public.contact_submissions TO authenticated;

-- 2) Team blog authors: admins manage all posts; content-capable team members
-- manage only rows whose author_id is their own auth.uid().
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read all posts" ON public.blog_posts;
CREATE POLICY "Admins can read all posts"
  ON public.blog_posts FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can write posts" ON public.blog_posts;
CREATE POLICY "Admins can write posts"
  ON public.blog_posts FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Authors can read own posts" ON public.blog_posts;
CREATE POLICY "Authors can read own posts"
  ON public.blog_posts FOR SELECT TO authenticated
  USING (author_id = auth.uid() AND public.can_edit_content(auth.uid()));

DROP POLICY IF EXISTS "Authors can manage own posts" ON public.blog_posts;
CREATE POLICY "Authors can manage own posts"
  ON public.blog_posts FOR ALL TO authenticated
  USING (author_id = auth.uid() AND public.can_edit_content(auth.uid()))
  WITH CHECK (author_id = auth.uid() AND public.can_edit_content(auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.blog_posts TO authenticated;
GRANT SELECT ON TABLE public.blog_posts TO anon;

-- Tell PostgREST to refresh its schema cache after the column change.
NOTIFY pgrst, 'reload schema';

COMMIT;
