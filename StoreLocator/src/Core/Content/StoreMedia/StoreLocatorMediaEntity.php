<?php

declare(strict_types=1);

namespace StoreLocator\StoreLocatorPlugin\Core\Content\StoreMedia;

use StoreLocator\StoreLocatorPlugin\Core\Content\Locator\StoreLocatorEntity;
use Shopware\Core\Content\Media\MediaEntity;
use Shopware\Core\Framework\DataAbstractionLayer\Entity;
use Shopware\Core\Framework\DataAbstractionLayer\EntityIdTrait;

class StoreLocatorMediaEntity extends Entity
{
    use EntityIdTrait;

    /**
     * @var int
     */
    protected $position;

    /**
     * @var string
     */
    protected $storeId;

    /**
     * @var string
     */
    protected $mediaId;

    protected $media;

    protected $store;

    /**
     * @return int|null
     */
    public function getPosition(): int
    {
        return $this->position;
    }

    /**
     * @param int $position
     */
    public function setPosition(string $position): void
    {
        $this->position = $position;
    }

    /**
     * @return string|null
     */
    public function getStoreId(): string
    {
        return $this->storeId;
    }

    /**
     * @param string $storeId
     */
    public function setStoreId(string $storeId): void
    {
        $this->storeId = $storeId;
    }

        /**
     * @return string|null
     */
    public function getMediaId(): string
    {
        return $this->mediaId;
    }

    /**
     * @param string $mediaId
     */
    public function setMediaId(string $mediaId): void
    {
        $this->mediaId = $mediaId;
    }

    public function getMedia(): ?MediaEntity
    {
        return $this->media;
    }

    public function setMedia(MediaEntity $media): void
    {
        $this->media = $media;
    }

    public function getStore(): ?StoreLocatorEntity
    {
        return $this->store;
    }

    public function setStore(StoreLocatorEntity $store): void
    {
        $this->store = $store;
    }
}