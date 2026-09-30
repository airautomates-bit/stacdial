ALTER TABLE `orders` ADD COLUMN `email` text NOT NULL DEFAULT '';
ALTER TABLE `orders` ADD COLUMN `contact_preference` text NOT NULL DEFAULT 'either';
