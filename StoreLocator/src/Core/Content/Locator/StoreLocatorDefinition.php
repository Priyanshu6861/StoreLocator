<?php

declare(strict_types=1);

namespace StoreLocator\StoreLocatorPlugin\Core\Content\Locator;

use StoreLocator\StoreLocatorPlugin\Core\Content\StoreMedia\StoreLocatorMediaDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\Attribute\Inherited;
use Shopware\Core\Framework\DataAbstractionLayer\EntityDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\Field\BoolField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\FkField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\AllowHtml;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\ApiAware;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\PrimaryKey;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\Required;
use Shopware\Core\Framework\DataAbstractionLayer\Field\IdField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\JsonField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\LongTextField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\OneToManyAssociationField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\StringField;
use Shopware\Core\Framework\DataAbstractionLayer\FieldCollection;

class StoreLocatorDefinition extends EntityDefinition
{
    public function getEntityName(): string
    {
        return 'store_locator';
    }

    public function getCollectionClass(): string
    {
        return StoreLocatorCollection::class;
    }

    public function getEntityClass(): string
    {
        return StoreLocatorEntity::class;
    }

    protected function defineFields(): FieldCollection
    {
        return new FieldCollection(
            [
                (new IdField('id', 'id'))->addFlags(new Required(), new PrimaryKey()),
                (new BoolField('active', 'active'))->addFlags(new Required()),
                (new StringField('title', 'title'))->addFlags(new Required()),
                (new StringField('latitude', 'latitude'))->addFlags(new Required()),
                (new StringField('longitude', 'longitude'))->addFlags(new Required()),
                (new FkField('country', 'country', 'country'))->addFlags(new Required()),
                (new StringField('city', 'city'))->addFlags(new Required()),
                (new StringField('postal_code', 'postalCode'))->addFlags(new Required()),
                (new StringField('address', 'address'))->addFlags(new Required()),
                new StringField('number', 'number'),
                new StringField('email', 'email'),
                new FkField('state', 'state', 'country_state'),
                new FkField('logo', 'logo', 'media'),
                new StringField('url', 'url'),
                (new LongTextField('description', 'description'))->addFlags(new AllowHtml()),
                new LongTextField('working_hours', 'workingHours'),
                (new BoolField('parking_available', 'parkingAvailable')),
                (new BoolField('atm', 'atm')),
                (new JsonField('new_arrivals', 'newArrivals',[],[])),
                (new JsonField('payment_method', 'paymentMethod',[],[])),
                (new JsonField('manufacturer', 'manufacturer',[],[])),
                new StringField('meta_title', 'metaTitle'),
                new StringField('meta_description', 'metaDescription'),
                new StringField('seo_keywords', 'seoKeywords'),

                // (new LongTextField('description', 'description'))->(new AllowHtml()),

                // (new OneToManyAssociationField(
                //     'media', // Association name
                //     StoreLocatorMediaDefinition::class, // Reference to the media entity definition
                //     'store_id', // Foreign key in the media table
                //     'id' // Primary key in the store locator table
                // ))->addFlags(new ApiAware())

            ]
        );
    }
}
