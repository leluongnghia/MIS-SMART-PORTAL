CREATE TYPE "public"."academic_attendance_status" AS ENUM('present', 'absent_excused', 'absent_unexcused', 'late');--> statement-breakpoint
CREATE TYPE "public"."academic_level" AS ENUM('primary', 'secondary', 'high');--> statement-breakpoint
CREATE TYPE "public"."conduct_term_rating" AS ENUM('excellent', 'good', 'fair', 'weak');--> statement-breakpoint
CREATE TYPE "public"."conduct_type" AS ENUM('violation', 'progress', 'support', 'praise');--> statement-breakpoint
CREATE TYPE "public"."exam_status" AS ENUM('planned', 'ongoing', 'grading', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."exam_type" AS ENUM('quiz', 'periodic', 'midterm', 'final', 'mock');--> statement-breakpoint
CREATE TYPE "public"."lesson_plan_status" AS ENUM('draft', 'submitted', 'approved', 'rejected', 'published');--> statement-breakpoint
CREATE TYPE "public"."observation_result" AS ENUM('excellent', 'good', 'achieved', 'needs_improvement');--> statement-breakpoint
CREATE TYPE "public"."question_difficulty" AS ENUM('recognition', 'comprehension', 'application', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."question_type" AS ENUM('mcq', 'true_false', 'short_answer', 'essay');--> statement-breakpoint
CREATE TABLE "communication_book" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"date" text NOT NULL,
	"author_type" text NOT NULL,
	"author_id" text,
	"content" text NOT NULL,
	"category" text,
	"parent_seen_at" timestamp with time zone,
	"teacher_seen_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conduct_term_ratings" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"school_year" text,
	"term" text,
	"rating" "conduct_term_rating",
	"strengths" text,
	"reminders" text,
	"homeroom_teacher_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exam_question_bank" (
	"id" text PRIMARY KEY NOT NULL,
	"subject_id" text NOT NULL,
	"grade" integer,
	"chapter" text,
	"question_type" "question_type" DEFAULT 'mcq' NOT NULL,
	"difficulty" "question_difficulty" DEFAULT 'comprehension' NOT NULL,
	"content" text NOT NULL,
	"options" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"answer" text,
	"points" text DEFAULT '1',
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exam_results" (
	"id" text PRIMARY KEY NOT NULL,
	"exam_id" text NOT NULL,
	"student_id" text NOT NULL,
	"score" text,
	"rank" integer,
	"note" text,
	"graded_by" text,
	"graded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exams" (
	"id" text PRIMARY KEY NOT NULL,
	"subject_id" text NOT NULL,
	"class_id" text,
	"teacher_id" text,
	"title" text NOT NULL,
	"type" "exam_type" DEFAULT 'periodic' NOT NULL,
	"date" text,
	"duration_minutes" integer,
	"total_points" text DEFAULT '10',
	"school_year" text,
	"term" text,
	"status" "exam_status" DEFAULT 'planned' NOT NULL,
	"question_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "homeroom_assignments" (
	"id" text PRIMARY KEY NOT NULL,
	"class_id" text NOT NULL,
	"teacher_id" text NOT NULL,
	"role" text NOT NULL,
	"school_year" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"teacher_id" text NOT NULL,
	"subject_id" text,
	"class_id" text,
	"group_id" text,
	"title" text NOT NULL,
	"week" integer,
	"school_year" text,
	"term" text,
	"content" text,
	"file_url" text,
	"status" "lesson_plan_status" DEFAULT 'draft' NOT NULL,
	"submitted_at" timestamp with time zone,
	"approved_by" text,
	"approved_at" timestamp with time zone,
	"review_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rewards_disciplines" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"type" text NOT NULL,
	"reason" text,
	"decision" text,
	"decided_by" text,
	"date" text,
	"document_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_attendance" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"class_id" text NOT NULL,
	"date" text NOT NULL,
	"period" integer,
	"status" "academic_attendance_status" DEFAULT 'present' NOT NULL,
	"reason" text,
	"recorded_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_conduct_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"class_id" text,
	"date" text NOT NULL,
	"type" "conduct_type" NOT NULL,
	"description" text,
	"points" integer,
	"handled_by" text,
	"notified_parent" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subject_group_meetings" (
	"id" text PRIMARY KEY NOT NULL,
	"group_id" text NOT NULL,
	"date" text NOT NULL,
	"title" text,
	"minutes" text,
	"attendees" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"attachment_url" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subject_group_members" (
	"id" text PRIMARY KEY NOT NULL,
	"group_id" text NOT NULL,
	"teacher_id" text NOT NULL,
	"role_in_group" text,
	"joined_at" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subject_groups" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"level" "academic_level",
	"head_teacher_id" text,
	"deputy_teacher_id" text,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subject_quality_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"subject_id" text,
	"class_id" text,
	"grade" integer,
	"school_year" text,
	"term" text,
	"avg_score" text,
	"pass_rate" text,
	"excellent_rate" text,
	"weak_count" integer,
	"summary" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"level" "academic_level",
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teaching_assignments" (
	"id" text PRIMARY KEY NOT NULL,
	"teacher_id" text NOT NULL,
	"subject_id" text NOT NULL,
	"class_id" text NOT NULL,
	"school_year" text,
	"term" text,
	"periods_per_week" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teaching_observations" (
	"id" text PRIMARY KEY NOT NULL,
	"observer_id" text NOT NULL,
	"teacher_id" text NOT NULL,
	"subject_id" text,
	"class_id" text,
	"date" text NOT NULL,
	"period" integer,
	"score" text,
	"result" "observation_result",
	"strengths" text,
	"improvements" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "timetable_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"class_id" text NOT NULL,
	"subject_id" text,
	"teacher_id" text,
	"day_of_week" integer NOT NULL,
	"period" integer NOT NULL,
	"start_time" text,
	"end_time" text,
	"room" text,
	"school_year" text,
	"term" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "communication_book" ADD CONSTRAINT "communication_book_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conduct_term_ratings" ADD CONSTRAINT "conduct_term_ratings_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conduct_term_ratings" ADD CONSTRAINT "conduct_term_ratings_homeroom_teacher_id_employee_profiles_id_fk" FOREIGN KEY ("homeroom_teacher_id") REFERENCES "public"."employee_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_question_bank" ADD CONSTRAINT "exam_question_bank_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_question_bank" ADD CONSTRAINT "exam_question_bank_created_by_employee_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."employee_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_results" ADD CONSTRAINT "exam_results_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_results" ADD CONSTRAINT "exam_results_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_results" ADD CONSTRAINT "exam_results_graded_by_employee_profiles_id_fk" FOREIGN KEY ("graded_by") REFERENCES "public"."employee_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_teacher_id_employee_profiles_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."employee_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "homeroom_assignments" ADD CONSTRAINT "homeroom_assignments_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "homeroom_assignments" ADD CONSTRAINT "homeroom_assignments_teacher_id_employee_profiles_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."employee_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_plans" ADD CONSTRAINT "lesson_plans_teacher_id_employee_profiles_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."employee_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_plans" ADD CONSTRAINT "lesson_plans_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_plans" ADD CONSTRAINT "lesson_plans_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_plans" ADD CONSTRAINT "lesson_plans_group_id_subject_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."subject_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_plans" ADD CONSTRAINT "lesson_plans_approved_by_employee_profiles_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."employee_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rewards_disciplines" ADD CONSTRAINT "rewards_disciplines_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rewards_disciplines" ADD CONSTRAINT "rewards_disciplines_decided_by_employee_profiles_id_fk" FOREIGN KEY ("decided_by") REFERENCES "public"."employee_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_attendance" ADD CONSTRAINT "student_attendance_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_attendance" ADD CONSTRAINT "student_attendance_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_attendance" ADD CONSTRAINT "student_attendance_recorded_by_employee_profiles_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."employee_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_conduct_logs" ADD CONSTRAINT "student_conduct_logs_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_conduct_logs" ADD CONSTRAINT "student_conduct_logs_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_conduct_logs" ADD CONSTRAINT "student_conduct_logs_handled_by_employee_profiles_id_fk" FOREIGN KEY ("handled_by") REFERENCES "public"."employee_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subject_group_meetings" ADD CONSTRAINT "subject_group_meetings_group_id_subject_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."subject_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subject_group_meetings" ADD CONSTRAINT "subject_group_meetings_created_by_employee_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."employee_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subject_group_members" ADD CONSTRAINT "subject_group_members_group_id_subject_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."subject_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subject_group_members" ADD CONSTRAINT "subject_group_members_teacher_id_employee_profiles_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."employee_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subject_groups" ADD CONSTRAINT "subject_groups_head_teacher_id_employee_profiles_id_fk" FOREIGN KEY ("head_teacher_id") REFERENCES "public"."employee_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subject_groups" ADD CONSTRAINT "subject_groups_deputy_teacher_id_employee_profiles_id_fk" FOREIGN KEY ("deputy_teacher_id") REFERENCES "public"."employee_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subject_quality_reports" ADD CONSTRAINT "subject_quality_reports_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subject_quality_reports" ADD CONSTRAINT "subject_quality_reports_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subject_quality_reports" ADD CONSTRAINT "subject_quality_reports_created_by_employee_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."employee_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teaching_assignments" ADD CONSTRAINT "teaching_assignments_teacher_id_employee_profiles_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."employee_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teaching_assignments" ADD CONSTRAINT "teaching_assignments_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teaching_assignments" ADD CONSTRAINT "teaching_assignments_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teaching_observations" ADD CONSTRAINT "teaching_observations_observer_id_employee_profiles_id_fk" FOREIGN KEY ("observer_id") REFERENCES "public"."employee_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teaching_observations" ADD CONSTRAINT "teaching_observations_teacher_id_employee_profiles_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."employee_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teaching_observations" ADD CONSTRAINT "teaching_observations_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teaching_observations" ADD CONSTRAINT "teaching_observations_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_entries" ADD CONSTRAINT "timetable_entries_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_entries" ADD CONSTRAINT "timetable_entries_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_entries" ADD CONSTRAINT "timetable_entries_teacher_id_employee_profiles_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."employee_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "commbook_student_idx" ON "communication_book" USING btree ("student_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "conduct_term_uniq" ON "conduct_term_ratings" USING btree ("student_id","school_year","term");--> statement-breakpoint
CREATE INDEX "qbank_subject_idx" ON "exam_question_bank" USING btree ("subject_id","grade");--> statement-breakpoint
CREATE INDEX "qbank_difficulty_idx" ON "exam_question_bank" USING btree ("difficulty");--> statement-breakpoint
CREATE INDEX "exam_result_exam_idx" ON "exam_results" USING btree ("exam_id");--> statement-breakpoint
CREATE UNIQUE INDEX "exam_result_uniq" ON "exam_results" USING btree ("exam_id","student_id");--> statement-breakpoint
CREATE INDEX "exam_class_idx" ON "exams" USING btree ("class_id");--> statement-breakpoint
CREATE INDEX "exam_subject_idx" ON "exams" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "exam_status_idx" ON "exams" USING btree ("status");--> statement-breakpoint
CREATE INDEX "homeroom_class_idx" ON "homeroom_assignments" USING btree ("class_id");--> statement-breakpoint
CREATE UNIQUE INDEX "homeroom_uniq" ON "homeroom_assignments" USING btree ("class_id","teacher_id","role","school_year");--> statement-breakpoint
CREATE INDEX "lesson_plan_teacher_idx" ON "lesson_plans" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX "lesson_plan_status_idx" ON "lesson_plans" USING btree ("status");--> statement-breakpoint
CREATE INDEX "reward_student_idx" ON "rewards_disciplines" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "att_day_idx" ON "student_attendance" USING btree ("date","class_id");--> statement-breakpoint
CREATE UNIQUE INDEX "att_student_day_idx" ON "student_attendance" USING btree ("student_id","date","period");--> statement-breakpoint
CREATE INDEX "conduct_student_idx" ON "student_conduct_logs" USING btree ("student_id","date");--> statement-breakpoint
CREATE INDEX "conduct_type_idx" ON "student_conduct_logs" USING btree ("type");--> statement-breakpoint
CREATE INDEX "sg_meeting_group_idx" ON "subject_group_meetings" USING btree ("group_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "sg_member_uniq" ON "subject_group_members" USING btree ("group_id","teacher_id");--> statement-breakpoint
CREATE INDEX "sg_member_group_idx" ON "subject_group_members" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "subject_groups_name_idx" ON "subject_groups" USING btree ("name");--> statement-breakpoint
CREATE INDEX "sqr_scope_idx" ON "subject_quality_reports" USING btree ("subject_id","class_id","term");--> statement-breakpoint
CREATE UNIQUE INDEX "subjects_code_idx" ON "subjects" USING btree ("code");--> statement-breakpoint
CREATE INDEX "teach_assign_teacher_idx" ON "teaching_assignments" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX "teach_assign_class_idx" ON "teaching_assignments" USING btree ("class_id");--> statement-breakpoint
CREATE UNIQUE INDEX "teach_assign_uniq" ON "teaching_assignments" USING btree ("teacher_id","subject_id","class_id","school_year","term");--> statement-breakpoint
CREATE INDEX "obs_teacher_idx" ON "teaching_observations" USING btree ("teacher_id","date");--> statement-breakpoint
CREATE INDEX "tt_class_day_idx" ON "timetable_entries" USING btree ("class_id","day_of_week");--> statement-breakpoint
CREATE UNIQUE INDEX "tt_slot_uniq" ON "timetable_entries" USING btree ("class_id","day_of_week","period","school_year","term");