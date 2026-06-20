CREATE TABLE "academic_years" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"is_current" boolean DEFAULT false NOT NULL,
	"school_id" text,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "approval_events" (
	"id" text PRIMARY KEY NOT NULL,
	"approval_request_id" text NOT NULL,
	"action" text NOT NULL,
	"from_status" text,
	"to_status" text,
	"actor_id" text,
	"actor_name" text,
	"comment" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "approval_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"module" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"requester_id" text,
	"requester_name" text,
	"approver_id" text,
	"approver_role" text,
	"approver_workspace_id" text,
	"approver_department_id" text,
	"current_step" integer DEFAULT 1 NOT NULL,
	"target_url" text,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now(),
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "classes" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text,
	"grade_level" text NOT NULL,
	"academic_year_id" text,
	"homeroom_teacher_id" text,
	"room_location_id" text,
	"capacity" integer,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "classes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "notification_recipients" (
	"id" text PRIMARY KEY NOT NULL,
	"notification_id" text NOT NULL,
	"user_id" text NOT NULL,
	"status" text DEFAULT 'UNREAD' NOT NULL,
	"read_at" timestamp with time zone,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"module" text NOT NULL,
	"type" text NOT NULL,
	"severity" text DEFAULT 'INFO' NOT NULL,
	"actor_id" text,
	"actor_name" text,
	"target_url" text,
	"source_type" text,
	"source_id" text,
	"scope_type" text DEFAULT 'USER' NOT NULL,
	"scope_id" text,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schools" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"phone" text,
	"email" text,
	"website" text,
	"principal_name" text,
	"established_date" timestamp with time zone,
	"logo_url" text,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "schools_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "announcements" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "announcements" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "data_files" ADD COLUMN "mime_type" text;--> statement-breakpoint
ALTER TABLE "data_files" ADD COLUMN "storage_provider" text DEFAULT 'LOCAL' NOT NULL;--> statement-breakpoint
ALTER TABLE "data_files" ADD COLUMN "storage_key" text;--> statement-breakpoint
ALTER TABLE "data_files" ADD COLUMN "module" text DEFAULT 'SYSTEM' NOT NULL;--> statement-breakpoint
ALTER TABLE "data_files" ADD COLUMN "entity_type" text;--> statement-breakpoint
ALTER TABLE "data_files" ADD COLUMN "entity_id" text;--> statement-breakpoint
ALTER TABLE "data_files" ADD COLUMN "entity_label" text;--> statement-breakpoint
ALTER TABLE "data_files" ADD COLUMN "uploaded_by_name" text;--> statement-breakpoint
ALTER TABLE "data_files" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "data_files" ADD COLUMN "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "directives" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "directives" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "academic_years" ADD CONSTRAINT "academic_years_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_homeroom_teacher_id_users_id_fk" FOREIGN KEY ("homeroom_teacher_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "approval_events_request_idx" ON "approval_events" USING btree ("approval_request_id");--> statement-breakpoint
CREATE INDEX "approval_events_created_idx" ON "approval_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "approval_requests_status_idx" ON "approval_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "approval_requests_module_status_idx" ON "approval_requests" USING btree ("module","status");--> statement-breakpoint
CREATE INDEX "approval_requests_entity_idx" ON "approval_requests" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "approval_requests_requester_idx" ON "approval_requests" USING btree ("requester_id");--> statement-breakpoint
CREATE INDEX "approval_requests_approver_idx" ON "approval_requests" USING btree ("approver_id","approver_role","approver_workspace_id","approver_department_id");--> statement-breakpoint
CREATE INDEX "notification_recipients_user_status_idx" ON "notification_recipients" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "notification_recipients_notification_idx" ON "notification_recipients" USING btree ("notification_id");--> statement-breakpoint
CREATE INDEX "notifications_module_idx" ON "notifications" USING btree ("module");--> statement-breakpoint
CREATE INDEX "notifications_source_idx" ON "notifications" USING btree ("source_type","source_id");--> statement-breakpoint
CREATE INDEX "notifications_created_idx" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "data_files_module_idx" ON "data_files" USING btree ("module");--> statement-breakpoint
CREATE INDEX "data_files_entity_idx" ON "data_files" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "data_files_storage_key_idx" ON "data_files" USING btree ("storage_provider","storage_key");