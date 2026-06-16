CREATE TABLE "chat_attachments" (
	"id" text PRIMARY KEY NOT NULL,
	"message_id" text NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"uploaded_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_conversations" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"name" text,
	"description" text,
	"department_id" text,
	"created_by" text,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_members" (
	"id" text PRIMARY KEY NOT NULL,
	"conversation_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'MEMBER' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_read_message_id" text,
	"last_read_at" timestamp with time zone,
	"muted_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_mention_recipients" (
	"id" text PRIMARY KEY NOT NULL,
	"mention_id" text NOT NULL,
	"user_id" text NOT NULL,
	"notification_status" text DEFAULT 'UNREAD' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"read_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "chat_mentions" (
	"id" text PRIMARY KEY NOT NULL,
	"message_id" text NOT NULL,
	"conversation_id" text NOT NULL,
	"mention_type" text NOT NULL,
	"mentioned_user_id" text,
	"mentioned_department_id" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"conversation_id" text NOT NULL,
	"sender_id" text NOT NULL,
	"content" text NOT NULL,
	"type" text DEFAULT 'TEXT' NOT NULL,
	"reply_to_message_id" text,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"is_edited" boolean DEFAULT false NOT NULL,
	"edited_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"deleted_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "payload" SET DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar_url" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "department_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "status" text DEFAULT 'ACTIVE' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_login_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "created_by" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updated_by" text;