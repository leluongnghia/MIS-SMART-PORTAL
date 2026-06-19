CREATE TABLE "user_invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"role" text NOT NULL,
	"department_id" text,
	"data_scope" text DEFAULT 'OWN' NOT NULL,
	"invited_by_id" text,
	"invited_by_name" text,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"token_hash" text,
	"expires_at" timestamp with time zone,
	"accepted_at" timestamp with time zone,
	"canceled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_login_history" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"login_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"device_name" text,
	"success" boolean DEFAULT true NOT NULL,
	"failure_reason" text
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "data_scope" text DEFAULT 'OWN' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "two_factor_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user_login_history" ADD CONSTRAINT "user_login_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_invitations_email_idx" ON "user_invitations" USING btree ("email");--> statement-breakpoint
CREATE INDEX "user_invitations_status_idx" ON "user_invitations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "user_login_history_user_idx" ON "user_login_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_login_history_login_at_idx" ON "user_login_history" USING btree ("login_at");