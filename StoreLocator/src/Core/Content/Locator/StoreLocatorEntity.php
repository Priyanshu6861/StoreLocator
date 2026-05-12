<?php

declare(strict_types=1);

namespace StoreLocator\StoreLocatorPlugin\Core\Content\Locator;

use Shopware\Core\Framework\DataAbstractionLayer\Entity;
use Shopware\Core\Framework\DataAbstractionLayer\EntityIdTrait;

class StoreLocatorEntity extends Entity
{
    use EntityIdTrait;

    /**
     * @var bool
     */
    protected $active;

    /**
     * @var string
     */
    protected $title;

    /**
     * @var string
     */
    protected $address;

    /**
     * @var string
     */
    protected $url;

    /**
     * @var string|null
     */
    protected $logo;

    /**
     * @var string|null
     */
    protected $latitude;

    /**
     * @var string|null
     */
    protected $country;

    /**
     * @var string|null
     */
    protected $state;

    /**
     * @var string|null
     */
    protected $city;

    /**
     * @var string|null
     */
    protected $postalCode;

    /**
     * @var string|null
     */
    protected $number;

    /**
     * @var string|null
     */
    protected $email;

    /**
     * @var string|null
     */
    protected $workingHours;

    protected $manufacturer;
    protected $paymentMethod;
    protected $newArrivals;
    protected $parkingAvailable;
    protected $atm;
    protected $metaTitle;
    protected $metaDescription;
    protected $seoKeywords;


    /**
     * @return bool
     */
    public function isActive(): bool
    {
        return $this->active;
    }

    /**
     * @param bool $active
     */
    public function setActive(bool $active): void
    {
        $this->active = $active;
    }

    /**
     * @return string|null
     */
    public function getTitle(): string
    {
        return $this->title;
    }

    /**
     * @param string $title
     */
    public function setTitle(string $title): void
    {
        $this->title = $title;
    }

    /**
     * @return string|null
     */
    public function getAddress(): string
    {
        return $this->address;
    }

    /**
     * @param string $address
     */
    public function setAddress(string $address): void
    {
        $this->address = $address;
    }

    /**
     * @return string|null
     */
    public function getUrl(): ?string
    {
        return $this->url;
    }

    /**
     * @param string $url
     */
    public function setUrl(string $url): void
    {
        $this->url = $url;
    }

    /**
     * @return string|null
     */
    public function getLogo(): ?string
    {
        return $this->logo;
    }

    /**
     * @param string|null $logo
     */
    public function setLogo(?string $logo): void
    {
        $this->logo = $logo;
    }

    /**
     * @return string|null
     */
    public function getLatitude(): ?string
    {
        return $this->latitude;
    }

    /**
     * @param string|null $latitude
     */
    public function setLatitude(?string $latitude): void
    {
        $this->latitude = $latitude;
    }

    /**
     * @return string|null
     */
    public function getLongitude(): ?string
    {
        return $this->longitude;
    }

    /**
     * @param string|null $longitude
     */
    public function setLongitude(?string $longitude): void
    {
        $this->latitude = $longitude;
    }

    /**
     * @return string|null
     */
    public function getCountry(): ?string
    {
        return $this->country;
    }

    /**
     * @param string|null $country
     */
    public function setCountry(?string $country): void
    {
        $this->country = $country;
    }

    /**
     * @return string|null
     */
    public function getState(): ?string
    {
        return $this->state;
    }

    /**
     * @param string|null $state
     */
    public function setState(?string $state): void
    {
        $this->state = $state;
    }

    /**
     * @return string|null
     */
    public function getCity(): ?string
    {
        return $this->city;
    }

    /**
     * @param string|null $city
     */
    public function setCity(?string $city): void
    {
        $this->city = $city;
    }

    /**
     * @return string|null
     */
    public function getEmail(): ?string
    {
        return $this->email;
    }

    /**
     * @param string|null $email
     */
    public function setEmail(?string $email): void
    {
        $this->email = $email;
    }

    /**
     * @return string|null
     */
    public function getNumber(): ?string
    {
        return $this->number;
    }

    /**
     * @param string|null $number
     */
    public function setNumber(?string $number): void
    {
        $this->number = $number;
    }

    /**
     * @return string|null
     */
    public function getPostalCode(): ?string
    {
        return $this->postalCode;
    }

    /**
     * @param string|null $postalCode
     */
    public function setPostalCode(?string $postalCode): void
    {
        $this->postalCode = $postalCode;
    }

    /**
     * @return string|null
     */
    public function getWorkingHours(): ?string
    {
        return $this->workingHours;
    }

    /**
     * @param string|null $workingHours
     */
    public function setWorkingHours(?string $workingHours): void
    {
        $this->workingHours = $workingHours;
    }


    public function getManufacturer(): array
    {
        return $this->manufacturer;
    }

    public function setManufacturer(array $manufacturer): void
    {
        $this->manufacturer = $manufacturer;
    }

    public function getPaymentMethod(): array
    {
        return $this->paymentMethod;
    }

    public function setPaymentMethod(array $paymentMethod): void
    {
        $this->paymentMethod = $paymentMethod;
    }

    public function getNewArrivals(): array
    {
        return $this->newArrivals;
    }

    public function setNewArrivals(array $newArrivals): void
    {
        $this->newArrivals = $newArrivals;
    }


    /**
     * @param bool $parkingAvailable
     */
    public function setParkingAvailable(bool $parkingAvailable): void
    {
        $this->parkingAvailable = $parkingAvailable;
    }

    /**
     * @return bool|null
     */
    public function getParkingAvailable(): bool
    {
        return $this->parkingAvailable;
    }


    /**
     * @param bool $atm
     */
    public function setAtm(bool $atm): void
    {
        $this->atm = $atm;
    }

    /**
     * @return bool|null
     */
    public function getAtm(): bool
    {
        return $this->atm;
    }

    /**
     * @return string|null
     */
    public function getMetaTitle(): ?string
    {
        return $this->metaTitle;
    }

    /**
     * @param string|null $metaTitle
     */
    public function setMetaTitle(?string $metaTitle): void
    {
        $this->metaTitle = $metaTitle;
    }

    /**
     * @return string|null
     */
    public function getMetaDescription(): ?string
    {
        return $this->metaDescription;
    }

    /**
     * @param string|null $metaDescription
     */
    public function setMetaDescription(?string $metaDescription): void
    {
        $this->metaDescription = $metaDescription;
    }

        /**
     * @return string|null
     */
    public function getSeoKeywords(): ?string
    {
        return $this->seoKeywords;
    }

    /**
     * @param string|null $seoKeywords
     */
    public function setSeoKeywords(?string $seoKeywords): void
    {
        $this->seoKeywords = $seoKeywords;
    }
}
