CREATE TABLE "data_scopes" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"module_id" text NOT NULL,
	"scope" text DEFAULT 'OWN' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "department_modules" (
	"id" text PRIMARY KEY NOT NULL,
	"department_id" text NOT NULL,
	"module_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "modules" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"icon" text DEFAULT 'LayoutDashboard' NOT NULL,
	"parent_id" text,
	"sort" integer DEFAULT 0 NOT NULL,
	"status" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "modules_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_module_overrides" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"module_id" text NOT NULL,
	"effect" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "icon" text DEFAULT 'Building' NOT NULL;--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "color" text DEFAULT '#2563eb' NOT NULL;--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "sort" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "user_type" text DEFAULT 'USER' NOT NULL;--> statement-breakpoint
ALTER TABLE "data_scopes" ADD CONSTRAINT "data_scopes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_scopes" ADD CONSTRAINT "data_scopes_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "department_modules" ADD CONSTRAINT "department_modules_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "department_modules" ADD CONSTRAINT "department_modules_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_module_overrides" ADD CONSTRAINT "user_module_overrides_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_module_overrides" ADD CONSTRAINT "user_module_overrides_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "data_scopes_user_idx" ON "data_scopes" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "data_scopes_unique" ON "data_scopes" USING btree ("user_id","module_id");--> statement-breakpoint
CREATE INDEX "dept_modules_dept_idx" ON "department_modules" USING btree ("department_id");--> statement-breakpoint
CREATE UNIQUE INDEX "dept_modules_unique" ON "department_modules" USING btree ("department_id","module_id");--> statement-breakpoint
CREATE INDEX "user_overrides_user_idx" ON "user_module_overrides" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_overrides_unique" ON "user_module_overrides" USING btree ("user_id","module_id");