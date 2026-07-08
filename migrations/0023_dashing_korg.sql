CREATE TABLE "communication_campaigns" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"objective" text,
	"audience" jsonb DEFAULT '[]'::jsonb,
	"channels" jsonb DEFAULT '[]'::jsonb,
	"start_at" timestamp with time zone,
	"end_at" timestamp with time zone,
	"manager_id" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"content" text,
	"metrics" jsonb DEFAULT '{}'::jsonb,
	"deleted_at" timestamp with time zone,
	"deleted_by" text,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "communication_campaigns" ADD CONSTRAINT "communication_campaigns_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;