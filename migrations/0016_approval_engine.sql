CREATE TABLE IF NOT EXISTS "approval_requests" (
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
CREATE TABLE IF NOT EXISTS "approval_events" (
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
CREATE INDEX IF NOT EXISTS "approval_requests_status_idx" ON "approval_requests" ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "approval_requests_module_status_idx" ON "approval_requests" ("module", "status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "approval_requests_entity_idx" ON "approval_requests" ("entity_type", "entity_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "approval_requests_requester_idx" ON "approval_requests" ("requester_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "approval_requests_approver_idx" ON "approval_requests" ("approver_id", "approver_role", "approver_workspace_id", "approver_department_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "approval_events_request_idx" ON "approval_events" ("approval_request_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "approval_events_created_idx" ON "approval_events" ("created_at");
