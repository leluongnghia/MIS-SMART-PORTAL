CREATE TABLE "facilities_attachments" (
	"id" text PRIMARY KEY NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"uploaded_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "facilities_inventory_check_items" (
	"id" text PRIMARY KEY NOT NULL,
	"inventory_check_id" text NOT NULL,
	"asset_id" text NOT NULL,
	"asset_code" text,
	"asset_name" text,
	"expected_location_id" text,
	"actual_location_id" text,
	"expected_status" text,
	"actual_status" text,
	"result" text,
	"note" text,
	"checked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "facilities_inventory_checks" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"scope" text,
	"location_id" text,
	"category" text,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"assigned_to_id" text,
	"assigned_to_name" text,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"summary" text,
	"created_by_id" text NOT NULL,
	"created_by_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "facilities_inventory_checks_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "facilities_purchase_items" (
	"id" text PRIMARY KEY NOT NULL,
	"purchase_request_id" text NOT NULL,
	"item_name" text NOT NULL,
	"category" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit" text NOT NULL,
	"specification" text,
	"purpose" text,
	"necessity_level" text,
	"estimated_unit_price" integer,
	"suggested_supplier" text,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"received_quantity" integer DEFAULT 0,
	"created_asset_id" text,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "facilities_purchase_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"request_type" text NOT NULL,
	"reason" text,
	"department_id" text,
	"location_id" text,
	"location_name" text,
	"related_repair_request_id" text,
	"related_asset_id" text,
	"priority" text DEFAULT 'MEDIUM',
	"needed_by_date" timestamp with time zone,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"requested_by_id" text NOT NULL,
	"requested_by_name" text,
	"reviewed_by_id" text,
	"reviewed_by_name" text,
	"reviewed_at" timestamp with time zone,
	"approved_by_id" text,
	"approved_by_name" text,
	"approved_at" timestamp with time zone,
	"rejected_reason" text,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "facilities_purchase_requests_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "facilities_assets" ADD COLUMN "source_type" text DEFAULT 'MANUAL';--> statement-breakpoint
ALTER TABLE "facilities_assets" ADD COLUMN "source_id" text;--> statement-breakpoint
ALTER TABLE "facilities_handover_logs" ADD COLUMN "code" text;--> statement-breakpoint
ALTER TABLE "facilities_maintenance_logs" ADD COLUMN "related_repair_request_id" text;--> statement-breakpoint
ALTER TABLE "facilities_maintenance_logs" ADD COLUMN "related_purchase_request_id" text;--> statement-breakpoint
ALTER TABLE "facilities_repair_requests" ADD COLUMN "related_purchase_request_id" text;--> statement-breakpoint
ALTER TABLE "facilities_handover_logs" ADD CONSTRAINT "facilities_handover_logs_code_unique" UNIQUE("code");