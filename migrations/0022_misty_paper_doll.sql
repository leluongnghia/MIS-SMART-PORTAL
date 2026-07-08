ALTER TABLE "events" ADD COLUMN "type" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "status" text DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "start_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "end_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "manager_id" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "budget" integer;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;