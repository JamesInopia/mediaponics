CREATE TYPE "public"."asset_type" AS ENUM('Images', 'Vectors', 'GIFs', 'Music', 'Sound Effects', 'Stock Footage');--> statement-breakpoint
CREATE TYPE "public"."license_id" AS ENUM('cc0', 'cc-by', 'cc-by-sa', 'non-commercial');--> statement-breakpoint
CREATE TABLE "assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" text NOT NULL,
	"source_id" text NOT NULL,
	"title" text NOT NULL,
	"creator" text NOT NULL,
	"type" "asset_type" NOT NULL,
	"duration_sec" integer,
	"license" "license_id" NOT NULL,
	"license_version" text,
	"source_url" text NOT NULL,
	"preview_url" text,
	"genre" text,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"added_at" timestamp with time zone NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"search" "tsvector" GENERATED ALWAYS AS (setweight(to_tsvector('english', coalesce(title, '')), 'A') || setweight(to_tsvector('english', coalesce(creator, '')), 'B') || setweight(to_tsvector('english', coalesce(immutable_array_to_string(tags, ' '), '')), 'C')) STORED,
	CONSTRAINT "assets_source_source_id_unique" UNIQUE("source","source_id")
);
--> statement-breakpoint
CREATE INDEX "assets_search_idx" ON "assets" USING gin ("search");--> statement-breakpoint
CREATE INDEX "assets_type_added_at_idx" ON "assets" USING btree ("type","added_at" DESC NULLS LAST);