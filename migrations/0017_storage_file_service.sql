ALTER TABLE "data_files" ADD COLUMN IF NOT EXISTS "mime_type" text;
--> statement-breakpoint
ALTER TABLE "data_files" ADD COLUMN IF NOT EXISTS "storage_provider" text DEFAULT 'LOCAL' NOT NULL;
--> statement-breakpoint
ALTER TABLE "data_files" ADD COLUMN IF NOT EXISTS "storage_key" text;
--> statement-breakpoint
ALTER TABLE "data_files" ADD COLUMN IF NOT EXISTS "module" text DEFAULT 'SYSTEM' NOT NULL;
--> statement-breakpoint
ALTER TABLE "data_files" ADD COLUMN IF NOT EXISTS "entity_type" text;
--> statement-breakpoint
ALTER TABLE "data_files" ADD COLUMN IF NOT EXISTS "entity_id" text;
--> statement-breakpoint
ALTER TABLE "data_files" ADD COLUMN IF NOT EXISTS "entity_label" text;
--> statement-breakpoint
ALTER TABLE "data_files" ADD COLUMN IF NOT EXISTS "uploaded_by_name" text;
--> statement-breakpoint
ALTER TABLE "data_files" ADD COLUMN IF NOT EXISTS "deleted_by" text;
--> statement-breakpoint
ALTER TABLE "data_files" ADD COLUMN IF NOT EXISTS "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL;
--> statement-breakpoint
UPDATE "data_files" SET "mime_type" = COALESCE("mime_type", "file_type"), "storage_key" = COALESCE("storage_key", "file_name"), "module" = CASE WHEN COALESCE("related_module", '') ILIKE '%tuyển sinh%' THEN 'ADMISSIONS' WHEN COALESCE("related_module", '') ILIKE '%học sinh%' THEN 'STUDENTS' WHEN COALESCE("related_module", '') ILIKE '%csvc%' OR COALESCE("related_module", '') ILIKE '%thiết bị%' THEN 'FACILITIES' WHEN COALESCE("related_module", '') ILIKE '%báo cáo%' THEN 'REPORTS' WHEN COALESCE("related_module", '') ILIKE '%phê duyệt%' THEN 'APPROVALS' WHEN COALESCE("related_module", '') ILIKE '%cấu hình%' THEN 'SETTINGS' ELSE COALESCE(NULLIF("module", ''), 'SYSTEM') END;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "data_files_module_idx" ON "data_files" ("module");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "data_files_entity_idx" ON "data_files" ("entity_type", "entity_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "data_files_storage_key_idx" ON "data_files" ("storage_provider", "storage_key");
