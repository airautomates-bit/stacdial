CREATE TABLE `loyalty_offers` (
	`code` text PRIMARY KEY NOT NULL,
	`phone` text NOT NULL,
	`percent` integer NOT NULL,
	`minimum` integer DEFAULT 0 NOT NULL,
	`expires` integer NOT NULL,
	`used_order` text,
	`active` integer DEFAULT 1 NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `loyalty_phone_idx` ON `loyalty_offers` (`phone`);