CREATE TYPE "public"."file_status" AS ENUM('pending', 'processing', 'done', 'failed');--> statement-breakpoint
CREATE TYPE "public"."group_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "files" (
	"id" text PRIMARY KEY NOT NULL,
	"original_name" text NOT NULL,
	"storage_path" text NOT NULL,
	"mime_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"status" "file_status" DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"parsed_title" text,
	"parsed_arranger" text,
	"parsed_instrument" text,
	"parsed_part" integer,
	"parsed_confidence" real,
	"parsed_raw" text,
	"parsed_credits" jsonb,
	"parsed_instruments" jsonb,
	"group_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "groups" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"arranger" text DEFAULT '' NOT NULL,
	"status" "group_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;