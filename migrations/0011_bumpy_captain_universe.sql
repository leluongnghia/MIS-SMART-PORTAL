CREATE TABLE "facilities_booking_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"target_type" text NOT NULL,
	"asset_id" text,
	"location_id" text,
	"requester_id" text NOT NULL,
	"requester_name" text,
	"department" text,
	"purpose" text,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"approved_by_id" text,
	"approved_by_name" text,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"condition_before" text,
	"condition_after" text,
	"note" text,
	"attachment_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "facilities_booking_requests_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "facilities_renovation_projects" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"scope" text,
	"reason" text,
	"location_id" text,
	"manager_id" text,
	"manager_name" text,
	"planned_start_date" timestamp with time zone,
	"planned_end_date" timestamp with time zone,
	"actual_start_date" timestamp with time zone,
	"actual_end_date" timestamp with time zone,
	"status" text DEFAULT 'PROPOSED' NOT NULL,
	"tasks" jsonb,
	"before_image_urls" jsonb,
	"after_image_urls" jsonb,
	"acceptance_note" text,
	"related_purchase_request_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "facilities_renovation_projects_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "facilities_safety_checks" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"check_type" text NOT NULL,
	"location_id" text,
	"assigned_to_id" text,
	"assigned_to_name" text,
	"cycle" text,
	"last_checked_at" timestamp with time zone,
	"next_check_at" timestamp with time zone,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"result" text,
	"issue_description" text,
	"before_image_url" text,
	"after_image_url" text,
	"related_repair_request_id" text,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "facilities_safety_checks_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "facilities_sla_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"priority" text NOT NULL,
	"first_response_hours" integer NOT NULL,
	"resolution_hours" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "facilities_sla_settings_priority_unique" UNIQUE("priority")
);
--> statement-breakpoint
CREATE TABLE "facilities_suppliers" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"contact_person" text,
	"phone" text,
	"email" text,
	"address" text,
	"service_types" jsonb,
	"rating" integer,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "facilities_suppliers_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "facilities_supplies" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"unit" text NOT NULL,
	"current_quantity" integer DEFAULT 0 NOT NULL,
	"minimum_quantity" integer DEFAULT 0 NOT NULL,
	"storage_location" text,
	"manager_id" text,
	"manager_name" text,
	"status" text DEFAULT 'IN_STOCK' NOT NULL,
	"last_imported_at" timestamp with time zone,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "facilities_supplies_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "facilities_supply_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"supply_id" text NOT NULL,
	"type" text NOT NULL,
	"quantity" integer NOT NULL,
	"reason" text,
	"related_repair_request_id" text,
	"related_maintenance_id" text,
	"performed_by_id" text NOT NULL,
	"performed_by_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "facilities_warranties" (
	"id" text PRIMARY KEY NOT NULL,
	"asset_id" text NOT NULL,
	"supplier_id" text,
	"warranty_start_date" timestamp with time zone,
	"warranty_end_date" timestamp with time zone,
	"warranty_terms" text,
	"warranty_code" text,
	"document_url" text,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "facilities_repair_requests" ADD COLUMN "received_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "facilities_repair_requests" ADD COLUMN "first_response_due_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "facilities_repair_requests" ADD COLUMN "resolution_due_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "facilities_repair_requests" ADD COLUMN "resolved_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "facilities_repair_requests" ADD COLUMN "is_first_response_overdue" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "facilities_repair_requests" ADD COLUMN "is_resolution_overdue" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "facilities_repair_requests" ADD COLUMN "sla_status" text;