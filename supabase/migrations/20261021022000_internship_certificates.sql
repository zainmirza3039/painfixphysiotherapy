-- Additive internship/certificate feature. Review deployed schema history before applying.
-- No production migration is authorized by this file. No sample offerings or credentials are seeded.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE public.internship_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 180),
  slug text NOT NULL UNIQUE CHECK (length(slug) <= 120 AND slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text NOT NULL CHECK (length(trim(description)) BETWEEN 1 AND 10000),
  discipline text NOT NULL, duration text NOT NULL,
  delivery_mode text NOT NULL CHECK (delivery_mode IN ('on_site','online','hybrid')),
  eligibility text NOT NULL, objectives text[] NOT NULL DEFAULT '{}', requirements text[] NOT NULL DEFAULT '{}',
  location text, schedule text, seats integer CHECK (seats IS NULL OR seats BETWEEN 1 AND 100000), fees text,
  application_open_at timestamptz, application_close_at timestamptz,
  applications_open boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','closed','archived')),
  required_documents text[] NOT NULL DEFAULT '{}', selection_criteria text NOT NULL,
  supervisor text, completion_criteria text NOT NULL,
  minimum_attendance numeric(5,2) NOT NULL DEFAULT 80 CHECK (minimum_attendance BETWEEN 0 AND 100),
  faqs jsonb NOT NULL DEFAULT '[]' CHECK (jsonb_typeof(faqs)='array'),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (application_close_at IS NULL OR application_open_at IS NULL OR application_close_at > application_open_at)
);
CREATE TABLE public.internship_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), reference text NOT NULL UNIQUE,
  program_id uuid NOT NULL REFERENCES public.internship_programs(id) ON DELETE RESTRICT,
  full_name text NOT NULL CHECK (length(trim(full_name)) BETWEEN 1 AND 180),
  email text NOT NULL CHECK (length(email) <= 254 AND email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  phone text NOT NULL CHECK (length(phone) BETWEEN 7 AND 40 AND phone ~ '^[+0-9() .-]+$'),
  city text NOT NULL CHECK (length(trim(city)) BETWEEN 1 AND 120),
  educational_institution text NOT NULL CHECK (length(trim(educational_institution)) BETWEEN 1 AND 240),
  degree_program text NOT NULL CHECK (length(trim(degree_program)) BETWEEN 1 AND 240),
  academic_status text NOT NULL CHECK (length(trim(academic_status)) BETWEEN 1 AND 120),
  clinical_exposure text CHECK (length(clinical_exposure) <= 4000),
  availability text NOT NULL CHECK (length(trim(availability)) BETWEEN 1 AND 1000),
  motivation text NOT NULL CHECK (length(trim(motivation)) BETWEEN 1 AND 4000),
  consent_privacy boolean NOT NULL CHECK (consent_privacy),
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','under_review','shortlisted','accepted','rejected','withdrawn','completed')),
  internal_notes text CHECK (length(internal_notes) <= 5000), decision_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(id,program_id)
);
CREATE INDEX internship_applications_program_status_idx ON public.internship_applications(program_id,status,created_at DESC);
CREATE INDEX internship_applications_dedup_idx ON public.internship_applications(program_id,lower(email),created_at DESC);
CREATE TABLE public.internship_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), application_id uuid NOT NULL UNIQUE,
  program_id uuid NOT NULL REFERENCES public.internship_programs(id) ON DELETE RESTRICT,
  full_name text NOT NULL, start_date date, end_date date,
  attendance_percent numeric(5,2) CHECK (attendance_percent BETWEEN 0 AND 100), supervisor text,
  completion_status text NOT NULL DEFAULT 'active' CHECK (completion_status IN ('active','completed','not_completed','withdrawn')),
  assessment_signed_off boolean NOT NULL DEFAULT false, completion_approved boolean NOT NULL DEFAULT false,
  completion_decision_at timestamptz, reviewer_id uuid REFERENCES auth.users(id) ON DELETE RESTRICT,
  notes text CHECK (length(notes) <= 5000), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY(application_id,program_id) REFERENCES public.internship_applications(id,program_id) ON DELETE RESTRICT,
  CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date),
  CHECK (NOT completion_approved OR (completion_status='completed' AND assessment_signed_off AND attendance_percent IS NOT NULL AND start_date IS NOT NULL AND end_date IS NOT NULL AND nullif(trim(supervisor),'') IS NOT NULL AND reviewer_id IS NOT NULL AND completion_decision_at IS NOT NULL))
);
CREATE TABLE public.professional_experience_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), full_name text NOT NULL CHECK (length(trim(full_name)) BETWEEN 1 AND 180),
  role text NOT NULL CHECK (length(trim(role)) BETWEEN 1 AND 180),
  engagement_type text NOT NULL CHECK (engagement_type IN ('employment','internship','training','volunteer','contract','other')),
  start_date date, end_date date, responsibilities text NOT NULL CHECK (length(trim(responsibilities)) BETWEEN 1 AND 5000),
  evidence_summary text NOT NULL CHECK (length(trim(evidence_summary)) BETWEEN 1 AND 5000),
  verified boolean NOT NULL DEFAULT false, approved boolean NOT NULL DEFAULT false,
  approver_id uuid REFERENCES auth.users(id) ON DELETE RESTRICT, approval_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date),
  CHECK (NOT approved OR (verified AND start_date IS NOT NULL AND end_date IS NOT NULL AND approver_id IS NOT NULL AND approval_at IS NOT NULL))
);
CREATE TABLE public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), certificate_number text NOT NULL UNIQUE,
  verification_token text NOT NULL UNIQUE CHECK (verification_token ~ '^[0-9a-f]{64}$'),
  type text NOT NULL CHECK (type IN ('internship','experience')), source_id uuid NOT NULL,
  participant_id uuid REFERENCES public.internship_participants(id) ON DELETE RESTRICT,
  experience_record_id uuid REFERENCES public.professional_experience_records(id) ON DELETE RESTRICT,
  recipient_name text NOT NULL, program_or_role text NOT NULL, start_date date NOT NULL, end_date date NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now(), signatory_name text NOT NULL, signatory_designation text NOT NULL,
  status text NOT NULL DEFAULT 'issued' CHECK (status IN ('issued','revoked')),
  revoked_at timestamptz, revocation_reason text,
  replacement_for uuid UNIQUE REFERENCES public.certificates(id) ON DELETE RESTRICT,
  snapshot jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((type='internship' AND participant_id=source_id AND participant_id IS NOT NULL AND experience_record_id IS NULL) OR (type='experience' AND experience_record_id=source_id AND experience_record_id IS NOT NULL AND participant_id IS NULL)),
  CHECK (end_date >= start_date),
  CHECK ((status='issued' AND revoked_at IS NULL AND revocation_reason IS NULL) OR (status='revoked' AND revoked_at IS NOT NULL AND length(trim(revocation_reason)) BETWEEN 3 AND 2000))
);
CREATE UNIQUE INDEX certificates_active_source_idx ON public.certificates(type,source_id) WHERE status='issued';
CREATE TABLE public.certificate_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), certificate_id uuid NOT NULL REFERENCES public.certificates(id) ON DELETE RESTRICT,
  event_type text NOT NULL CHECK (event_type IN ('issued','revoked','replaced')),
  actor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  reason text, snapshot jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX certificate_events_certificate_idx ON public.certificate_events(certificate_id,created_at);
CREATE TABLE public.internship_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation text NOT NULL CHECK (operation IN ('application_status','completion_approval','experience_approval','application_anonymized')),
  entity_id uuid NOT NULL, actor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  old_value text, new_value text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.internship_public_rate_limits (
  key_hash text PRIMARY KEY, window_started_at timestamptz NOT NULL DEFAULT now(),
  request_count integer NOT NULL DEFAULT 0 CHECK (request_count >= 0)
);
CREATE INDEX internship_rate_window_idx ON public.internship_public_rate_limits(window_started_at);

CREATE FUNCTION public.internship_touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_temp AS $$ BEGIN NEW.updated_at=now(); RETURN NEW; END $$;
CREATE TRIGGER internship_programs_updated BEFORE UPDATE ON public.internship_programs FOR EACH ROW EXECUTE FUNCTION public.internship_touch_updated_at();
CREATE TRIGGER internship_applications_updated BEFORE UPDATE ON public.internship_applications FOR EACH ROW EXECUTE FUNCTION public.internship_touch_updated_at();
CREATE TRIGGER internship_participants_updated BEFORE UPDATE ON public.internship_participants FOR EACH ROW EXECUTE FUNCTION public.internship_touch_updated_at();
CREATE TRIGGER experience_records_updated BEFORE UPDATE ON public.professional_experience_records FOR EACH ROW EXECUTE FUNCTION public.internship_touch_updated_at();

ALTER TABLE public.internship_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_experience_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_public_rate_limits ENABLE ROW LEVEL SECURITY;
-- Counteract Supabase default grants explicitly. Service role reads data; definer RPCs perform all writes.
REVOKE ALL ON TABLE public.internship_programs,public.internship_applications,public.internship_participants,public.professional_experience_records,public.certificates,public.certificate_events,public.internship_audit_events,public.internship_public_rate_limits FROM PUBLIC,anon,authenticated,service_role;
GRANT USAGE ON SCHEMA public TO anon,authenticated,service_role;
GRANT SELECT ON public.internship_programs TO anon,authenticated;
GRANT SELECT ON public.internship_programs,public.internship_applications,public.internship_participants,public.professional_experience_records,public.certificates,public.certificate_events,public.internship_audit_events,public.internship_public_rate_limits TO service_role;
CREATE POLICY internship_public_programs ON public.internship_programs FOR SELECT TO anon,authenticated USING(status='published');

CREATE FUNCTION public.internship_assert_admin(_actor_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
BEGIN IF _actor_id IS NULL OR NOT public.is_admin(_actor_id) THEN RAISE EXCEPTION 'forbidden: admin access required' USING ERRCODE='42501'; END IF; END $$;

-- Persist admission in a separate RPC transaction before validation/operation, so a failed submission
-- cannot roll back request counters. Keys are server-derived; this helper is never public executable.
CREATE FUNCTION public.internship_rate_limit(p_key text,p_limit integer,p_window interval DEFAULT interval '1 hour') RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,extensions,pg_temp AS $$
DECLARE n integer;
BEGIN
  INSERT INTO public.internship_public_rate_limits(key_hash,request_count) VALUES(encode(digest(p_key,'sha256'),'hex'),1)
  ON CONFLICT(key_hash) DO UPDATE SET request_count=CASE WHEN internship_public_rate_limits.window_started_at < now()-p_window THEN 1 ELSE internship_public_rate_limits.request_count+1 END,
    window_started_at=CASE WHEN internship_public_rate_limits.window_started_at < now()-p_window THEN now() ELSE internship_public_rate_limits.window_started_at END RETURNING request_count INTO n;
  RETURN n<=p_limit;
END $$;
CREATE FUNCTION public.internship_check_public_rate_limit(p_kind text,p_rate_key text,p_secondary text) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,extensions,pg_temp AS $$
DECLARE global_ok boolean; ip_ok boolean; secondary_ok boolean;
BEGIN
  IF p_kind NOT IN ('submit','verify') OR p_rate_key IS NULL OR length(p_rate_key)>128 OR length(coalesce(p_secondary,''))>254 THEN RETURN false; END IF;
  global_ok:=public.internship_rate_limit(p_kind||':global',CASE WHEN p_kind='submit' THEN 100 ELSE 600 END);
  ip_ok:=public.internship_rate_limit(p_kind||':client:'||p_rate_key,CASE WHEN p_kind='submit' THEN 20 ELSE 120 END);
  secondary_ok:=public.internship_rate_limit(p_kind||':subject:'||lower(trim(coalesce(p_secondary,''))),CASE WHEN p_kind='submit' THEN 5 ELSE 60 END);
  DELETE FROM public.internship_public_rate_limits WHERE key_hash IN (SELECT key_hash FROM public.internship_public_rate_limits WHERE window_started_at<now()-interval '2 days' ORDER BY window_started_at LIMIT 100);
  RETURN global_ok AND ip_ok AND secondary_ok;
END $$;

CREATE FUNCTION public.submit_internship_application(p_payload jsonb,p_rate_key text DEFAULT 'shared-global') RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,extensions,pg_temp AS $$
DECLARE prog public.internship_programs%ROWTYPE; ref text; normalized_email text; field text;
BEGIN
  IF jsonb_typeof(p_payload) IS DISTINCT FROM 'object' OR EXISTS(SELECT 1 FROM jsonb_object_keys(p_payload) k WHERE k NOT IN ('program_slug','full_name','email','phone','city','educational_institution','degree_program','academic_status','clinical_exposure','availability','motivation','consent_privacy')) THEN RAISE EXCEPTION 'invalid application'; END IF;
  FOREACH field IN ARRAY ARRAY['program_slug','full_name','email','phone','city','educational_institution','degree_program','academic_status','availability','motivation'] LOOP
    IF jsonb_typeof(p_payload->field) IS DISTINCT FROM 'string' OR length(trim(p_payload->>field))<1 THEN RAISE EXCEPTION 'invalid application'; END IF;
  END LOOP;
  IF p_payload->'consent_privacy' IS DISTINCT FROM 'true'::jsonb OR length(p_payload->>'full_name')>180 OR length(p_payload->>'email')>254 OR p_payload->>'email' !~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' OR length(p_payload->>'phone') NOT BETWEEN 7 AND 40 OR p_payload->>'phone' !~ '^[+0-9() .-]+$' OR length(p_payload->>'city')>120 OR length(p_payload->>'educational_institution')>240 OR length(p_payload->>'degree_program')>240 OR length(p_payload->>'academic_status')>120 OR length(p_payload->>'availability')>1000 OR length(p_payload->>'motivation')>4000 OR length(coalesce(p_payload->>'clinical_exposure',''))>4000 THEN RAISE EXCEPTION 'invalid application'; END IF;
  SELECT * INTO prog FROM public.internship_programs WHERE slug=lower(trim(p_payload->>'program_slug')) AND status='published' AND applications_open AND (application_open_at IS NULL OR application_open_at<=now()) AND (application_close_at IS NULL OR application_close_at>now()) FOR SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'program unavailable'; END IF;
  normalized_email:=lower(trim(p_payload->>'email'));
  PERFORM pg_advisory_xact_lock(hashtextextended(prog.id::text||':'||normalized_email,0));
  IF EXISTS(SELECT 1 FROM public.internship_applications WHERE program_id=prog.id AND lower(email)=normalized_email AND created_at>now()-interval '30 days' AND status NOT IN ('rejected','withdrawn')) THEN RAISE EXCEPTION 'duplicate application'; END IF;
  ref:='PFI-'||upper(encode(gen_random_bytes(8),'hex'));
  INSERT INTO public.internship_applications(reference,program_id,full_name,email,phone,city,educational_institution,degree_program,academic_status,clinical_exposure,availability,motivation,consent_privacy)
  VALUES(ref,prog.id,trim(p_payload->>'full_name'),normalized_email,trim(p_payload->>'phone'),trim(p_payload->>'city'),trim(p_payload->>'educational_institution'),trim(p_payload->>'degree_program'),trim(p_payload->>'academic_status'),nullif(trim(p_payload->>'clinical_exposure'),''),trim(p_payload->>'availability'),trim(p_payload->>'motivation'),true);
  RETURN jsonb_build_object('reference',ref);
END $$;

CREATE FUNCTION public.verify_internship_certificate(p_reference text,p_rate_key text DEFAULT 'shared-global') RETURNS TABLE(status text,certificate jsonb) LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE c public.certificates%ROWTYPE; recipient_words text[];
BEGIN
  IF p_reference IS NULL OR length(trim(p_reference)) NOT BETWEEN 12 AND 160 THEN RETURN QUERY SELECT 'not_found'::text,NULL::jsonb; RETURN; END IF;
  SELECT * INTO c FROM public.certificates WHERE certificate_number=trim(p_reference) OR verification_token=trim(p_reference);
  IF NOT FOUND THEN RETURN QUERY SELECT 'not_found'::text,NULL::jsonb; RETURN; END IF;
  recipient_words:=regexp_split_to_array(trim(c.recipient_name),'\s+');
  RETURN QUERY SELECT CASE WHEN c.status='revoked' THEN 'revoked' ELSE 'valid' END,
    jsonb_build_object('reference',c.certificate_number,'type',c.type,'recipient_name',recipient_words[1]||CASE WHEN cardinality(recipient_words)>1 THEN ' '||left(recipient_words[cardinality(recipient_words)],1)||'.' ELSE '' END,
      'program_or_role',c.program_or_role,'issue_date',c.issued_at::date,'start_date',c.start_date,'end_date',c.end_date,'issuing_organization','PainFix Physiotherapy Clinic');
END $$;

CREATE FUNCTION public.admin_save_internship_program(_actor_id uuid,p jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE r public.internship_programs%ROWTYPE; i uuid:=nullif(p->>'id','')::uuid;
BEGIN
  PERFORM public.internship_assert_admin(_actor_id);
  IF i IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.internship_programs WHERE id=i) THEN RAISE EXCEPTION 'program not found'; END IF;
  INSERT INTO public.internship_programs(id,title,slug,description,discipline,duration,delivery_mode,eligibility,objectives,requirements,location,schedule,seats,fees,application_open_at,application_close_at,applications_open,status,required_documents,selection_criteria,supervisor,completion_criteria,minimum_attendance,faqs)
  VALUES(coalesce(i,gen_random_uuid()),p->>'title',p->>'slug',p->>'description',p->>'discipline',p->>'duration',p->>'delivery_mode',p->>'eligibility',ARRAY(SELECT jsonb_array_elements_text(p->'objectives')),ARRAY(SELECT jsonb_array_elements_text(p->'requirements')),nullif(p->>'location',''),nullif(p->>'schedule',''),nullif(p->>'seats','')::integer,nullif(p->>'fees',''),nullif(p->>'application_open_at','')::timestamptz,nullif(p->>'application_close_at','')::timestamptz,coalesce((p->>'applications_open')::boolean,false),p->>'status',ARRAY(SELECT jsonb_array_elements_text(p->'required_documents')),p->>'selection_criteria',nullif(p->>'supervisor',''),p->>'completion_criteria',coalesce((p->>'minimum_attendance')::numeric,80),coalesce(p->'faqs','[]'))
  ON CONFLICT(id) DO UPDATE SET title=excluded.title,slug=excluded.slug,description=excluded.description,discipline=excluded.discipline,duration=excluded.duration,delivery_mode=excluded.delivery_mode,eligibility=excluded.eligibility,objectives=excluded.objectives,requirements=excluded.requirements,location=excluded.location,schedule=excluded.schedule,seats=excluded.seats,fees=excluded.fees,application_open_at=excluded.application_open_at,application_close_at=excluded.application_close_at,applications_open=excluded.applications_open,status=excluded.status,required_documents=excluded.required_documents,selection_criteria=excluded.selection_criteria,supervisor=excluded.supervisor,completion_criteria=excluded.completion_criteria,minimum_attendance=excluded.minimum_attendance,faqs=excluded.faqs RETURNING * INTO r;
  RETURN to_jsonb(r);
END $$;

CREATE FUNCTION public.admin_review_internship_application(_actor_id uuid,p_id uuid,p_status text,p_notes text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE r public.internship_applications%ROWTYPE; prog public.internship_programs%ROWTYPE; old_status text; accepted_count integer;
BEGIN
  PERFORM public.internship_assert_admin(_actor_id);
  -- Lock program before applicant consistently to serialize seat decisions and avoid lock-order cycles.
  SELECT p.* INTO prog FROM public.internship_programs p JOIN public.internship_applications a ON a.program_id=p.id WHERE a.id=p_id FOR UPDATE OF p;
  SELECT * INTO r FROM public.internship_applications WHERE id=p_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'application not found'; END IF;
  old_status:=r.status;
  IF p_status<>old_status AND NOT (
    (old_status='submitted' AND p_status IN ('under_review','rejected','withdrawn')) OR
    (old_status='under_review' AND p_status IN ('shortlisted','accepted','rejected','withdrawn')) OR
    (old_status='shortlisted' AND p_status IN ('under_review','accepted','rejected','withdrawn')) OR
    (old_status='accepted' AND p_status='withdrawn')
  ) THEN RAISE EXCEPTION 'invalid application status transition'; END IF;
  IF old_status='accepted' AND p_status='withdrawn' AND EXISTS(SELECT 1 FROM public.internship_participants WHERE application_id=p_id) THEN RAISE EXCEPTION 'withdraw participant through completion workflow'; END IF;
  IF p_status='accepted' AND old_status<>'accepted' AND prog.seats IS NOT NULL THEN
    SELECT count(*) INTO accepted_count FROM public.internship_applications WHERE program_id=prog.id AND status IN ('accepted','completed');
    IF accepted_count>=prog.seats THEN RAISE EXCEPTION 'program capacity reached'; END IF;
  END IF;
  UPDATE public.internship_applications SET status=p_status,internal_notes=p_notes,decision_at=CASE WHEN p_status<>old_status AND p_status IN ('accepted','rejected','withdrawn') THEN now() ELSE decision_at END WHERE id=p_id RETURNING * INTO r;
  IF p_status<>old_status THEN INSERT INTO public.internship_audit_events(operation,entity_id,actor_id,old_value,new_value) VALUES('application_status',p_id,_actor_id,old_status,p_status); END IF;
  RETURN to_jsonb(r)||jsonb_build_object('program_slug',prog.slug);
END $$;

CREATE FUNCTION public.admin_save_internship_participant(_actor_id uuid,p jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE r public.internship_participants%ROWTYPE; a public.internship_applications%ROWTYPE; prog public.internship_programs%ROWTYPE; i uuid:=nullif(p->>'id','')::uuid; approved boolean:=coalesce((p->>'completion_approved')::boolean,false); old_approved boolean:=false;
BEGIN
  PERFORM public.internship_assert_admin(_actor_id);
  SELECT pr.* INTO prog FROM public.internship_programs pr JOIN public.internship_applications app ON app.program_id=pr.id WHERE app.id=(p->>'application_id')::uuid FOR SHARE OF pr;
  SELECT * INTO a FROM public.internship_applications WHERE id=(p->>'application_id')::uuid FOR UPDATE;
  IF a.id IS NULL OR a.status NOT IN ('accepted','completed') THEN RAISE EXCEPTION 'accepted application required'; END IF;
  IF (p->>'program_id')::uuid IS DISTINCT FROM a.program_id OR p->>'full_name' IS DISTINCT FROM a.full_name THEN RAISE EXCEPTION 'participant source must match accepted application'; END IF;
  IF i IS NOT NULL THEN
    SELECT * INTO r FROM public.internship_participants WHERE id=i FOR UPDATE;
    IF r.id IS NULL THEN RAISE EXCEPTION 'participant not found'; END IF;
    IF r.application_id<>a.id OR r.program_id<>a.program_id THEN RAISE EXCEPTION 'participant source is immutable'; END IF;
    old_approved:=r.completion_approved;
    IF EXISTS(SELECT 1 FROM public.certificates WHERE participant_id=i AND status='issued') THEN RAISE EXCEPTION 'revoke active certificate before correcting source'; END IF;
  END IF;
  IF approved THEN
    IF p->>'completion_status' IS DISTINCT FROM 'completed' OR NOT coalesce((p->>'assessment_signed_off')::boolean,false) THEN RAISE EXCEPTION 'completion requires completed status and assessment sign-off'; END IF;
    IF nullif(p->>'attendance_percent','') IS NULL OR (p->>'attendance_percent')::numeric<prog.minimum_attendance THEN RAISE EXCEPTION 'completion attendance requirement not met'; END IF;
    IF nullif(p->>'start_date','') IS NULL OR nullif(p->>'end_date','') IS NULL OR nullif(trim(p->>'supervisor'),'') IS NULL OR (p->>'end_date')::date>CURRENT_DATE THEN RAISE EXCEPTION 'completion requires valid dates and supervisor'; END IF;
  END IF;
  INSERT INTO public.internship_participants(id,application_id,program_id,full_name,start_date,end_date,attendance_percent,supervisor,completion_status,assessment_signed_off,completion_approved,completion_decision_at,reviewer_id,notes)
  VALUES(coalesce(i,gen_random_uuid()),a.id,a.program_id,a.full_name,nullif(p->>'start_date','')::date,nullif(p->>'end_date','')::date,nullif(p->>'attendance_percent','')::numeric,nullif(trim(p->>'supervisor'),''),p->>'completion_status',coalesce((p->>'assessment_signed_off')::boolean,false),approved,CASE WHEN approved THEN now() END,CASE WHEN approved THEN _actor_id END,p->>'notes')
  ON CONFLICT(id) DO UPDATE SET start_date=excluded.start_date,end_date=excluded.end_date,attendance_percent=excluded.attendance_percent,supervisor=excluded.supervisor,completion_status=excluded.completion_status,assessment_signed_off=excluded.assessment_signed_off,completion_approved=excluded.completion_approved,completion_decision_at=excluded.completion_decision_at,reviewer_id=excluded.reviewer_id,notes=excluded.notes RETURNING * INTO r;
  IF approved THEN UPDATE public.internship_applications SET status='completed',decision_at=now() WHERE id=a.id AND status='accepted';
  ELSIF a.status='completed' THEN UPDATE public.internship_applications SET status='accepted' WHERE id=a.id;
  END IF;
  IF approved IS DISTINCT FROM old_approved THEN INSERT INTO public.internship_audit_events(operation,entity_id,actor_id,old_value,new_value) VALUES('completion_approval',r.id,_actor_id,old_approved::text,approved::text); END IF;
  RETURN to_jsonb(r);
END $$;

CREATE FUNCTION public.admin_save_experience_record(_actor_id uuid,p jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE r public.professional_experience_records%ROWTYPE; i uuid:=nullif(p->>'id','')::uuid; approved boolean:=coalesce((p->>'approved')::boolean,false); old_approved boolean:=false;
BEGIN
  PERFORM public.internship_assert_admin(_actor_id);
  IF i IS NOT NULL THEN
    SELECT * INTO r FROM public.professional_experience_records WHERE id=i FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'experience record not found'; END IF;
    old_approved:=r.approved;
    IF EXISTS(SELECT 1 FROM public.certificates WHERE experience_record_id=i AND status='issued') THEN RAISE EXCEPTION 'revoke active certificate before correcting source'; END IF;
  END IF;
  IF approved AND (NOT coalesce((p->>'verified')::boolean,false) OR nullif(p->>'start_date','') IS NULL OR nullif(p->>'end_date','') IS NULL OR (p->>'end_date')::date>CURRENT_DATE) THEN RAISE EXCEPTION 'verified approved experience requires valid dates'; END IF;
  INSERT INTO public.professional_experience_records(id,full_name,role,engagement_type,start_date,end_date,responsibilities,evidence_summary,verified,approved,approver_id,approval_at)
  VALUES(coalesce(i,gen_random_uuid()),p->>'full_name',p->>'role',p->>'engagement_type',nullif(p->>'start_date','')::date,nullif(p->>'end_date','')::date,p->>'responsibilities',p->>'evidence_summary',coalesce((p->>'verified')::boolean,false),approved,CASE WHEN approved THEN _actor_id END,CASE WHEN approved THEN now() END)
  ON CONFLICT(id) DO UPDATE SET full_name=excluded.full_name,role=excluded.role,engagement_type=excluded.engagement_type,start_date=excluded.start_date,end_date=excluded.end_date,responsibilities=excluded.responsibilities,evidence_summary=excluded.evidence_summary,verified=excluded.verified,approved=excluded.approved,approver_id=excluded.approver_id,approval_at=excluded.approval_at RETURNING * INTO r;
  IF approved IS DISTINCT FROM old_approved THEN INSERT INTO public.internship_audit_events(operation,entity_id,actor_id,old_value,new_value) VALUES('experience_approval',r.id,_actor_id,old_approved::text,approved::text); END IF;
  RETURN to_jsonb(r);
END $$;

CREATE FUNCTION public.admin_issue_internship_certificate(_actor_id uuid,p_type text,p_source_id uuid,p_signatory_name text,p_signatory_designation text,p_replacement_for uuid DEFAULT NULL,p_replacement_reason text DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,extensions,pg_temp AS $$
DECLARE c public.certificates%ROWTYPE; old public.certificates%ROWTYPE; part public.internship_participants%ROWTYPE; prog public.internship_programs%ROWTYPE; exp public.professional_experience_records%ROWTYPE; snap jsonb; latest_id uuid;
BEGIN
  PERFORM public.internship_assert_admin(_actor_id);
  IF length(trim(coalesce(p_signatory_name,''))) NOT BETWEEN 1 AND 180 OR length(trim(coalesce(p_signatory_designation,''))) NOT BETWEEN 1 AND 180 THEN RAISE EXCEPTION 'configured signatory required'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('certificate:'||p_type||':'||p_source_id::text,0));
  IF p_type='internship' THEN
    SELECT * INTO part FROM public.internship_participants WHERE id=p_source_id FOR UPDATE;
    SELECT * INTO prog FROM public.internship_programs WHERE id=part.program_id;
    IF part.id IS NULL OR part.completion_status<>'completed' OR NOT part.assessment_signed_off OR NOT part.completion_approved OR part.reviewer_id IS NULL OR part.completion_decision_at IS NULL OR part.attendance_percent IS NULL OR part.attendance_percent<prog.minimum_attendance OR part.start_date IS NULL OR part.end_date IS NULL OR part.end_date>CURRENT_DATE OR NOT EXISTS(SELECT 1 FROM public.internship_applications WHERE id=part.application_id AND status='completed') THEN RAISE EXCEPTION 'completion eligibility not met'; END IF;
    snap:=jsonb_build_object('recipient_name',part.full_name,'program_or_role',prog.title,'start_date',part.start_date,'end_date',part.end_date,'completion_criteria',prog.completion_criteria,'minimum_attendance',prog.minimum_attendance,'attendance_percent',part.attendance_percent,'reviewer_id',part.reviewer_id);
  ELSIF p_type='experience' THEN
    SELECT * INTO exp FROM public.professional_experience_records WHERE id=p_source_id FOR UPDATE;
    IF exp.id IS NULL OR NOT exp.verified OR NOT exp.approved OR exp.approver_id IS NULL OR exp.approval_at IS NULL OR exp.start_date IS NULL OR exp.end_date IS NULL OR exp.end_date>CURRENT_DATE THEN RAISE EXCEPTION 'verified approved experience required'; END IF;
    snap:=jsonb_build_object('recipient_name',exp.full_name,'program_or_role',exp.role||' ('||exp.engagement_type||')','start_date',exp.start_date,'end_date',exp.end_date,'engagement_type',exp.engagement_type,'responsibilities',exp.responsibilities,'approver_id',exp.approver_id);
  ELSE RAISE EXCEPTION 'invalid certificate type'; END IF;
  IF EXISTS(SELECT 1 FROM public.certificates WHERE type=p_type AND source_id=p_source_id AND status='issued') THEN RAISE EXCEPTION 'active certificate already exists'; END IF;
  SELECT predecessor.id INTO latest_id FROM public.certificates predecessor WHERE predecessor.type=p_type AND predecessor.source_id=p_source_id AND NOT EXISTS(SELECT 1 FROM public.certificates successor WHERE successor.replacement_for=predecessor.id) ORDER BY predecessor.issued_at DESC LIMIT 1;
  IF latest_id IS NOT NULL THEN
    IF p_replacement_for IS NULL THEN RAISE EXCEPTION 'replacement requires revoked predecessor and reason'; END IF;
    SELECT * INTO old FROM public.certificates WHERE id=p_replacement_for FOR UPDATE;
    IF old.id IS NULL OR old.status<>'revoked' OR old.type<>p_type OR old.source_id<>p_source_id OR old.id<>latest_id OR length(trim(coalesce(p_replacement_reason,''))) NOT BETWEEN 3 AND 2000 THEN RAISE EXCEPTION 'replacement requires same-source revoked predecessor and reason'; END IF;
  ELSIF p_replacement_for IS NOT NULL THEN RAISE EXCEPTION 'replacement requires same-source revoked predecessor and reason'; END IF;
  snap:=snap||jsonb_build_object('issuer_id',_actor_id,'signatory_name',trim(p_signatory_name),'signatory_designation',trim(p_signatory_designation),'type',p_type,'issued_at',now());
  INSERT INTO public.certificates(certificate_number,verification_token,type,source_id,participant_id,experience_record_id,recipient_name,program_or_role,start_date,end_date,signatory_name,signatory_designation,replacement_for,snapshot)
  VALUES('PF-'||upper(encode(gen_random_bytes(10),'hex')),encode(gen_random_bytes(32),'hex'),p_type,p_source_id,CASE WHEN p_type='internship' THEN p_source_id END,CASE WHEN p_type='experience' THEN p_source_id END,snap->>'recipient_name',snap->>'program_or_role',(snap->>'start_date')::date,(snap->>'end_date')::date,trim(p_signatory_name),trim(p_signatory_designation),p_replacement_for,snap) RETURNING * INTO c;
  INSERT INTO public.certificate_events(certificate_id,event_type,actor_id,reason,snapshot) VALUES(c.id,'issued',_actor_id,p_replacement_reason,to_jsonb(c));
  IF p_replacement_for IS NOT NULL THEN
    INSERT INTO public.certificate_events(certificate_id,event_type,actor_id,reason,snapshot) VALUES(old.id,'replaced',_actor_id,p_replacement_reason,jsonb_build_object('replacement_id',c.id,'replacement_number',c.certificate_number)),(c.id,'replaced',_actor_id,p_replacement_reason,jsonb_build_object('predecessor_id',old.id,'predecessor_number',old.certificate_number));
  END IF;
  RETURN to_jsonb(c);
END $$;

CREATE FUNCTION public.admin_revoke_internship_certificate(_actor_id uuid,p_id uuid,p_reason text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE c public.certificates%ROWTYPE;
BEGIN
  PERFORM public.internship_assert_admin(_actor_id);
  IF length(trim(coalesce(p_reason,''))) NOT BETWEEN 3 AND 2000 THEN RAISE EXCEPTION 'revocation reason required'; END IF;
  UPDATE public.certificates SET status='revoked',revoked_at=now(),revocation_reason=trim(p_reason) WHERE id=p_id AND status='issued' RETURNING * INTO c;
  IF NOT FOUND THEN RAISE EXCEPTION 'issued certificate not found'; END IF;
  INSERT INTO public.certificate_events(certificate_id,event_type,actor_id,reason,snapshot) VALUES(c.id,'revoked',_actor_id,trim(p_reason),to_jsonb(c));
  RETURN to_jsonb(c);
END $$;

-- Controlled deletion alternative: anonymize rejected/withdrawn applicants only after an approved
-- retention decision. Participant/credential sources cannot be anonymized through this function.
CREATE FUNCTION public.admin_anonymize_internship_application(_actor_id uuid,p_id uuid,p_reason text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE r public.internship_applications%ROWTYPE;
BEGIN
  PERFORM public.internship_assert_admin(_actor_id);
  IF length(trim(coalesce(p_reason,''))) NOT BETWEEN 3 AND 1000 THEN RAISE EXCEPTION 'retention decision reason required'; END IF;
  SELECT * INTO r FROM public.internship_applications WHERE id=p_id FOR UPDATE;
  IF r.id IS NULL OR r.status NOT IN ('rejected','withdrawn') OR EXISTS(SELECT 1 FROM public.internship_participants WHERE application_id=p_id) THEN RAISE EXCEPTION 'only rejected or withdrawn applications without participants may be anonymized'; END IF;
  UPDATE public.internship_applications SET full_name='Removed applicant',email=id::text||'@removed.invalid',phone='0000000',city='Removed',educational_institution='Removed',degree_program='Removed',academic_status='Removed',clinical_exposure=NULL,availability='Removed',motivation='Removed',internal_notes=NULL WHERE id=p_id RETURNING * INTO r;
  INSERT INTO public.internship_audit_events(operation,entity_id,actor_id,old_value,new_value) VALUES('application_anonymized',p_id,_actor_id,r.status,left(trim(p_reason),1000));
  RETURN to_jsonb(r)||jsonb_build_object('program_slug',(SELECT slug FROM public.internship_programs WHERE id=r.program_id));
END $$;

CREATE FUNCTION public.internship_certificate_immutable() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_temp AS $$
BEGIN
  IF TG_OP='DELETE' THEN RAISE EXCEPTION 'certificate records cannot be deleted'; END IF;
  IF (to_jsonb(NEW)-ARRAY['status','revoked_at','revocation_reason']) IS DISTINCT FROM (to_jsonb(OLD)-ARRAY['status','revoked_at','revocation_reason']) OR OLD.status<>'issued' OR NEW.status<>'revoked' THEN RAISE EXCEPTION 'issued certificate is immutable; revoke and replace'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER certificate_immutable BEFORE UPDATE OR DELETE ON public.certificates FOR EACH ROW EXECUTE FUNCTION public.internship_certificate_immutable();
CREATE FUNCTION public.internship_audit_immutable() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_temp AS $$ BEGIN RAISE EXCEPTION 'audit events are append-only'; END $$;
CREATE TRIGGER certificate_events_immutable BEFORE UPDATE OR DELETE ON public.certificate_events FOR EACH ROW EXECUTE FUNCTION public.internship_audit_immutable();
CREATE TRIGGER internship_audit_events_immutable BEFORE UPDATE OR DELETE ON public.internship_audit_events FOR EACH ROW EXECUTE FUNCTION public.internship_audit_immutable();

-- PostgreSQL grants new functions to PUBLIC by default. Revoke every feature function explicitly.
REVOKE ALL ON FUNCTION public.internship_touch_updated_at(),public.internship_assert_admin(uuid),public.internship_rate_limit(text,integer,interval),public.internship_check_public_rate_limit(text,text,text),public.submit_internship_application(jsonb,text),public.verify_internship_certificate(text,text),public.admin_save_internship_program(uuid,jsonb),public.admin_review_internship_application(uuid,uuid,text,text),public.admin_save_internship_participant(uuid,jsonb),public.admin_save_experience_record(uuid,jsonb),public.admin_issue_internship_certificate(uuid,text,uuid,text,text,uuid,text),public.admin_revoke_internship_certificate(uuid,uuid,text),public.admin_anonymize_internship_application(uuid,uuid,text),public.internship_certificate_immutable(),public.internship_audit_immutable() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.internship_check_public_rate_limit(text,text,text),public.submit_internship_application(jsonb,text),public.verify_internship_certificate(text,text),public.admin_save_internship_program(uuid,jsonb),public.admin_review_internship_application(uuid,uuid,text,text),public.admin_save_internship_participant(uuid,jsonb),public.admin_save_experience_record(uuid,jsonb),public.admin_issue_internship_certificate(uuid,text,uuid,text,text,uuid,text),public.admin_revoke_internship_certificate(uuid,uuid,text),public.admin_anonymize_internship_application(uuid,uuid,text) TO service_role;
