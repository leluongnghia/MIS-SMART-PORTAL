ALTER TABLE "parent_tickets" ADD COLUMN "sender_role" text;--> statement-breakpoint
ALTER TABLE "parent_tickets" ADD COLUMN "class_name" text;--> statement-breakpoint
ALTER TABLE "parent_tickets" ADD COLUMN "file_url" text;--> statement-breakpoint
ALTER TABLE "parent_tickets" ADD COLUMN "file_name" text;--> statement-breakpoint
ALTER TABLE "parent_tickets" ADD COLUMN "expected_resolution_date" timestamp with time zone;