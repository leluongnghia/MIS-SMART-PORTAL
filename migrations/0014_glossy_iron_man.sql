CREATE TYPE "public"."health_severity" AS ENUM('info', 'minor', 'moderate', 'serious', 'emergency');--> statement-breakpoint
CREATE TYPE "public"."incident_severity" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."meal_plan_type" AS ENUM('full', 'lunch_only', 'custom');--> statement-breakpoint
CREATE TYPE "public"."meal_type" AS ENUM('breakfast', 'lunch', 'snack', 'dinner');--> statement-breakpoint
CREATE TYPE "public"."medication_status" AS ENUM('active', 'completed', 'stopped');--> statement-breakpoint
CREATE TYPE "public"."ops_registration_status" AS ENUM('pending', 'active', 'paused', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."transport_board_status" AS ENUM('boarded', 'alighted', 'absent', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."transport_direction" AS ENUM('pickup', 'dropoff', 'both');--> statement-breakpoint
CREATE TYPE "public"."vehicle_status" AS ENUM('active', 'maintenance', 'inactive');--> statement-breakpoint
CREATE TABLE "health_incidents" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"symptom" text,
	"first_aid_given" text,
	"severity" "health_severity" DEFAULT 'minor' NOT NULL,
	"handled_by" text,
	"referred_to_hospital" boolean DEFAULT false NOT NULL,
	"notified_parent_at" timestamp with time zone,
	"follow_up" text,
	"confidential" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "health_medications" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"medicine" text NOT NULL,
	"dosage" text,
	"schedule" text,
	"start_date" text,
	"end_date" text,
	"parent_consent" boolean DEFAULT false NOT NULL,
	"status" "medication_status" DEFAULT 'active' NOT NULL,
	"administered_by" text,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "health_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"blood_type" text,
	"height_cm" text,
	"weight_kg" text,
	"chronic_conditions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"allergies" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"vaccinations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"insurance_number" text,
	"emergency_contact" text,
	"emergency_phone" text,
	"confidential" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "health_sick_leaves" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"from_date" text NOT NULL,
	"to_date" text,
	"reason" text,
	"doc_attachment_url" text,
	"reported_by" text,
	"verified_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meal_daily_attendance" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"date" text NOT NULL,
	"meal_type" "meal_type" NOT NULL,
	"served" boolean DEFAULT true NOT NULL,
	"note" text,
	"recorded_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meal_dietary_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"allergies" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"special_diet" text,
	"notes" text,
	"confirmed_by_parent" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meal_feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text,
	"date" text NOT NULL,
	"meal_type" "meal_type",
	"rating" integer,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meal_food_safety_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"date" text NOT NULL,
	"supplier" text,
	"sample_kept" boolean DEFAULT true NOT NULL,
	"temperature_note" text,
	"inspector" text,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meal_menus" (
	"id" text PRIMARY KEY NOT NULL,
	"week_start" text NOT NULL,
	"day_of_week" integer NOT NULL,
	"meal_type" "meal_type" NOT NULL,
	"items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"nutrition_note" text,
	"calories" integer,
	"campus" text,
	"published_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meal_registrations" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"plan_type" "meal_plan_type" DEFAULT 'lunch_only' NOT NULL,
	"start_date" text NOT NULL,
	"end_date" text,
	"monthly_fee" text,
	"status" "ops_registration_status" DEFAULT 'active' NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parent_ticket_activities" (
	"id" text PRIMARY KEY NOT NULL,
	"ticket_id" text NOT NULL,
	"actor_id" text,
	"actor_name" text,
	"action" text NOT NULL,
	"content" text,
	"meta" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parent_tickets" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text,
	"parent_name" text NOT NULL,
	"parent_phone" text,
	"category" text NOT NULL,
	"subject" text NOT NULL,
	"description" text,
	"priority" text DEFAULT 'normal' NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"assigned_to" text,
	"first_responded_at" timestamp with time zone,
	"resolved_at" timestamp with time zone,
	"satisfaction_rating" integer,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "timetable_slots" (
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
CREATE TABLE "transport_attendance" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"route_id" text NOT NULL,
	"vehicle_id" text,
	"date" text NOT NULL,
	"direction" "transport_direction" NOT NULL,
	"board_on_time" timestamp with time zone,
	"board_off_time" timestamp with time zone,
	"status" "transport_board_status" DEFAULT 'boarded' NOT NULL,
	"recorded_by" text,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transport_incidents" (
	"id" text PRIMARY KEY NOT NULL,
	"route_id" text,
	"vehicle_id" text,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"type" text,
	"severity" "incident_severity" DEFAULT 'low' NOT NULL,
	"description" text,
	"handled_by" text,
	"notified_parent_at" timestamp with time zone,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transport_routes" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"direction" "transport_direction" DEFAULT 'both' NOT NULL,
	"campus" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transport_stops" (
	"id" text PRIMARY KEY NOT NULL,
	"route_id" text NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"lat" text,
	"lng" text,
	"sequence" integer DEFAULT 0 NOT NULL,
	"pickup_time" text,
	"dropoff_time" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transport_student_assignments" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"route_id" text NOT NULL,
	"pickup_stop_id" text,
	"dropoff_stop_id" text,
	"guardian_phone" text,
	"start_date" text,
	"end_date" text,
	"status" "ops_registration_status" DEFAULT 'active' NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transport_vehicles" (
	"id" text PRIMARY KEY NOT NULL,
	"plate" text NOT NULL,
	"model" text,
	"capacity" integer DEFAULT 0 NOT NULL,
	"driver_id" text,
	"assistant_id" text,
	"route_id" text,
	"status" "vehicle_status" DEFAULT 'active' NOT NULL,
	"gps_device_id" text,
	"next_maintenance_at" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "health_incidents" ADD CONSTRAINT "health_incidents_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "health_incidents" ADD CONSTRAINT "health_incidents_handled_by_employee_profiles_id_fk" FOREIGN KEY ("handled_by") REFERENCES "public"."employee_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "health_medications" ADD CONSTRAINT "health_medications_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "health_medications" ADD CONSTRAINT "health_medications_administered_by_employee_profiles_id_fk" FOREIGN KEY ("administered_by") REFERENCES "public"."employee_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "health_profiles" ADD CONSTRAINT "health_profiles_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "health_sick_leaves" ADD CONSTRAINT "health_sick_leaves_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "health_sick_leaves" ADD CONSTRAINT "health_sick_leaves_verified_by_employee_profiles_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."employee_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_daily_attendance" ADD CONSTRAINT "meal_daily_attendance_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_daily_attendance" ADD CONSTRAINT "meal_daily_attendance_recorded_by_employee_profiles_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."employee_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_dietary_profiles" ADD CONSTRAINT "meal_dietary_profiles_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_feedback" ADD CONSTRAINT "meal_feedback_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_food_safety_logs" ADD CONSTRAINT "meal_food_safety_logs_inspector_employee_profiles_id_fk" FOREIGN KEY ("inspector") REFERENCES "public"."employee_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_menus" ADD CONSTRAINT "meal_menus_published_by_employee_profiles_id_fk" FOREIGN KEY ("published_by") REFERENCES "public"."employee_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_registrations" ADD CONSTRAINT "meal_registrations_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parent_ticket_activities" ADD CONSTRAINT "parent_ticket_activities_ticket_id_parent_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."parent_tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parent_ticket_activities" ADD CONSTRAINT "parent_ticket_activities_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parent_tickets" ADD CONSTRAINT "parent_tickets_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parent_tickets" ADD CONSTRAINT "parent_tickets_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_slots" ADD CONSTRAINT "timetable_slots_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_slots" ADD CONSTRAINT "timetable_slots_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transport_attendance" ADD CONSTRAINT "transport_attendance_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transport_attendance" ADD CONSTRAINT "transport_attendance_route_id_transport_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."transport_routes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transport_attendance" ADD CONSTRAINT "transport_attendance_vehicle_id_transport_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."transport_vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transport_attendance" ADD CONSTRAINT "transport_attendance_recorded_by_employee_profiles_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."employee_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transport_incidents" ADD CONSTRAINT "transport_incidents_route_id_transport_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."transport_routes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transport_incidents" ADD CONSTRAINT "transport_incidents_vehicle_id_transport_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."transport_vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transport_incidents" ADD CONSTRAINT "transport_incidents_handled_by_employee_profiles_id_fk" FOREIGN KEY ("handled_by") REFERENCES "public"."employee_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transport_stops" ADD CONSTRAINT "transport_stops_route_id_transport_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."transport_routes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transport_student_assignments" ADD CONSTRAINT "transport_student_assignments_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transport_student_assignments" ADD CONSTRAINT "transport_student_assignments_route_id_transport_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."transport_routes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transport_student_assignments" ADD CONSTRAINT "transport_student_assignments_pickup_stop_id_transport_stops_id_fk" FOREIGN KEY ("pickup_stop_id") REFERENCES "public"."transport_stops"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transport_student_assignments" ADD CONSTRAINT "transport_student_assignments_dropoff_stop_id_transport_stops_id_fk" FOREIGN KEY ("dropoff_stop_id") REFERENCES "public"."transport_stops"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transport_vehicles" ADD CONSTRAINT "transport_vehicles_driver_id_employee_profiles_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."employee_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transport_vehicles" ADD CONSTRAINT "transport_vehicles_assistant_id_employee_profiles_id_fk" FOREIGN KEY ("assistant_id") REFERENCES "public"."employee_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transport_vehicles" ADD CONSTRAINT "transport_vehicles_route_id_transport_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."transport_routes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "health_incident_student_idx" ON "health_incidents" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "health_incident_time_idx" ON "health_incidents" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "health_incident_severity_idx" ON "health_incidents" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "health_med_student_idx" ON "health_medications" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "health_med_status_idx" ON "health_medications" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "health_profile_student_idx" ON "health_profiles" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "health_sick_student_idx" ON "health_sick_leaves" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "meal_att_day_idx" ON "meal_daily_attendance" USING btree ("date","meal_type");--> statement-breakpoint
CREATE UNIQUE INDEX "meal_att_student_day_idx" ON "meal_daily_attendance" USING btree ("student_id","date","meal_type");--> statement-breakpoint
CREATE UNIQUE INDEX "meal_diet_student_idx" ON "meal_dietary_profiles" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "meal_feedback_day_idx" ON "meal_feedback" USING btree ("date");--> statement-breakpoint
CREATE INDEX "meal_safety_day_idx" ON "meal_food_safety_logs" USING btree ("date");--> statement-breakpoint
CREATE INDEX "meal_menus_week_idx" ON "meal_menus" USING btree ("week_start");--> statement-breakpoint
CREATE UNIQUE INDEX "meal_menus_slot_idx" ON "meal_menus" USING btree ("week_start","day_of_week","meal_type");--> statement-breakpoint
CREATE INDEX "meal_reg_student_idx" ON "meal_registrations" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "meal_reg_status_idx" ON "meal_registrations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ticket_activity_ticket_idx" ON "parent_ticket_activities" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "parent_ticket_status_idx" ON "parent_tickets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "parent_ticket_student_idx" ON "parent_tickets" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "parent_ticket_assigned_idx" ON "parent_tickets" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "timetable_slots_day_period_idx" ON "timetable_slots" USING btree ("day","period");--> statement-breakpoint
CREATE INDEX "timetable_slots_class_idx" ON "timetable_slots" USING btree ("class_name");--> statement-breakpoint
CREATE INDEX "timetable_slots_teacher_idx" ON "timetable_slots" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX "transport_att_day_idx" ON "transport_attendance" USING btree ("date","route_id");--> statement-breakpoint
CREATE UNIQUE INDEX "transport_att_student_day_idx" ON "transport_attendance" USING btree ("student_id","date","direction");--> statement-breakpoint
CREATE INDEX "transport_incident_route_idx" ON "transport_incidents" USING btree ("route_id");--> statement-breakpoint
CREATE INDEX "transport_incident_time_idx" ON "transport_incidents" USING btree ("occurred_at");--> statement-breakpoint
CREATE UNIQUE INDEX "transport_routes_code_idx" ON "transport_routes" USING btree ("code");--> statement-breakpoint
CREATE INDEX "transport_routes_active_idx" ON "transport_routes" USING btree ("active");--> statement-breakpoint
CREATE INDEX "transport_stops_route_idx" ON "transport_stops" USING btree ("route_id");--> statement-breakpoint
CREATE INDEX "transport_assign_student_idx" ON "transport_student_assignments" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "transport_assign_route_idx" ON "transport_student_assignments" USING btree ("route_id");--> statement-breakpoint
CREATE UNIQUE INDEX "transport_assign_uniq" ON "transport_student_assignments" USING btree ("student_id","route_id");--> statement-breakpoint
CREATE UNIQUE INDEX "transport_vehicles_plate_idx" ON "transport_vehicles" USING btree ("plate");--> statement-breakpoint
CREATE INDEX "transport_vehicles_route_idx" ON "transport_vehicles" USING btree ("route_id");