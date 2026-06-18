ALTER TABLE "data_files" ADD COLUMN "display_name" text;--> statement-breakpoint
ALTER TABLE "data_files" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "data_files" ADD COLUMN "extension" text;--> statement-breakpoint
ALTER TABLE "data_files" ADD COLUMN "category" text;--> statement-breakpoint
ALTER TABLE "data_files" ADD COLUMN "related_module" text;--> statement-breakpoint
ALTER TABLE "data_files" ADD COLUMN "download_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "data_files" ADD COLUMN "archived_at" timestamp with time zone;