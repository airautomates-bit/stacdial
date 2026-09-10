CREATE TABLE `audit` (
	`id` text PRIMARY KEY NOT NULL,
	`actor` text NOT NULL,
	`action` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `claims` (
	`token` text PRIMARY KEY NOT NULL,
	`created` integer NOT NULL,
	`used` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`request_key` text NOT NULL,
	`user_id` text,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`note` text NOT NULL,
	`product_id` text NOT NULL,
	`product_name` text NOT NULL,
	`subtotal` integer NOT NULL,
	`discount` integer NOT NULL,
	`total` integer NOT NULL,
	`status` text DEFAULT 'requested' NOT NULL,
	`created` integer NOT NULL,
	`updated` integer NOT NULL,
	`synced` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_request_key_unique` ON `orders` (`request_key`);--> statement-breakpoint
CREATE INDEX `orders_phone_idx` ON `orders` (`phone`);--> statement-breakpoint
CREATE INDEX `orders_user_idx` ON `orders` (`user_id`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`active` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rates` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`reset` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL
);
