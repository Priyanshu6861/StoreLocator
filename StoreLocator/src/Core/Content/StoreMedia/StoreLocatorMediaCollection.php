<?php

declare(strict_types=1);

namespace StoreLocator\StoreLocatorPlugin\Core\Content\StoreMedia;

use Shopware\Core\Framework\DataAbstractionLayer\EntityCollection;

/**
 * @method void                    add(StoreLocatorMediaEntity $entity)
 * @method void                    set(string $key, StoreLocatorMediaEntity $entity)
 * @method StoreLocatorMediaEntity[]    getIterator()
 * @method StoreLocatorMediaEntity[]    getElements()
 * @method StoreLocatorMediaEntity|null get(string $key)
 * @method StoreLocatorMediaEntity|null first()
 * @method StoreLocatorMediaEntity|null last()
 */
class StoreLocatorMediaCollection extends EntityCollection
{
    protected function getExpectedClass(): string
    {
        return StoreLocatorMediaEntity::class;
    }
}
