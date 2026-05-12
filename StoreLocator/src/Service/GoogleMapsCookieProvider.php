<?php

declare(strict_types=1);

namespace StoreLocator\StoreLocatorPlugin\Service;

use Shopware\Storefront\Framework\Cookie\CookieProviderInterface;

class GoogleMapsCookieProvider implements CookieProviderInterface
{
    protected $service;
    public function __construct(CookieProviderInterface $service)
    {
        $this->service = $service;
    }

    private const GoogleMapCookie = [
        'snippet_name' => 'storelocator.cookie',
        'cookie' => 'google-map-enabled',
        'value' => '1',
    ];

    public function getCookieGroups(): array
    {
        return \array_merge(
            $this->service->getCookieGroups(),
            [
                self::GoogleMapCookie,
            ]
        );
    }
}
