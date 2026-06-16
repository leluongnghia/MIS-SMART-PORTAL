ALTER TABLE "users" ADD COLUMN "employee_code" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "staff_type" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "joined_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "manager_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "teaching_level" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subject" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "homeroom_class_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_changed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "must_change_password" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "internal_note" text;