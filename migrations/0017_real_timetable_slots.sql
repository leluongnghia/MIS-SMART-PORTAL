CREATE TABLE IF NOT EXISTS "timetable_slots" (
  "id" text PRIMARY KEY NOT NULL,
  "day" integer NOT NULL,
  "period" integer NOT NULL,
  "subject" text NOT NULL,
  "class_name" text NOT NULL,
  "teacher_id" text,
  "teacher_name" text,
  "room" text NOT NULL,
  "academic_year_id" text,
  "status" text DEFAULT 'ACTIVE' NOT NULL,
  "payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "timetable_slots_day_period_idx" ON "timetable_slots" ("day", "period");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "timetable_slots_class_idx" ON "timetable_slots" ("class_name");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "timetable_slots_teacher_idx" ON "timetable_slots" ("teacher_id");
