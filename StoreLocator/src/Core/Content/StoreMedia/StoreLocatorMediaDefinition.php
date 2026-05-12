<?php

declare(strict_types=1);

namespace StoreLocator\StoreLocatorPlugin\Core\Content\StoreMedia;

use StoreLocator\StoreLocatorPlugin\Core\Content\Locator\StoreLocatorDefinition;
use Shopware\Core\Content\Media\MediaDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\EntityDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\Field\BoolField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\FkField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\PrimaryKey;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\Required;
use Shopware\Core\Framework\DataAbstractionLayer\Field\IdField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\IntField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\LongTextField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\ManyToOneAssociationField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\StringField;
use Shopware\Core\Framework\DataAbstractionLayer\FieldCollection;

class StoreLocatorMediaDefinition extends EntityDefinition
{
    public function getEntityName(): string
    {
        return 'store_locator_media';
    }

    public function getCollectionClass(): string
    {
        return StoreLocatorMediaCollection::class;
    }

    public function getEntityClass(): string
    {
        return StoreLocatorMediaEntity::class;
    }

    protected function defineFields(): FieldCollection
    {
        return new FieldCollection(
            [
                (new IdField('id', 'id'))->addFlags(new Required(), new PrimaryKey()),
                (new IntField('position', 'position')),
                (new FkField('store_id', 'storeId', 'store_locator')),
                new FkField('media_id', 'mediaId', 'media'),
                new ManyToOneAssociationField('media', 'media_id', MediaDefinition::class, 'id', false),
                // new ManyToOneAssociationField('store', 'store_id', StoreLocatorDefinition::class, 'id', false),
            ]
        );
    }
}
