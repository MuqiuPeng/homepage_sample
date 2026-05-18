CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name_i18n" jsonb NOT NULL,
	"parent_id" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "series" (
	"id" text PRIMARY KEY NOT NULL,
	"category_id" text,
	"name_i18n" jsonb NOT NULL,
	"manufacturer_i18n" jsonb,
	"since_year" integer,
	"composition_i18n" jsonb,
	"description_i18n" jsonb,
	"applications_i18n" jsonb,
	"engineering_cases" jsonb,
	"packaging" jsonb,
	"shipping_note_i18n" jsonb,
	"data_disclaimer_i18n" jsonb,
	"specs_schema" jsonb NOT NULL,
	"hero_image_url" text,
	"msds_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "variants" (
	"id" text PRIMARY KEY NOT NULL,
	"series_id" text NOT NULL,
	"name_i18n" jsonb NOT NULL,
	"tag_i18n" jsonb,
	"description_i18n" jsonb,
	"specs" jsonb NOT NULL,
	"image_url" text,
	"msds_url" text,
	"cas_number" text,
	"hs_code" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "series" ADD CONSTRAINT "series_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variants" ADD CONSTRAINT "variants_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "series_category_idx" ON "series" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "variants_series_idx" ON "variants" USING btree ("series_id");--> statement-breakpoint
CREATE INDEX "variants_specs_gin_idx" ON "variants" USING gin ("specs");