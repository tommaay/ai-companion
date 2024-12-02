CREATE TYPE "public"."behavior_type" AS ENUM('proactive', 'reactive', 'balanced', 'analytical', 'collaborative', 'mentoring', 'observant');--> statement-breakpoint
CREATE TYPE "public"."personality_type" AS ENUM('casual', 'professional', 'friendly', 'humorous', 'academic', 'creative', 'motivational', 'philosophical', 'pragmatic', 'empathetic', 'adventurous');--> statement-breakpoint
CREATE TYPE "public"."response_style_type" AS ENUM('concise', 'detailed', 'conversational', 'socratic', 'visual', 'structured', 'storytelling');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "companions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"instructions" text NOT NULL,
	"seed" text NOT NULL,
	"image_url" text NOT NULL,
	"personality" "personality_type" NOT NULL,
	"behavior" "behavior_type" NOT NULL,
	"response_style" "response_style_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"companion_id" uuid NOT NULL,
	"name" text DEFAULT 'New Conversation' NOT NULL,
	"last_message_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"companion_id" uuid,
	"conversation_id" uuid,
	"prompt" text NOT NULL,
	"image_url" text NOT NULL,
	"type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"content" text NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"default_companion_id" uuid,
	"theme" text DEFAULT 'system' NOT NULL,
	"model_preference" text DEFAULT 'meta-llama-3-8b-instruct-turbo' NOT NULL,
	"image_model" text DEFAULT 'dall-e-2' NOT NULL,
	"default_personality" "personality_type" DEFAULT 'casual' NOT NULL,
	"default_behavior" "behavior_type" DEFAULT 'balanced' NOT NULL,
	"default_response_style" "response_style_type" DEFAULT 'conversational' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"image_url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "companions" ADD CONSTRAINT "companions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversations" ADD CONSTRAINT "conversations_companion_id_companions_id_fk" FOREIGN KEY ("companion_id") REFERENCES "public"."companions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "images" ADD CONSTRAINT "images_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "images" ADD CONSTRAINT "images_companion_id_companions_id_fk" FOREIGN KEY ("companion_id") REFERENCES "public"."companions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "images" ADD CONSTRAINT "images_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_default_companion_id_companions_id_fk" FOREIGN KEY ("default_companion_id") REFERENCES "public"."companions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "companions_user_id_index" ON "companions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "companions_name_index" ON "companions" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "conversations_name_index" ON "conversations" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "conversations_user_id_index" ON "conversations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "conversations_companion_id_index" ON "conversations" USING btree ("companion_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "conversations_last_message_at_index" ON "conversations" USING btree ("last_message_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "images_user_id_index" ON "images" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "images_companion_id_index" ON "images" USING btree ("companion_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "images_conversation_id_index" ON "images" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "images_type_index" ON "images" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "images_created_at_index" ON "images" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "messages_conversation_id_index" ON "messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "messages_created_at_index" ON "messages" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_preferences_user_id_index" ON "user_preferences" USING btree ("user_id");