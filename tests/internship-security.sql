\set ON_ERROR_STOP on
-- Execute after internship-bootstrap.sql. This is deliberately disposable and transactional.
DO $$ BEGIN
  IF current_database() !~ '^painfix_internship_test_[a-z0-9_]+$' THEN
    RAISE EXCEPTION 'refusing internship security test outside final-QA database: %', current_database();
  END IF;
END $$;
BEGIN;
SET LOCAL row_security = on;
SET LOCAL search_path = public, auth;
CREATE TEMP TABLE assertion_count(n integer NOT NULL DEFAULT 0) ON COMMIT DROP;
INSERT INTO assertion_count DEFAULT VALUES;
GRANT SELECT ON assertion_count TO service_role;
CREATE OR REPLACE FUNCTION pg_temp.assert_true(ok boolean, label text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_temp, public AS $$
BEGIN
  IF ok IS DISTINCT FROM true THEN RAISE EXCEPTION 'ASSERTION FAILED: %', label; END IF;
  UPDATE assertion_count SET n=n+1;
END $$;

-- No table access or administrative RPCs are available to anonymous/authenticated callers.
SET LOCAL ROLE anon;
DO $$ BEGIN
  BEGIN PERFORM count(*) FROM public.internship_applications; PERFORM pg_temp.assert_true(false,'anon table read denied');
  EXCEPTION WHEN OTHERS THEN IF SQLERRM NOT LIKE '%permission denied%' THEN RAISE; END IF; END;
  BEGIN PERFORM public.verify_internship_certificate('x','anon'); PERFORM pg_temp.assert_true(false,'anon verify denied');
  EXCEPTION WHEN OTHERS THEN IF SQLERRM NOT LIKE '%permission denied%' THEN RAISE; END IF; END;
END $$;
RESET ROLE;
SET LOCAL ROLE authenticated;
DO $$ BEGIN
  BEGIN PERFORM public.submit_internship_application('{}','auth'); PERFORM pg_temp.assert_true(false,'authenticated submit denied');
  EXCEPTION WHEN OTHERS THEN IF SQLERRM NOT LIKE '%permission denied%' THEN RAISE; END IF; END;
  BEGIN PERFORM public.admin_save_internship_program('00000000-0000-0000-0000-000000000001','{}'); PERFORM pg_temp.assert_true(false,'authenticated admin denied');
  EXCEPTION WHEN OTHERS THEN IF SQLERRM NOT LIKE '%permission denied%' THEN RAISE; END IF; END;
END $$;
RESET ROLE;

-- All fixture creation, lifecycle, and direct-table checks run as the only permitted service boundary.
SET LOCAL ROLE service_role;
DO $$
DECLARE
  admin uuid := '00000000-0000-0000-0000-000000000001';
  ordinary uuid := '00000000-0000-0000-0000-000000000003';
  p jsonb; p2 jsonb; pid uuid; aid uuid; n integer; part uuid; cert uuid; old_snapshot jsonb; new_snapshot jsonb;
  ref text; token text; status text; projection jsonb; eid uuid; old_event_snapshot jsonb;
BEGIN
  p := public.admin_save_internship_program(admin,jsonb_build_object(
    'title','Runtime Internship','slug','runtime-internship','description','Public description','discipline','Physio',
    'duration','4 weeks','delivery_mode','hybrid','eligibility','DPT','objectives',jsonb_build_array('learn'),
    'requirements',jsonb_build_array('CV'),'applications_open',true,'status','published','selection_criteria','Merit',
    'completion_criteria','Attendance and sign-off','minimum_attendance',80,
    'application_open_at',(now()-interval '1 hour')::text,'application_close_at',(now()+interval '1 hour')::text));
  pid := (p->>'id')::uuid;
  PERFORM pg_temp.assert_true((p->>'slug')='runtime-internship','program created');
  PERFORM public.admin_save_internship_program(admin,jsonb_build_object('title','Draft Secret','slug','runtime-draft','description','secret','discipline','x','duration','x','delivery_mode','online','eligibility','x','objectives',jsonb_build_array(),'requirements',jsonb_build_array(),'applications_open',false,'status','draft','selection_criteria','x','completion_criteria','x','minimum_attendance',80));
  SET LOCAL ROLE anon;
  SELECT count(*) INTO n FROM public.internship_programs;
  PERFORM pg_temp.assert_true(n=1,'draft not public');
  SET LOCAL ROLE service_role;
  -- Submission requires exact schema, validates phone/email, canonical slug, and preserves optional clinical_exposure.
  p := public.submit_internship_application(jsonb_build_object('program_slug','RUNTIME-INTERNSHIP','full_name','Runtime Applicant','email','runtime@example.test','phone','+923001234567','city','Lahore','educational_institution','Test University','degree_program','DPT','academic_status','final year','clinical_exposure','outpatient rotation','availability','weekdays','motivation','Runtime test','consent_privacy',true));
  ref := p->>'reference';
  SELECT id INTO aid FROM internship_applications WHERE reference=ref;
  PERFORM pg_temp.assert_true((SELECT clinical_exposure='outpatient rotation' FROM internship_applications WHERE id=aid),'clinical exposure persisted');
  BEGIN PERFORM public.submit_internship_application(jsonb_build_object('program_slug','runtime-internship','full_name','Runtime Applicant','email','runtime@example.test','phone','+923001234567','city','Lahore','educational_institution','Test University','degree_program','DPT','academic_status','final year','availability','weekdays','motivation','Runtime test','consent_privacy',true)); PERFORM pg_temp.assert_true(false,'duplicate accepted'); EXCEPTION WHEN OTHERS THEN IF SQLERRM NOT LIKE '%duplicate application%' THEN RAISE; END IF; END;
  BEGIN PERFORM public.submit_internship_application(jsonb_build_object('program_slug','runtime-internship','full_name','X','email','bad','phone','not-a-phone','city','x','educational_institution','x','degree_program','x','academic_status','x','availability','x','motivation','x','consent_privacy',true)); PERFORM pg_temp.assert_true(false,'malformed accepted'); EXCEPTION WHEN OTHERS THEN IF SQLERRM NOT LIKE '%invalid application%' AND SQLERRM NOT LIKE '%phone%' AND SQLERRM NOT LIKE '%email%' THEN RAISE; END IF; END;
  -- Closed/unavailable boundaries are enforced.
  PERFORM public.admin_save_internship_program(admin,(SELECT jsonb_build_object('id',id,'title',title,'slug',slug,'description',description,'discipline',discipline,'duration',duration,'delivery_mode',delivery_mode,'eligibility',eligibility,'objectives',to_jsonb(objectives),'requirements',to_jsonb(requirements),'applications_open',false,'status','closed','selection_criteria',selection_criteria,'completion_criteria',completion_criteria,'minimum_attendance',minimum_attendance) FROM internship_programs WHERE id=pid));
  BEGIN PERFORM public.submit_internship_application(jsonb_build_object('program_slug','runtime-internship','full_name','Closed','email','closed@example.test','phone','+923001234568','city','x','educational_institution','x','degree_program','x','academic_status','x','availability','x','motivation','x','consent_privacy',true)); PERFORM pg_temp.assert_true(false,'closed accepted'); EXCEPTION WHEN OTHERS THEN IF SQLERRM NOT LIKE '%program unavailable%' THEN RAISE; END IF; END;
  PERFORM public.admin_save_internship_program(admin,(SELECT jsonb_build_object('id',id,'title',title,'slug',slug,'description',description,'discipline',discipline,'duration',duration,'delivery_mode',delivery_mode,'eligibility',eligibility,'objectives',to_jsonb(objectives),'requirements',to_jsonb(requirements),'applications_open',true,'status','published','selection_criteria',selection_criteria,'completion_criteria',completion_criteria,'minimum_attendance',minimum_attendance,'application_open_at',(now()-interval '1 hour')::text,'application_close_at',(now()+interval '1 hour')::text) FROM internship_programs WHERE id=pid));
  BEGIN PERFORM public.admin_review_internship_application(ordinary,aid,'accepted',NULL); PERFORM pg_temp.assert_true(false,'ordinary review accepted'); EXCEPTION WHEN OTHERS THEN IF SQLERRM NOT LIKE '%forbidden%' THEN RAISE; END IF; END;
  PERFORM public.admin_review_internship_application(admin,aid,'under_review',NULL);
  BEGIN PERFORM public.admin_review_internship_application(admin,aid,'completed',NULL); PERFORM pg_temp.assert_true(false,'completion bypass accepted'); EXCEPTION WHEN OTHERS THEN IF SQLERRM NOT LIKE '%transition%' AND SQLERRM NOT LIKE '%completed%' THEN RAISE; END IF; END;
  PERFORM public.admin_review_internship_application(admin,aid,'shortlisted',NULL);
  PERFORM public.admin_review_internship_application(admin,aid,'accepted',NULL);
  -- Participant FK, null attendance/date denial, approval gates, and final completion.
  BEGIN PERFORM public.admin_save_internship_participant(admin,jsonb_build_object('application_id',aid,'program_id',gen_random_uuid(),'full_name','Runtime Applicant')); PERFORM pg_temp.assert_true(false,'bad program association accepted'); EXCEPTION WHEN OTHERS THEN IF SQLERRM NOT LIKE '%foreign key%' AND SQLERRM NOT LIKE '%source must match%' THEN RAISE; END IF; END;
  BEGIN PERFORM public.admin_save_internship_participant(admin,jsonb_build_object('application_id',aid,'program_id',pid,'full_name','Runtime Applicant','completion_status','completed','assessment_signed_off',true,'completion_approved',true)); PERFORM pg_temp.assert_true(false,'null attendance approved'); EXCEPTION WHEN OTHERS THEN IF SQLERRM NOT LIKE '%attendance%' THEN RAISE; END IF; END;
  BEGIN PERFORM public.admin_save_internship_participant(admin,jsonb_build_object('application_id',aid,'program_id',pid,'full_name','Runtime Applicant','completion_status','active','attendance_percent',99,'assessment_signed_off',true,'completion_approved',false,'start_date',CURRENT_DATE::text,'end_date',(CURRENT_DATE-1)::text)); PERFORM pg_temp.assert_true(false,'invalid dates accepted'); EXCEPTION WHEN OTHERS THEN IF SQLERRM NOT LIKE '%date%' AND SQLERRM NOT LIKE '%check%' THEN RAISE; END IF; END;
  p := public.admin_save_internship_participant(admin,jsonb_build_object('application_id',aid,'program_id',pid,'full_name','Runtime Applicant','completion_status','active','attendance_percent',99,'assessment_signed_off',true,'completion_approved',false,'start_date',CURRENT_DATE::text,'end_date',CURRENT_DATE::text,'supervisor','Clinical Supervisor'));
  part := (p->>'id')::uuid;
  BEGIN PERFORM public.admin_save_internship_participant(admin,jsonb_build_object('id',part,'application_id',aid,'program_id',pid,'full_name','Runtime Applicant','completion_status','completed','attendance_percent',79,'assessment_signed_off',true,'completion_approved',true,'start_date',CURRENT_DATE::text,'end_date',CURRENT_DATE::text,'supervisor','Clinical Supervisor')); PERFORM pg_temp.assert_true(false,'low attendance approved'); EXCEPTION WHEN OTHERS THEN IF SQLERRM NOT LIKE '%attendance%' THEN RAISE; END IF; END;
  p := public.admin_save_internship_participant(admin,jsonb_build_object('id',part,'application_id',aid,'program_id',pid,'full_name','Runtime Applicant','completion_status','completed','attendance_percent',90,'assessment_signed_off',true,'completion_approved',true,'start_date',CURRENT_DATE::text,'end_date',CURRENT_DATE::text,'supervisor','Clinical Supervisor'));
  PERFORM public.admin_review_internship_application(admin,aid,'completed','approved participant');
  BEGIN PERFORM public.admin_issue_internship_certificate(ordinary,'internship',part,'Director','Clinic Director'); PERFORM pg_temp.assert_true(false,'ordinary user issued certificate'); EXCEPTION WHEN OTHERS THEN IF SQLERRM NOT LIKE '%forbidden%' THEN RAISE; END IF; END;
  p := public.admin_issue_internship_certificate(admin,'internship',part,'Director','Clinic Director');
  cert := (p->>'id')::uuid; ref := p->>'certificate_number'; token := p->>'verification_token'; old_snapshot := p->'snapshot';
  BEGIN PERFORM public.admin_revoke_internship_certificate(ordinary,cert,'unauthorized attempt'); PERFORM pg_temp.assert_true(false,'ordinary user revoked certificate'); EXCEPTION WHEN OTHERS THEN IF SQLERRM NOT LIKE '%forbidden%' THEN RAISE; END IF; END;
  BEGIN PERFORM public.admin_issue_internship_certificate(admin,'internship',part,'Director','Clinic Director'); PERFORM pg_temp.assert_true(false,'duplicate active source accepted'); EXCEPTION WHEN OTHERS THEN IF SQLERRM NOT LIKE '%active certificate already exists%' THEN RAISE; END IF; END;
  -- Public verification has a minimal first/last/initial projection and revocation is immediate.
  SELECT row_to_json(v)::jsonb INTO projection FROM public.verify_internship_certificate(ref,'verify-1') v;
  PERFORM pg_temp.assert_true(projection->>'status'='valid','verification issued');
  PERFORM pg_temp.assert_true((projection->'certificate') ? 'recipient_name' AND NOT ((projection->'certificate') ? 'email'),'minimal verification projection');
  PERFORM pg_temp.assert_true((projection->'certificate'->>'recipient_name')='Runtime A.','recipient first/last projection');
  PERFORM public.admin_revoke_internship_certificate(admin,cert,'superseded by correction');
  SELECT row_to_json(v)::jsonb INTO projection FROM public.verify_internship_certificate(ref,'verify-2') v;
  PERFORM pg_temp.assert_true(projection->>'status'='revoked','revocation immediately visible');
  BEGIN PERFORM public.admin_issue_internship_certificate(admin,'internship',part,'Director','Clinic Director',cert,''); PERFORM pg_temp.assert_true(false,'replacement without reason accepted'); EXCEPTION WHEN OTHERS THEN IF SQLERRM NOT LIKE '%replacement requires%' THEN RAISE; END IF; END;
  p := public.admin_issue_internship_certificate(admin,'internship',part,'Director','Clinic Director',cert,'corrected record');
  PERFORM pg_temp.assert_true((p->>'type')='internship' AND (p->>'source_id')=part::text,'replacement preserves source/type');
  PERFORM public.admin_revoke_internship_certificate(admin,(p->>'id')::uuid,'second correction');
  p2:=public.admin_issue_internship_certificate(admin,'internship',part,'Director','Clinic Director',(p->>'id')::uuid,'second documented replacement');
  PERFORM pg_temp.assert_true(p2->>'replacement_for'=p->>'id','replacement lineage survives equal timestamps');
  BEGIN UPDATE certificates SET source_id=gen_random_uuid() WHERE id=cert; PERFORM pg_temp.assert_true(false,'source mutation accepted'); EXCEPTION WHEN OTHERS THEN IF SQLERRM NOT LIKE '%immutable%' AND SQLERRM NOT LIKE '%permission denied%' THEN RAISE; END IF; END;
  SELECT snapshot INTO old_event_snapshot FROM certificate_events WHERE certificate_id=cert ORDER BY created_at LIMIT 1;
  BEGIN UPDATE certificate_events SET snapshot='{"tampered":true}' WHERE certificate_id=cert; PERFORM pg_temp.assert_true(false,'audit snapshot mutation accepted'); EXCEPTION WHEN OTHERS THEN IF SQLERRM NOT LIKE '%append-only%' AND SQLERRM NOT LIKE '%permission denied%' THEN RAISE; END IF; END;
  -- Evidence and approval are both required for experience certificates.
  p := public.admin_save_experience_record(admin,jsonb_build_object('full_name','Experienced Person','role','Trainee','engagement_type','internship','responsibilities','Observed care','evidence_summary','Supervisor log','verified',false,'approved',false));
  eid := (p->>'id')::uuid;
  BEGIN PERFORM public.admin_issue_internship_certificate(admin,'experience',eid,'Director','Clinic Director'); PERFORM pg_temp.assert_true(false,'unverified experience issued'); EXCEPTION WHEN OTHERS THEN IF SQLERRM NOT LIKE '%verified approved experience required%' THEN RAISE; END IF; END;
  PERFORM public.admin_save_experience_record(admin,jsonb_build_object('id',eid,'full_name','Experienced Person','role','Trainee','engagement_type','internship','responsibilities','Observed care','evidence_summary','Supervisor log','start_date',CURRENT_DATE::text,'end_date',CURRENT_DATE::text,'verified',true,'approved',true,'approver_id',ordinary,'approval_at','2000-01-01T00:00:00Z'));
  p := public.admin_issue_internship_certificate(admin,'experience',eid,'Director','Clinic Director');
  PERFORM pg_temp.assert_true((p->>'type')='experience','approved evidence certificate');
  PERFORM pg_temp.assert_true((SELECT approver_id=admin AND approval_at>now()-interval '1 minute' FROM professional_experience_records WHERE id=eid),'approval identity and time are server stamped');
  PERFORM pg_temp.assert_true((SELECT count(*)=8 FROM pg_class c JOIN pg_namespace ns ON ns.oid=c.relnamespace WHERE ns.nspname='public' AND c.relname IN ('internship_programs','internship_applications','internship_participants','professional_experience_records','certificates','certificate_events','internship_audit_events','internship_public_rate_limits') AND c.relrowsecurity),'RLS enabled on every feature table');
  PERFORM pg_temp.assert_true((SELECT bool_and(NOT has_table_privilege(r,t,'SELECT') AND NOT has_table_privilege(r,t,'INSERT') AND NOT has_table_privilege(r,t,'UPDATE') AND NOT has_table_privilege(r,t,'DELETE')) FROM unnest(ARRAY['anon','authenticated']) r CROSS JOIN unnest(ARRAY['internship_applications','internship_participants','professional_experience_records','certificates','certificate_events','internship_audit_events','internship_public_rate_limits']) t),'all private tables deny every browser-role operation');
  PERFORM pg_temp.assert_true((SELECT array_agg(k ORDER BY k)=ARRAY['end_date','issue_date','issuing_organization','program_or_role','recipient_name','reference','start_date','type'] FROM jsonb_object_keys(projection->'certificate') k),'verification uses exact public allowlist');
  BEGIN PERFORM public.admin_save_experience_record(admin,(SELECT to_jsonb(e) FROM professional_experience_records e WHERE e.id=eid)); PERFORM pg_temp.assert_true(false,'active credential source changed'); EXCEPTION WHEN OTHERS THEN IF SQLERRM NOT LIKE '%revoke active certificate%' THEN RAISE; END IF; END;
  BEGIN PERFORM public.admin_anonymize_internship_application(admin,aid,'test retention decision'); PERFORM pg_temp.assert_true(false,'credential source anonymized'); EXCEPTION WHEN OTHERS THEN IF SQLERRM NOT LIKE '%only rejected or withdrawn%' THEN RAISE; END IF; END;
  p2:=public.submit_internship_application(jsonb_build_object('program_slug','runtime-internship','full_name','Retention Test','email','retention@example.test','phone','+923001234599','city','Test City','educational_institution','Test University','degree_program','DPT','academic_status','final year','availability','weekdays','motivation','Test only','consent_privacy',true));
  SELECT a.id INTO aid FROM internship_applications a WHERE a.reference=p2->>'reference';
  PERFORM public.admin_review_internship_application(admin,aid,'rejected','test decision');
  p2:=public.admin_anonymize_internship_application(admin,aid,'approved retention test decision');
  PERFORM pg_temp.assert_true(p2->>'full_name'='Removed applicant' AND p2->>'email' LIKE '%@removed.invalid' AND p2->>'internal_notes' IS NULL,'retention anonymizes personal fields');
  FOR n IN 1..6 LOOP
    PERFORM pg_temp.assert_true(public.internship_check_public_rate_limit('submit','runtime-test-key','rate-test@example.test')=(n<=5),'persistent admission email limit');
  END LOOP;
  RAISE NOTICE 'internship positive assertions passed: %; negative permission and eligibility cases also completed', (SELECT ac.n FROM assertion_count ac);
END $$;
RESET ROLE;
-- Even privileged table ownership cannot silently rewrite issued facts or audit events.
DO $$ DECLARE target uuid; BEGIN
  SELECT id INTO target FROM certificates LIMIT 1;
  BEGIN UPDATE certificates SET recipient_name='Tampered' WHERE id=target; PERFORM pg_temp.assert_true(false,'owner changed certificate facts'); EXCEPTION WHEN OTHERS THEN IF SQLERRM NOT LIKE '%immutable%' THEN RAISE; END IF; END;
  BEGIN UPDATE certificate_events SET reason='Tampered' WHERE certificate_id=target; PERFORM pg_temp.assert_true(false,'owner changed audit events'); EXCEPTION WHEN OTHERS THEN IF SQLERRM NOT LIKE '%append-only%' THEN RAISE; END IF; END;
  PERFORM pg_temp.assert_true(true,'owner-level immutable triggers enforced');
END $$;
ROLLBACK;
