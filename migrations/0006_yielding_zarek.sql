CREATE TABLE "data_export_jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"module" text NOT NULL,
	"file_id" text,
	"filters" jsonb,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"created_by" text,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "data_files" (
	"id" text PRIMARY KEY NOT NULL,
	"file_name" text NOT NULL,
	"original_name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"document_type" text,
	"tags" jsonb,
	"visibility" text DEFAULT 'SCHOOL' NOT NULL,
	"department_id" text,
	"version" integer DEFAULT 1 NOT NULL,
	"parent_file_id" text,
	"uploaded_by" text,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "data_import_jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"module" text NOT NULL,
	"file_id" text,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"total_rows" integer DEFAULT 0 NOT NULL,
	"success_rows" integer DEFAULT 0 NOT NULL,
	"failed_rows" integer DEFAULT 0 NOT NULL,
	"error_summary" jsonb,
	"mapping_config" jsonb,
	"created_by" text,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"group" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"metadata" jsonb,
	"created_by" text,
	"updated_by" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "system_settings" ADD COLUMN "group" text;--> statement-breakpoint
ALTER TABLE "system_settings" ADD COLUMN "label" text;--> statement-breakpoint
ALTER TABLE "system_settings" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "system_settings" ADD COLUMN "is_secret" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "system_settings" ADD COLUMN "is_editable" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "system_settings" ADD COLUMN "updated_by" text;--> statement-breakpoint
CREATE INDEX "data_files_visibility_idx" ON "data_files" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "data_files_uploaded_by_idx" ON "data_files" USING btree ("uploaded_by");--> statement-breakpoint
CREATE INDEX "data_files_status_idx" ON "data_files" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sys_categories_group_idx" ON "system_categories" USING btree ("group");--> statement-breakpoint
CREATE INDEX "sys_categories_status_idx" ON "system_categories" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sys_categories_deleted_idx" ON "system_categories" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "sys_categories_group_code_idx" ON "system_categories" USING btree ("group","code");