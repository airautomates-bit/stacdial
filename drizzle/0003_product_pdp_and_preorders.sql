ALTER TABLE `products` ADD COLUMN `slug` text;
ALTER TABLE `products` ADD COLUMN `created` integer;
ALTER TABLE `products` ADD COLUMN `updated` integer;
CREATE UNIQUE INDEX `products_slug_unique` ON `products` (`slug`);
ALTER TABLE `orders` ADD COLUMN `alternative_phone` text NOT NULL DEFAULT '';
ALTER TABLE `orders` ADD COLUMN `delivery_address` text NOT NULL DEFAULT '';
ALTER TABLE `orders` ADD COLUMN `city` text NOT NULL DEFAULT '';
ALTER TABLE `orders` ADD COLUMN `internal_notes` text NOT NULL DEFAULT '';
