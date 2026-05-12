<?php

declare(strict_types=1);

namespace StoreLocator\StoreLocatorPlugin\Controller;

use StoreLocator\StoreLocatorPlugin\Core\Content\Locator\StoreLocatorEntity;
use Exception;
use Ramsey\Uuid\Uuid;
use Shopware\Core\Content\Cms\SalesChannel\Struct\ImageSliderStruct;
use Shopware\Core\Content\Media\MediaCollection;
use Shopware\Core\Content\Media\MediaEntity;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\RangeFilter;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Sorting\FieldSorting;
use Shopware\Core\System\Country\Aggregate\CountryState\CountryStateEntity;
use Shopware\Core\System\Country\CountryEntity;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Shopware\Core\System\SystemConfig\SystemConfigService;
use Shopware\Storefront\Controller\StorefrontController;
use Shopware\Storefront\Page\GenericPageLoader;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route(defaults: ['_routeScope' => ['storefront']])]
class StoreController extends StorefrontController
{
    protected $genericPageLoader;
    protected $storesRepository;
    protected $mediaRepository;
    protected $countryRepository;
    protected $stateRepository;
    protected $systemConfigService;
    protected $storeMediaRepository;
    protected $cmsSlotRepository;
    protected $productManufacturerRepository;
    protected $paymentMethodRepository;
    public function __construct(
        GenericPageLoader $genericPageLoader,
        EntityRepository $storesRepository,
        EntityRepository $mediaRepository,
        EntityRepository $countryRepository,
        EntityRepository $stateRepository,
        SystemConfigService $systemConfigService,
        EntityRepository $storeMediaRepository,
        EntityRepository $cmsSlotRepository,
        EntityRepository $productManufacturerRepository,
        EntityRepository $paymentMethodRepository,
    ) {
        $this->paymentMethodRepository = $paymentMethodRepository;
        $this->productManufacturerRepository = $productManufacturerRepository;
        $this->cmsSlotRepository = $cmsSlotRepository;
        $this->storeMediaRepository = $storeMediaRepository;
        $this->genericPageLoader = $genericPageLoader;
        $this->storesRepository = $storesRepository;
        $this->mediaRepository = $mediaRepository;
        $this->countryRepository = $countryRepository;
        $this->stateRepository = $stateRepository;
        $this->systemConfigService = $systemConfigService;
    }

    #[
        Route(
            path: '/stores',
            name: 'frontend.storelocator.stores',
            methods: ['GET'],
            defaults: ['_routeScope' => ['storefront']]
        )
    ]
    public function getStores(Request $request, SalesChannelContext $salesChannelContext): Response
    {
        $page = $this->genericPageLoader->load($request, $salesChannelContext);
        $page->getMetaInformation()->setRobots('noindex, nofollow');

        $googleMapCookie = $request->cookies->get('google-map-enabled');
        if (!$googleMapCookie) {
            $response = $this->renderStorefront('@Storefront/storefront/page/stores.html.twig', [
                'page' => $page,
                'cookie' => true,
            ]);

            return $response;
        }
        $criteria = new Criteria();
        $criteria->addFilter(new EqualsFilter('active', 1));
        $criteria->addSorting(new FieldSorting('createdAt', FieldSorting::DESCENDING));
        $criteria->setLimit(\intval($this->systemConfigService->get('StoreLocatorPlugin.config.limit')));
        $criteria->addAssociation('country');
        $criteria->addAssociation('country_state');
        $criteria->setOffset(0);

        /** @var StoreLocatorEntity|null $stores */
        $stores = $this->storesRepository->search($criteria, $salesChannelContext->getContext())->getEntities();

        $media = [];
        $states = [];
        $countries = [];
        $workingHours = [];

        foreach ($stores as $store) {
            if ($logoId = $store->getLogo()) {
                $logoCriteria = new Criteria();
                $logoCriteria->addFilter(new EqualsFilter('id', $logoId));

                /** @var StoreLocatorEntity|null $logo */
                $logo = $this->mediaRepository->search($logoCriteria, $salesChannelContext->getContext())->first();
                $media[$logo->getId()] = $logo->getUrl();
            }
            if ($store->getState() && !isset($states[$store->getState()])) {
                $states[$store->getState()] = $this->getStateById($store->getState(), $salesChannelContext)->getName();
            }
            if ($store->getCountry() && !isset($states[$store->getCountry()])) {
                $countries[$store->getCountry()] = $this->getCountryById($store->getCountry(), $salesChannelContext)->getName();
            }
            if ($store->getWorkingHours()) {
                $workingHours[$store->getId()] = \json_decode($store->getWorkingHours(), true);
            }
            if ($store->getEmail()) {
                $data['email'] = $store->getEmail();
            }
            if ($store->getNumber()) {
                $data['number'] = $store->getNumber();
            }
        }

        $pageInfo = $this->getPaginationInfo($salesChannelContext);

        $response = $this->renderStorefront('@Storefront/storefront/page/stores.html.twig', [
            'page' => $page,
            'cookie' => false,
            'stores' => $stores,
            'media' => $media,
            'pageInfo' => $pageInfo,
            'states' => $states,
            'countries' => $countries,
            'workingHours' => $workingHours,
        ]);

        return $response;
    }

    #[
        Route(
            path: '/stores/ajax',
            name: 'frontend.storelocator.stores.ajax',
            methods: ['POST'],
            defaults: ['XmlHttpRequest' => true, '_routeScope' => ['storefront'], 'auth_required' => false]
        )
    ]
    public function getStoresAjax(Request $request, SalesChannelContext $salesChannelContext): JsonResponse
    {
        try {
            $data = $request->request->all();

            $criteria = new Criteria();
            $criteria->addFilter(new EqualsFilter('active', '1'));
            $criteria->addSorting(new FieldSorting('createdAt', FieldSorting::DESCENDING));
            $criteria->setLimit((int) $data['limit']);
            $criteria->setOffset(((int) $data['pageNumber'] - 1) * (int) $data['limit']);

            $responce = [];
            $states = [];
            /** @var StoreLocatorEntity|null $stores */
            $stores = $this->storesRepository->search($criteria, $salesChannelContext->getContext())->getEntities();
            foreach ($stores as $store) {
                $data = [];
                $data['logo'] = $store->getLogo();
                if ($logoId = $store->getLogo()) {
                    $logoCriteria = new Criteria();
                    $logoCriteria->addFilter(new EqualsFilter('id', $logoId));

                    /** @var StoreLocatorEntity|null $logo */
                    $logo = $this->mediaRepository->search($logoCriteria, $salesChannelContext->getContext())->first();
                    $data['logo'] = $logo->getUrl();
                }
                $data['id'] = $store->getId();
                $data['title'] = $store->getTitle();
                $data['address'] = $store->getAddress();
                $data['city'] = $store->getCity();
                $data['zip'] = $store->getPostalCode();
                $data['url'] = $store->getUrl();
                $data['longitude'] = $store->getLongitude();
                $data['latitude'] = $store->getLatitude();
                $data['zoom'] = $this->systemConfigService->get('StoreLocatorPlugin.config.zoom');
                if ($store->getState() && !isset($states[$store->getState()])) {
                    $data['state'] = $this->getStateById($store->getState(), $salesChannelContext)->getName();
                }
                if ($store->getCountry() && !isset($states[$store->getCountry()])) {
                    $data['country'] = $this->getCountryById($store->getCountry(), $salesChannelContext)->getName();
                }
                if ($store->getWorkingHours()) {
                    $data['working_hours'] = \json_decode($store->getWorkingHours(), true);
                }
                if ($store->getEmail()) {
                    $data['email'] = $store->getEmail();
                }
                if ($store->getNumber()) {
                    $data['number'] = $store->getNumber();
                }
                $responce[] = $data;
            }

            return new JsonResponse(['status' => 200, 'data' => $responce]);
        } catch (\Throwable $exception) {
            $this->addFlash('error', $exception->getMessage());

            return new JsonResponse(['status' => $exception->getCode(), 'message' => $exception->getMessage()]);
        }
    }

    private function getPaginationInfo($salesChannelContext, $range = []): array
    {
        $countCriteria = new Criteria();
        $countCriteria->addFilter(new EqualsFilter('active', 1));
        if (!empty($range)) {
            $countCriteria->addFilter(
                new RangeFilter('latitude', [
                    RangeFilter::GTE => $range['minLat'],
                    RangeFilter::LTE => $range['maxLat'],
                ])
            );
            $countCriteria->addFilter(
                new RangeFilter('longitude', [
                    RangeFilter::GTE => $range['minLng'],
                    RangeFilter::LTE => $range['maxLng'],
                ])
            );
        }
        $total = $this->storesRepository->search($countCriteria, $salesChannelContext->getContext())->count();
        $limit = \intval($this->systemConfigService->get('StoreLocatorPlugin.config.limit'));
        $pages = \ceil($total / $limit);

        return ['total' => $total, 'limit' => $limit, 'pages' => $pages];
    }

    #[
        Route(
            path: '/stores/search',
            name: 'frontend.storelocator.stores.search',
            methods: ['POST'],
            defaults: ['XmlHttpRequest' => true, '_routeScope' => ['storefront'], 'auth_required' => false]
        )
    ]
    public function getStoresSearch(Request $request, SalesChannelContext $salesChannelContext): JsonResponse
    {
        try {
            $data = $request->request->all();
            $calculateBoundingBox = $this->calculateBoundingBox($data['latitude'], $data['longitude'], $data['range']);
            $criteria = new Criteria();
            $criteria->addFilter(new EqualsFilter('active', '1'));
            $criteria->addFilter(
                new RangeFilter('latitude', [
                    RangeFilter::GTE => $calculateBoundingBox['minLat'],
                    RangeFilter::LTE => $calculateBoundingBox['maxLat'],
                ])
            );
            $criteria->addFilter(
                new RangeFilter('longitude', [
                    RangeFilter::GTE => $calculateBoundingBox['minLng'],
                    RangeFilter::LTE => $calculateBoundingBox['maxLng'],
                ])
            );
            $criteria->addSorting(new FieldSorting('createdAt', FieldSorting::DESCENDING));
            $criteria->setLimit(\intval($this->systemConfigService->get('StoreLocatorPlugin.config.limit')));
            $criteria->setOffset(0);

            $responce = [];
            $states = [];
            /** @var StoreLocatorEntity|null $stores */
            $stores = $this->storesRepository->search($criteria, $salesChannelContext->getContext())->getEntities();
            foreach ($stores as $store) {
                $data = [];
                $data['logo'] = $store->getLogo();
                if ($logoId = $store->getLogo()) {
                    $logoCriteria = new Criteria();
                    $logoCriteria->addFilter(new EqualsFilter('id', $logoId));

                    /** @var StoreLocatorEntity|null $logo */
                    $logo = $this->mediaRepository->search($logoCriteria, $salesChannelContext->getContext())->first();
                    $data['logo'] = $logo->getUrl();
                }
                $data['title'] = $store->getTitle();
                $data['address'] = $store->getAddress();
                $data['city'] = $store->getCity();
                $data['zip'] = $store->getPostalCode();
                $data['url'] = $store->getUrl();
                $data['longitude'] = $store->getLongitude();
                $data['latitude'] = $store->getLatitude();
                $data['zoom'] = $this->systemConfigService->get('StoreLocatorPlugin.config.zoom');
                if ($store->getState() && !isset($states[$store->getState()])) {
                    $data['state'] = $this->getStateById($store->getState(), $salesChannelContext)->getName();
                }
                if ($store->getCountry() && !isset($states[$store->getCountry()])) {
                    $data['country'] = $this->getCountryById($store->getCountry(), $salesChannelContext)->getName();
                }
                if ($store->getWorkingHours()) {
                    $data['working_hours'] = \json_decode($store->getWorkingHours(), true);
                }
                if ($store->getEmail()) {
                    $data['email'] = $store->getEmail();
                }
                if ($store->getNumber()) {
                    $data['number'] = $store->getNumber();
                }
                $responce[] = $data;
            }
            $pagination = $this->getPaginationInfo($salesChannelContext, $calculateBoundingBox);

            return new JsonResponse(['status' => 200, 'data' => $responce, 'pagination' => $pagination]);
        } catch (\Throwable $exception) {
            $this->addFlash('error', $exception->getMessage());

            return new JsonResponse(['status' => $exception->getCode(), 'message' => $exception->getMessage()]);
        }
    }

    private function calculateBoundingBox($lat, $lng, $range)
    {
        $earthRadius = 6371; // Radius of the Earth in kilometers
        $rangeUnit = $this->systemConfigService->get('StoreLocatorPlugin.config.unit');
        if ($rangeUnit === 'mi') {
            $range = 1.60934 * $range;
        }
        if (!$range) {
            $range = 1000;
        }
        $angularRange = $range / $earthRadius; // Convert range to angular distance
        $angularRange = \min($angularRange, \pi() / 2);
        $latRadian = \deg2rad(num: $lat);
        $lngRadian = \deg2rad($lng);

        // Calculate maximum and minimum latitude
        if ($lat < 0) {
            $minLat = \rad2deg($latRadian + $angularRange);
            $maxLat = \rad2deg($latRadian - $angularRange);
        } else {
            $maxLat = \rad2deg($latRadian + $angularRange);
            $minLat = \rad2deg($latRadian - $angularRange);
        }

        // Calculate maximum and minimum longitude
        $deltaLng = \asin(\sin($angularRange) / \cos($latRadian));
        if (!\is_numeric($deltaLng)) {
            $deltaLng = $lngRadian > 0 ? \pi() / 2 : -\pi() / 2;
        }
        if ($lng < 0) {
            $maxLng = \rad2deg($lngRadian - $deltaLng);
            $minLng = \rad2deg($lngRadian + $deltaLng);
        } else {
            $maxLng = \rad2deg($lngRadian + $deltaLng);
            $minLng = \rad2deg($lngRadian - $deltaLng);
        }

        return ['maxLat' => $maxLat, 'minLat' => $minLat, 'maxLng' => $maxLng, 'minLng' => $minLng];
    }

    public function getStateById(string $stateId, SalesChannelContext $salesChannelContext)
    {
        /** @var CountryStateEntity|null $state */
        $state = $this->stateRepository->search(
            (new Criteria())->addFilter(new EqualsFilter('id', $stateId)),
            $salesChannelContext->getContext()
        )->first();

        return $state;
    }

    public function getCountryById(string $countryId, SalesChannelContext $salesChannelContext)
    {
        /** @var CountryEntity|null $country */
        $country = $this->countryRepository->search(
            (new Criteria())->addFilter(new EqualsFilter('id', $countryId)),
            $salesChannelContext->getContext()
        )->first();

        return $country;
    }

    //TEST
    #[
        Route(
            path: '/stores/detail',
            name: 'frontend.storelocator.store.detail',
            methods: ['GET', 'POST'],
            defaults: ['_routeScope' => ['storefront']]
        )
    ]
    public function getStoreDetailPage(){
        
    }
    #[
        Route(
            path: '/stores/detail',
            name: 'frontend.storelocator.store.detail',
            methods: ['GET', 'POST'],
            defaults: ['_routeScope' => ['storefront']]
        )
    ]
    public function getStoreDetail(Request $request, SalesChannelContext $salesChannelContext)
    {
        try {
            if($this->systemConfigService->get('StoreLocatorPlugin.config.detailPage') === 'no'){
                return new RedirectResponse($this->generateUrl('frontend.storelocator.stores'));
            }
            $data = $request->request->all();
            if (!isset($data['id']) || !$data['id']) {
                return new RedirectResponse($this->generateUrl('frontend.storelocator.stores'));
            }
            $page = $this->genericPageLoader->load($request, $salesChannelContext);

            $googleMapCookie = $request->cookies->get('google-map-enabled');
            if (!$googleMapCookie) {
                $response = $this->renderStorefront('@Storefront/storefront/page/stores.html.twig', [
                    'page' => $page,
                    'cookie' => true,
                ]);

                return $response;
            }
            $storeState = '';
            $storeCountry = '';

            $store = $this->getStoreById($data['id'],$salesChannelContext);
            // $store = $storeMediaCollection->getStore();
            if ($store->getState()) {
                $storeState = $this->getStateById($store->getState(), $salesChannelContext)->getName();
            }
            if ($store->getCountry()) {
                $storeCountry = $this->getCountryById($store->getCountry(), $salesChannelContext)->getName();
            }
            if (!$store) {
                return new RedirectResponse($this->generateUrl('frontend.storelocator.stores'));
            }
            $storeBrands = $this->getStoreManufacturer($store,$salesChannelContext);
            $storePaymentMethods = $this->getStorePaymentMethods($store,$salesChannelContext);
            $storeMediaCollection = $this->getStoreMediaById($data['id'],$salesChannelContext);
            $cmsSlotEntity = $this->getCmsSlotEntity($salesChannelContext);
            if ($cmsSlotEntity) {
                $sliderItems = [];

                // Extract media from your custom collection
                foreach ($storeMediaCollection as $item) {
                    if ($item->getMedia() instanceof MediaEntity) {
                        $sliderItems[] = [
                            'mediaId' => $item->getMedia()->getId(),
                            'media' => $item->getMedia()
                        ];
                    }
                }

                // Create the ImageSliderStruct and set sliderItems
                $imageSliderStruct = new ImageSliderStruct();
                $imageSliderStruct->setSliderItems($sliderItems);

                $cmsSlotEntity->setData($imageSliderStruct);
            }
            $response = $this->renderStorefront('@Storefront/storefront/page/store-detail.html.twig', [
                'page' => $page,
                'cookie' => false,
                'POST_data' => $data,
                'storeMedia' => $storeMediaCollection,
                'storeState' => $storeState,
                'storeCountry' => $storeCountry,
                'store' => $store,
                'workingHours' => \json_decode($store->getWorkingHours(), true),
                'element' => $cmsSlotEntity,
                'storeBrands' => $storeBrands,
                'storePaymentMethod' => $storePaymentMethods
            ]);

            return $response;
        } catch (\Exception $e) {
            return new RedirectResponse($this->generateUrl('frontend.storelocator.stores'));
        }
    }

    private function getStoreMediaById($id,$salesChannelContext){
        $criteria = new Criteria();
        $criteria->addAssociation('media');
        $criteria->addAssociation('store');
        $criteria->addFilter(new EqualsFilter('storeId', $id));
        /** @var StoreLocatorMediaEntity|null $storeMediaCollection */
        $storeMediaCollection = $this->storeMediaRepository->search($criteria, $salesChannelContext->getContext());
        return $storeMediaCollection;
    }

    private function getStoreById($id,$salesChannelContext){
        $criteria = new Criteria([$id]);
        $criteria->addAssociation('media');
        /** @var StoreLocatorEntity|null $store */
        $store = $this->storesRepository->search($criteria, $salesChannelContext->getContext())->first();
        return $store;
    }

    private function getCmsSlotEntity($salesChannelContext){
        $criteria = new Criteria();
        $criteria->addFilter(new EqualsFilter("type", "image-gallery"));
        $criteria->addFilter(new EqualsFilter("slot", "left"));
        /** @var CmsSlotEntity|null $cmsSlotEntity */
        $cmsSlotEntity = $this->cmsSlotRepository->search($criteria, $salesChannelContext->getContext())->first();
        return $cmsSlotEntity;
    }

    private function getStoreManufacturer($store,$salesChannelContext){
        $brands = [];
        if($store->getManufacturer()){
            foreach($store->getManufacturer() as $manufacturer){
                $criteria = new Criteria([$manufacturer]);
                /** @var ProductManufacturerEntity|null $tempManfucturer */
                $tempManfucturer = $this->productManufacturerRepository->search($criteria,$salesChannelContext->getContext())->first();
                $brands[] = $tempManfucturer->getName();
            }
        }
        return $brands;
    }

    private function getStorePaymentMethods($store,$salesChannelContext){
        $storePaymentMethods = [];
        if($store->getPaymentMethod()){
            foreach($store->getPaymentMethod() as $paymentMethod){
                $criteria = new Criteria([$paymentMethod]);
                /** @var PaymentMethodEntity|null $tempPaymentMethod */
                $tempPaymentMethod = $this->paymentMethodRepository->search($criteria,$salesChannelContext->getContext())->first();
                $storePaymentMethods[] = $tempPaymentMethod->getName();
            }
        }
        return $storePaymentMethods;
    }
}
