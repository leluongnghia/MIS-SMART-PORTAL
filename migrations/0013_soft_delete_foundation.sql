ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "deleted_by" text;
--> statement-breakpoint
ALTER TABLE "directives" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "directives" ADD COLUMN IF NOT EXISTS "deleted_by" text;
--> statement-breakpoint
ALTER TABLE "announcements" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "announcements" ADD COLUMN IF NOT EXISTS "deleted_by" text;
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "deleted_by" text;
--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "deleted_by" text;
