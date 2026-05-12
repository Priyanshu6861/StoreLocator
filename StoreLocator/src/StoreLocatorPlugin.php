<?php

declare(strict_types=1);

namespace StoreLocator;

use Shopware\Core\Framework\Plugin;
use Shopware\Core\Framework\Plugin\Context\UninstallContext;

class StoreLocatorPlugin extends Plugin
{
    public function uninstall(UninstallContext $uninstallContext): void
    {
        if (!$uninstallContext->keepUserData()) {
            $this->dropTable();
        }
        parent::uninstall($uninstallContext);
    }

    private function dropTable(): void
    {
        $connection = $this->container->get('Doctrine\DBAL\Connection');
        $query = 'DROP TABLE IF EXISTS store_locator_media';
        $connection->executeQuery($query);
        $query = 'DROP TABLE IF EXISTS store_locator';
        $connection->executeQuery($query);
    }
}
