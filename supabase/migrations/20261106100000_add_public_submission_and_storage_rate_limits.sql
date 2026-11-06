-- Server-side rate limits for public forms and Storage uploads.
-- Reuses the existing persistent internship_public_rate_limits counter store.
-- Storage counters are private and enforced by a database trigger on object creation.

BEGIN;

CREATE OR REPLACE FUNCTION public.check_public_submission_rate_limit(
  p_kind text,
  p_rate_key text,
  p_secondary text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  global_ok boolean;
  client_ok boolean;
  subject_ok boolean;
  normalized_subject text;
BEGIN
  IF p_kind NOT IN ('contact', 'home_visit')
     OR p_rate_key IS NULL
     OR length(p_rate_key) > 128
     OR length(coalesce(p_secondary, '')) > 254 THEN
    RETURN false;
  END IF;

  normalized_subject := lower(trim(coalesce(p_secondary, '')));
  IF normalized_subject = '' THEN
    RETURN false;
  END IF;

  IF p_kind = 'contact' THEN
    global_ok := public.internship_rate_limit('public:contact:global', 100);
    client_ok := public.internship_rate_limit('public:contact:client:' || p_rate_key, 10);
    subject_ok := public.internship_rate_limit('public:contact:subject:' || normalized_subject, 5);
  ELSE
    global_ok := public.internship_rate_limit('public:home_visit:global', 50);
    client_ok := public.internship_rate_limit('public:home_visit:client:' || p_rate_key, 5);
    subject_ok := public.internship_rate_limit('public:home_visit:subject:' || normalized_subject, 3);
  END IF;

  DELETE FROM public.internship_public_rate_limits
  WHERE key_hash IN (
    SELECT key_hash
    FROM public.internship_public_rate_limits
    WHERE window_started_at < now() - interval '2 days'
    ORDER BY window_started_at
    LIMIT 100
  );

  RETURN global_ok AND client_ok AND subject_ok;
END;
$$;

REVOKE ALL ON FUNCTION public.check_public_submission_rate_limit(text, text, text)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.check_public_submission_rate_limit(text, text, text)
  TO service_role;

CREATE TABLE public.storage_upload_rate_limits (
  key_hash text PRIMARY KEY,
  window_started_at timestamptz NOT NULL DEFAULT now(),
  request_count integer NOT NULL DEFAULT 0 CHECK (request_count >= 0)
);
ALTER TABLE public.storage_upload_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.storage_upload_rate_limits
  FROM PUBLIC, anon, authenticated, service_role;

CREATE INDEX storage_upload_rate_limits_window_idx
  ON public.storage_upload_rate_limits(window_started_at);

CREATE OR REPLACE FUNCTION public.enforce_storage_upload_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage, extensions, pg_temp
AS $$
DECLARE
  actor uuid;
  actor_key text;
  global_key text;
  actor_count integer;
  global_count integer;
  actor_limit integer;
  global_limit integer;
BEGIN
  IF NEW.bucket_id NOT IN ('site-media', 'medical-reports') THEN
    RETURN NEW;
  END IF;

  actor := auth.uid();

  IF NEW.bucket_id = 'site-media' THEN
    IF actor IS NULL THEN
      RAISE EXCEPTION 'Authenticated staff identity required for site media uploads'
        USING ERRCODE = '42501';
    END IF;
    actor_limit := 30;
    global_limit := 200;
    actor_key := 'site-media:actor:' || actor::text;
  ELSE
    -- The medical-reports bucket has a legacy anonymous upload policy. Anonymous
    -- uploads share a strict global actor bucket; authenticated users get a
    -- per-user bucket. A separate global cap protects storage spend in either case.
    actor_limit := CASE WHEN actor IS NULL THEN 10 ELSE 20 END;
    global_limit := 50;
    actor_key := 'medical-reports:actor:' || coalesce(actor::text, 'anonymous');
  END IF;

  global_key := 'storage:global:' || NEW.bucket_id;

  INSERT INTO public.storage_upload_rate_limits(key_hash, request_count)
  VALUES (encode(extensions.digest(actor_key, 'sha256'), 'hex'), 1)
  ON CONFLICT (key_hash) DO UPDATE
    SET request_count = CASE
      WHEN public.storage_upload_rate_limits.window_started_at < now() - interval '1 hour' THEN 1
      ELSE public.storage_upload_rate_limits.request_count + 1
    END,
    window_started_at = CASE
      WHEN public.storage_upload_rate_limits.window_started_at < now() - interval '1 hour' THEN now()
      ELSE public.storage_upload_rate_limits.window_started_at
    END
  RETURNING request_count INTO actor_count;

  IF actor_count > actor_limit THEN
    RAISE EXCEPTION 'Upload rate limit exceeded; try again later'
      USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.storage_upload_rate_limits(key_hash, request_count)
  VALUES (encode(extensions.digest(global_key, 'sha256'), 'hex'), 1)
  ON CONFLICT (key_hash) DO UPDATE
    SET request_count = CASE
      WHEN public.storage_upload_rate_limits.window_started_at < now() - interval '1 hour' THEN 1
      ELSE public.storage_upload_rate_limits.request_count + 1
    END,
    window_started_at = CASE
      WHEN public.storage_upload_rate_limits.window_started_at < now() - interval '1 hour' THEN now()
      ELSE public.storage_upload_rate_limits.window_started_at
    END
  RETURNING request_count INTO global_count;

  IF global_count > global_limit THEN
    RAISE EXCEPTION 'Storage upload capacity temporarily reached; try again later'
      USING ERRCODE = 'P0001';
  END IF;

  -- Bounded cleanup; no unbounded table scan or request-path vacuum.
  DELETE FROM public.storage_upload_rate_limits
  WHERE key_hash IN (
    SELECT key_hash
    FROM public.storage_upload_rate_limits
    WHERE window_started_at < now() - interval '2 days'
    ORDER BY window_started_at
    LIMIT 50
  );

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_storage_upload_rate_limit()
  FROM PUBLIC, anon, authenticated, service_role;

DROP TRIGGER IF EXISTS storage_upload_rate_limit_guard ON storage.objects;
CREATE TRIGGER storage_upload_rate_limit_guard
BEFORE INSERT ON storage.objects
FOR EACH ROW
EXECUTE FUNCTION public.enforce_storage_upload_rate_limit();

COMMIT;
