CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'cancelled', 'completed');--> statement-breakpoint
CREATE TYPE "public"."letter_approval_status" AS ENUM('pending', 'approved', 'rejected', 'delegated');--> statement-breakpoint
CREATE TYPE "public"."letter_status" AS ENUM('draft', 'pending_approval', 'approved', 'sent', 'archived', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."letter_type" AS ENUM('incoming', 'outgoing', 'internal');--> statement-breakpoint
CREATE TYPE "public"."room_status" AS ENUM('available', 'occupied', 'maintenance');--> statement-breakpoint
CREATE TABLE "letter_approvals" (
	"id" text PRIMARY KEY NOT NULL,
	"letter_id" text NOT NULL,
	"approver_id" text NOT NULL,
	"step_order" integer DEFAULT 1 NOT NULL,
	"status" "letter_approval_status" DEFAULT 'pending' NOT NULL,
	"comment" text,
	"action_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meeting_rooms" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"building" text,
	"floor" text,
	"capacity" integer DEFAULT 10,
	"facilities" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "room_status" DEFAULT 'available' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "official_letters" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"type" "letter_type" DEFAULT 'incoming' NOT NULL,
	"status" "letter_status" DEFAULT 'draft' NOT NULL,
	"subject" text NOT NULL,
	"summary" text,
	"from_org" text,
	"to_org" text,
	"issued_date" text,
	"received_date" text,
	"due_date" text,
	"file_url" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"priority" text DEFAULT 'normal',
	"created_by" text,
	"assigned_to" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "official_letters_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "room_bookings" (
	"id" text PRIMARY KEY NOT NULL,
	"room_id" text NOT NULL,
	"title" text NOT NULL,
	"organizer" text,
	"date" text NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"attendees_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"purpose" text,
	"status" "booking_status" DEFAULT 'confirmed' NOT NULL,
	"cancel_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "letter_approvals" ADD CONSTRAINT "letter_approvals_letter_id_official_letters_id_fk" FOREIGN KEY ("letter_id") REFERENCES "public"."official_letters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "letter_approvals" ADD CONSTRAINT "letter_approvals_approver_id_employee_profiles_id_fk" FOREIGN KEY ("approver_id") REFERENCES "public"."employee_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "official_letters" ADD CONSTRAINT "official_letters_created_by_employee_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."employee_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "official_letters" ADD CONSTRAINT "official_letters_assigned_to_employee_profiles_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."employee_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_bookings" ADD CONSTRAINT "room_bookings_room_id_meeting_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."meeting_rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_bookings" ADD CONSTRAINT "room_bookings_organizer_employee_profiles_id_fk" FOREIGN KEY ("organizer") REFERENCES "public"."employee_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "letter_approval_letter_idx" ON "letter_approvals" USING btree ("letter_id");--> statement-breakpoint
CREATE UNIQUE INDEX "letter_approval_step_uniq" ON "letter_approvals" USING btree ("letter_id","step_order");--> statement-breakpoint
CREATE INDEX "meeting_rooms_status_idx" ON "meeting_rooms" USING btree ("status");--> statement-breakpoint
CREATE INDEX "official_letters_type_idx" ON "official_letters" USING btree ("type","status");--> statement-breakpoint
CREATE INDEX "official_letters_issued_idx" ON "official_letters" USING btree ("issued_date");--> statement-breakpoint
CREATE INDEX "room_bookings_room_date_idx" ON "room_bookings" USING btree ("room_id","date");--> statement-breakpoint
CREATE INDEX "room_bookings_organizer_idx" ON "room_bookings" USING btree ("organizer");