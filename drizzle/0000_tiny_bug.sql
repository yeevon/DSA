CREATE TABLE `annotations` (
	`id` text PRIMARY KEY NOT NULL,
	`section_id` text NOT NULL,
	`offset_start` integer NOT NULL,
	`offset_end` integer NOT NULL,
	`text` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`question_id` text NOT NULL,
	`started_at` integer NOT NULL,
	`submitted_at` integer NOT NULL,
	`response_json` text NOT NULL,
	`outcome` text NOT NULL,
	`llm_tags_json` text,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_attempts_question` ON `attempts` (`question_id`,`submitted_at`);--> statement-breakpoint
CREATE TABLE `chapters` (
	`id` text PRIMARY KEY NOT NULL,
	`n` integer NOT NULL,
	`title` text NOT NULL,
	`subtitle` text,
	`required` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `fsrs_state` (
	`question_id` text PRIMARY KEY NOT NULL,
	`due_at` integer NOT NULL,
	`stability` real NOT NULL,
	`difficulty` real NOT NULL,
	`last_review_at` integer,
	`lapses` integer DEFAULT 0 NOT NULL,
	`reps` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_fsrs_due` ON `fsrs_state` (`due_at`);--> statement-breakpoint
CREATE TABLE `questions` (
	`id` text PRIMARY KEY NOT NULL,
	`chapter_id` text NOT NULL,
	`section_id` text,
	`type` text NOT NULL,
	`topic_tags` text NOT NULL,
	`prompt_md` text NOT NULL,
	`answer_schema_json` text NOT NULL,
	`reference_json` text NOT NULL,
	`source_run_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	FOREIGN KEY (`chapter_id`) REFERENCES `chapters`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_questions_chapter` ON `questions` (`chapter_id`,`status`);--> statement-breakpoint
CREATE TABLE `read_status` (
	`section_id` text PRIMARY KEY NOT NULL,
	`read_at` integer NOT NULL,
	FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sections` (
	`id` text PRIMARY KEY NOT NULL,
	`chapter_id` text NOT NULL,
	`anchor` text NOT NULL,
	`title` text NOT NULL,
	`ord` integer NOT NULL,
	FOREIGN KEY (`chapter_id`) REFERENCES `chapters`(`id`) ON UPDATE no action ON DELETE no action
);
