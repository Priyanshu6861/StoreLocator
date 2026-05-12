<?php declare(strict_types=1);

namespace StoreLocator\StoreLocatorPlugin\Migration;

use Doctrine\DBAL\Connection;
use Shopware\Core\Framework\Migration\MigrationStep;

/**
 * @internal
 */
class Migration1740459675CreateStoreMediaTable extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1740459675;
    }

    public function update(Connection $connection): void
    {
        $connection->executeStatement('
        CREATE TABLE IF NOT EXISTS `store_locator_media` (
            `id`            BINARY(16) NOT NULL,
            `position`      INT NULL DEFAULT 1,
            `store_id`      BINARY(16) NULL,
            `media_id`      BINARY(16) NULL,
            `created_at`    DATETIME(3) NOT NULL,
            `updated_at`    DATETIME(3) NULL,
            PRIMARY KEY (`id`),
            KEY `fk.store_locator_media.store_id` (`store_id`),
            KEY `fk.store_locator_media.media_id` (`media_id`),
            CONSTRAINT `fk.store_locator_media.store_id` FOREIGN KEY (`store_id`) REFERENCES `store_locator` (`id`) ON DELETE SET NULL,
            CONSTRAINT `fk.store_locator_media.media_id` FOREIGN KEY (`media_id`) REFERENCES `media` (`id`) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ');
    }
}
