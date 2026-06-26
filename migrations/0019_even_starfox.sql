CREATE TABLE "department_permissions" (
	"id" text PRIMARY KEY NOT NULL,
	"department_id" text NOT NULL,
	"permission_id" text NOT NULL,
	"data_scope" text DEFAULT 'department' NOT NULL,
	"conditions_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "group_members" (
	"id" text PRIMARY KEY NOT NULL,
	"group_id" text NOT NULL,
	"user_id" text NOT NULL,
	"member_role" text DEFAULT 'MEMBER' NOT NULL,
	"is_leader" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "group_permissions" (
	"id" text PRIMARY KEY NOT NULL,
	"group_id" text NOT NULL,
	"permission_id" text NOT NULL,
	"data_scope" text DEFAULT 'group' NOT NULL,
	"conditions_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"effect" text DEFAULT 'ALLOW' NOT NULL,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permission_audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_user_id" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"action" text NOT NULL,
	"before_json" jsonb,
	"after_json" jsonb,
	"reason" text,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"id" text PRIMARY KEY NOT NULL,
	"role_id" text NOT NULL,
	"permission_id" text NOT NULL,
	"data_scope" text DEFAULT 'own' NOT NULL,
	"conditions_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"level" integer DEFAULT 0 NOT NULL,
	"is_system_role" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roles_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "sys_features" (
	"id" text PRIMARY KEY NOT NULL,
	"module_id" text NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"route_path" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sys_features_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "sys_groups" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"type" text NOT NULL,
	"description" text,
	"owner_user_id" text,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"is_temporary" boolean DEFAULT false NOT NULL,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sys_groups_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "sys_modules" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"icon" text,
	"route_path" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"parent_module_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sys_modules_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "sys_permissions" (
	"id" text PRIMARY KEY NOT NULL,
	"module_id" text NOT NULL,
	"feature_id" text,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"action" text NOT NULL,
	"description" text,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sys_permissions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "user_departments" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"department_id" text NOT NULL,
	"role_id" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_permissions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"permission_id" text NOT NULL,
	"effect" text DEFAULT 'ALLOW' NOT NULL,
	"data_scope" text DEFAULT 'own' NOT NULL,
	"conditions_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"reason" text,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "type" text DEFAULT 'DEPARTMENT' NOT NULL;--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "parent_department_id" text;--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "status" text DEFAULT 'ACTIVE' NOT NULL;--> statement-breakpoint
ALTER TABLE "department_permissions" ADD CONSTRAINT "department_permissions_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "department_permissions" ADD CONSTRAINT "department_permissions_permission_id_sys_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."sys_permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_group_id_sys_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."sys_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_permissions" ADD CONSTRAINT "group_permissions_group_id_sys_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."sys_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_permissions" ADD CONSTRAINT "group_permissions_permission_id_sys_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."sys_permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_sys_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."sys_permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_features" ADD CONSTRAINT "sys_features_module_id_sys_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."sys_modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_groups" ADD CONSTRAINT "sys_groups_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_permissions" ADD CONSTRAINT "sys_permissions_module_id_sys_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."sys_modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_permissions" ADD CONSTRAINT "sys_permissions_feature_id_sys_features_id_fk" FOREIGN KEY ("feature_id") REFERENCES "public"."sys_features"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_departments" ADD CONSTRAINT "user_departments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_departments" ADD CONSTRAINT "user_departments_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_departments" ADD CONSTRAINT "user_departments_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_permission_id_sys_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."sys_permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "department_permissions_dept_idx" ON "department_permissions" USING btree ("department_id");--> statement-breakpoint
CREATE UNIQUE INDEX "department_permissions_unique" ON "department_permissions" USING btree ("department_id","permission_id");--> statement-breakpoint
CREATE INDEX "group_members_group_idx" ON "group_members" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "group_members_user_idx" ON "group_members" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "group_members_unique" ON "group_members" USING btree ("group_id","user_id");--> statement-breakpoint
CREATE INDEX "group_permissions_group_idx" ON "group_permissions" USING btree ("group_id");--> statement-breakpoint
CREATE UNIQUE INDEX "group_permissions_unique" ON "group_permissions" USING btree ("group_id","permission_id");--> statement-breakpoint
CREATE INDEX "permission_audit_logs_target_idx" ON "permission_audit_logs" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "permission_audit_logs_actor_idx" ON "permission_audit_logs" USING btree ("actor_user_id");--> statement-breakpoint
CREATE INDEX "role_permissions_role_idx" ON "role_permissions" USING btree ("role_id");--> statement-breakpoint
CREATE UNIQUE INDEX "role_permissions_unique" ON "role_permissions" USING btree ("role_id","permission_id");--> statement-breakpoint
CREATE INDEX "sys_features_module_idx" ON "sys_features" USING btree ("module_id");--> statement-breakpoint
CREATE INDEX "sys_permissions_module_idx" ON "sys_permissions" USING btree ("module_id");--> statement-breakpoint
CREATE INDEX "user_departments_user_idx" ON "user_departments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_departments_dept_idx" ON "user_departments" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "user_permissions_user_idx" ON "user_permissions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_permissions_unique" ON "user_permissions" USING btree ("user_id","permission_id");