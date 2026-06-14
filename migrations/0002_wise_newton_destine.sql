ALTER TABLE "lead_pipeline" ALTER COLUMN "from_status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "lead_pipeline" ALTER COLUMN "to_status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "leads" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "leads" ALTER COLUMN "status" SET DEFAULT 'received'::text;--> statement-breakpoint
DROP TYPE "public"."lead_status";--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('received', 'consulting', 'test_scheduled', 'test_participated', 'seat_reserved', 'docs_submitted', 'enrolled', 'cancelled');--> statement-breakpoint
ALTER TABLE "lead_pipeline" ALTER COLUMN "from_status" SET DATA TYPE "public"."lead_status" USING "from_status"::"public"."lead_status";--> statement-breakpoint
ALTER TABLE "lead_pipeline" ALTER COLUMN "to_status" SET DATA TYPE "public"."lead_status" USING "to_status"::"public"."lead_status";--> statement-breakpoint
ALTER TABLE "leads" ALTER COLUMN "status" SET DEFAULT 'received'::"public"."lead_status";--> statement-breakpoint
ALTER TABLE "leads" ALTER COLUMN "status" SET DATA TYPE "public"."lead_status" USING "status"::"public"."lead_status";--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "date_of_birth" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "current_class" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "current_school" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "enrollment_system" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "test_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "test_time" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "math_score" integer;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "english_score" integer;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "vietnamese_score" integer;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "scholarship_percent" integer;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "period_discount_percent" integer;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "sibling_discount_percent" integer;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "staff_discount_percent" integer;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "other_discount_percent" integer;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "final_tuition" integer;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "seat_reservation_fee" integer;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "additional_fee" integer;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "seat_reservation_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "national_student_id" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "insurance_id" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "moet_student_id" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "siblings_info" jsonb;