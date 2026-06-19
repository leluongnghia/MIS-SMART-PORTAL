CREATE TABLE IF NOT EXISTS "system_settings" (
  "key" text PRIMARY KEY NOT NULL,
  "value" text NOT NULL,
  "group" text,
  "label" text,
  "description" text,
  "is_secret" boolean DEFAULT false NOT NULL,
  "is_editable" boolean DEFAULT true NOT NULL,
  "updated_by" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "system_settings" ADD COLUMN IF NOT EXISTS "group" text;
--> statement-breakpoint
ALTER TABLE "system_settings" ADD COLUMN IF NOT EXISTS "label" text;
--> statement-breakpoint
ALTER TABLE "system_settings" ADD COLUMN IF NOT EXISTS "description" text;
--> statement-breakpoint
ALTER TABLE "system_settings" ADD COLUMN IF NOT EXISTS "is_secret" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "system_settings" ADD COLUMN IF NOT EXISTS "is_editable" boolean DEFAULT true NOT NULL;
--> statement-breakpoint
ALTER TABLE "system_settings" ADD COLUMN IF NOT EXISTS "updated_by" text;
