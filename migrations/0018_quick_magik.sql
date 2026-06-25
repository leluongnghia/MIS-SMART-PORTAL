CREATE TABLE "service_ticket_activities" (
	"id" text PRIMARY KEY NOT NULL,
	"ticket_id" text NOT NULL,
	"actor_id" text,
	"actor_name" text,
	"action" text NOT NULL,
	"content" text,
	"from_status" text,
	"to_status" text,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_tickets" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"service_group" text NOT NULL,
	"priority" text NOT NULL,
	"location" text,
	"detected_at" timestamp with time zone,
	"reported_by" text,
	"reporter_id" text,
	"description" text,
	"status" text DEFAULT 'NEW' NOT NULL,
	"assigned_to_id" text,
	"department_scope" text,
	"deleted_at" timestamp with time zone,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "service_tickets_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "department_scope" text;--> statement-breakpoint
ALTER TABLE "service_ticket_activities" ADD CONSTRAINT "service_ticket_activities_ticket_id_service_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."service_tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_ticket_activities" ADD CONSTRAINT "service_ticket_activities_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_tickets" ADD CONSTRAINT "service_tickets_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "service_ticket_activities_ticket_idx" ON "service_ticket_activities" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "service_tickets_status_idx" ON "service_tickets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "service_tickets_group_idx" ON "service_tickets" USING btree ("service_group");--> statement-breakpoint
CREATE INDEX "service_tickets_assigned_idx" ON "service_tickets" USING btree ("assigned_to_id");