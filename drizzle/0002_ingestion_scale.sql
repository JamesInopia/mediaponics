CREATE TABLE "ingestion_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" text NOT NULL,
	"kind" text NOT NULL,
	"status" text NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"inserted" integer DEFAULT 0 NOT NULL,
	"updated" integer DEFAULT 0 NOT NULL,
	"unchanged" integer DEFAULT 0 NOT NULL,
	"skipped" integer DEFAULT 0 NOT NULL,
	"flagged" integer DEFAULT 0 NOT NULL,
	"error" text
);
--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "removed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "removed_reason" text;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "last_checked_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "check_failures" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX "ingestion_runs_source_finished_idx" ON "ingestion_runs" USING btree ("source","finished_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "assets_live_fetched_at_idx" ON "assets" USING btree ("source","fetched_at") WHERE removed_at is null;