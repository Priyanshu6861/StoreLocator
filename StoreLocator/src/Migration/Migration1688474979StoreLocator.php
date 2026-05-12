<?php

declare(strict_types=1);

namespace StoreLocator\StoreLocatorPlugin\Migration;

use Doctrine\DBAL\Connection;
use Shopware\Core\Framework\Migration\MigrationStep;

class Migration1688474979StoreLocator extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1688474979;
    }

    public function update(Connection $connection): void
    {
        $connection->executeStatement('
        CREATE TABLE IF NOT EXISTS `store_locator` (
            `id`            BINARY(16) NOT NULL,
            `active`        TINYINT(1) NULL DEFAULT 0,
            `title`         VARCHAR(255) NOT NULL,
            `url`           VARCHAR(255) NULL,
            `address`       VARCHAR(255) NOT NULL,
            `city`          VARCHAR(255) NOT NULL,
            `state`         BINARY(16) DEFAULT NULL,
            `country`       BINARY(16) DEFAULT NULL,
            `postal_code`   VARCHAR(255) NOT NULL,
            `number`        VARCHAR(255) NULL,
            `email`         VARCHAR(255) NULL,
            `latitude`      VARCHAR(255) NOT NULL,
            `longitude`     VARCHAR(255) NOT NULL,
            `logo`          BINARY(16) DEFAULT NULL,
            `working_hours` LONGTEXT NULL,
            `description` LONGTEXT NULL,
            `parking_available` TINYINT(1) NULL DEFAULT 0,
            `atm` TINYINT(1) NULL DEFAULT 0,
            `new_arrivals`  JSON NULL,
            `payment_method` JSON NULL,
            `manufacturer` JSON NULL,
            `meta_title`         VARCHAR(255) NULL,
            `meta_description`         VARCHAR(255) NULL,
            `seo_keywords`         VARCHAR(255) NULL,
            `created_at`    DATETIME(3) NOT NULL,
            `updated_at`    DATETIME(3) NULL,
            PRIMARY KEY (`id`),
            KEY `fk.store_locator.state` (`state`),
            KEY `fk.store_locator.country` (`country`),
            KEY `fk.store_locator.logo` (`logo`),
            CONSTRAINT `fk.store_locator.state` FOREIGN KEY (`state`) REFERENCES `country_state` (`id`) ON DELETE SET NULL,
            CONSTRAINT `fk.store_locator.country` FOREIGN KEY (`country`) REFERENCES `country` (`id`) ON DELETE SET NULL,
            CONSTRAINT `fk.store_locator.logo` FOREIGN KEY (`logo`) REFERENCES `media` (`id`) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ');
    }

    public function updateDestructive(Connection $connection): void
    {
        $connection->executeStatement('DROP TABLE IF EXISTS `store_locator`');
    }
}
