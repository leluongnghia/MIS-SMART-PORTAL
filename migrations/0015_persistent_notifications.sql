CREATE TABLE IF NOT EXISTS "notifications" (
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
CREATE TABLE IF NOT EXISTS "notification_recipients" (
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
CREATE INDEX IF NOT EXISTS "notifications_module_idx" ON "notifications" ("module");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_source_idx" ON "notifications" ("source_type", "source_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_created_idx" ON "notifications" ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notification_recipients_user_status_idx" ON "notification_recipients" ("user_id", "status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notification_recipients_notification_idx" ON "notification_recipients" ("notification_id");
