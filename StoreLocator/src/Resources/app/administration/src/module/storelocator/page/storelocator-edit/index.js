import template from './storelocator-edit.html.twig';
import './storelocator-edit.scss';

const { Component, Mixin, Utils } = Shopware;
const { Criteria } = Shopware.Data;
const { EntityCollection } = Shopware.Data;

Component.register('storelocator-edit', {
    template: template,
    inject: [
        'feature',
        'conditionDataProviderService',
        'repositoryFactory',
        'systemConfigApiService'
    ],
    props: {
        salesChannel: {
            type: Object,
            required: false,
        },

        containerStyle: {
            type: Object,
            required: true,
        },
        fileAccept: {
            type: String,
            required: false,
            default: '*/*',
        },
    },
    mixins: [
        Mixin.getByName('notification')
    ],

    metaInfo() {
        return {
            title: this.$t("storelocator.title.edit")
        };
    },
    created() {
        this.fetchManufacturers();
        this.fetchPaymentMethods();
        this.storeLocatorRepository = this.repositoryFactory.create('store_locator');
        this.getList();
    },
    data() {
        return {
            storeLocatorCollection: null,
            isLoading: false,
            processSuccess: false,
            storeLocatorRepository: null,
            uploadTag: Utils.createId(),
            uploadStoreImagesTag: Utils.createId(),
            schedule: {},
            states: [],
            storeMedia: [],
            description: '',
            parkingAvailable: false,
            atm: false,
            newArrivals: [],
            newArrivalsList: [
                { name: 'Monday' },
                { name: 'Tuesday' },
                { name: 'Wednesday' },
                { name: 'Thursday' },
                { name: 'Friday' },
                { name: 'Saturday' },
                { name: 'Sunday' },
            ],
            paymentMethods: [],
            availablePaymentMethods: [],
            brands: [],
            availableManufacturers: []
        };
    },
    computed: {
        safeNewArrivals() {
            return Array.isArray(this.storeLocatorCollection?.newArrivals) ? this.storeLocatorCollection.newArrivals : [];
        },
        safePaymentMethods(){
            return Array.isArray(this.storeLocatorCollection?.paymentMethod) ? this.storeLocatorCollection.paymentMethod : [];
        },
        safeBrands(){
            return Array.isArray(this.storeLocatorCollection?.manufacturer) ? this.storeLocatorCollection.manufacturer : [];
        },
        countryRepository() {
            return this.repositoryFactory.create('country');
        },
        storeMediaRepository() {
            return this.repositoryFactory.create('store_locator_media');
        },
        countryStateRepository() {
            return this.repositoryFactory.create('country_state');
        },
        mediaRepository() {
            return this.repositoryFactory.create('media'); // Get media repository
        },

        countryCriteria() {
            const criteria = new Criteria(1, 25);
            criteria.addSorting(Criteria.sort('position', 'ASC', true))
                .addSorting(Criteria.sort('name', 'ASC'));
            return criteria;
        },
        stateCriteria() {
            if (!(this.storeLocatorCollection && this.storeLocatorCollection.country)) {
                return null;
            }

            const criteria = new Criteria(1, 25);
            criteria.addFilter(Criteria.equals('countryId', this.storeLocatorCollection.country))
                .addSorting(Criteria.sort('position', 'ASC', true))
                .addSorting(Criteria.sort('name', 'ASC'));
            return criteria;
        },
        isValidSchedule() {
            var flag = Object.values(this.schedule).every(day => !day.active || (day.start !== null && day.end !== null));
            return flag;
        }
    },
    methods: {
        async getList() {
            await this.storeLocatorRepository.get(this.$route.params.id, Shopware.Context.api).then((entity) => {
                this.storeLocatorCollection = entity;
                this.setConfig();
                this.getStoreMedia();
                this.schedule = this.storeLocatorCollection.workingHours ? JSON.parse(this.storeLocatorCollection.workingHours) : {};
                this.getCountryStates();
            });
        },
        async getStoreMedia() {
            const criteria = new Shopware.Data.Criteria();

            // Filter to get only the media related to this store
            criteria.addFilter(Shopware.Data.Criteria.equals('storeId', this.storeLocatorCollection.id));

            // Include media association
            criteria.addAssociation('media');
            await this.storeMediaRepository.search(criteria, Shopware.Context.api)
                .then((result) => {
                    this.storeMedia = result.map(storeMediaItem => storeMediaItem.media); // Store only media objects
                });
        },
        onClickSave() {
            if (this.validation()) {
                this.storeLocatorCollection.workingHours = JSON.stringify(this.schedule);
                this.storeLocatorCollection.newArrivals = this.newArrivals;
                this.storeLocatorCollection.paymentMethod = this.paymentMethods;
                this.storeLocatorCollection.manufacturer = this.brands;
                this.storeLocatorRepository
                    .save(this.storeLocatorCollection, Shopware.Context.api)
                    .then(() => {
                        if (this.storeMedia.length > 0) {
                            const criteria = new Shopware.Data.Criteria();
                            criteria.addFilter(
                                Shopware.Data.Criteria.equals('storeId', this.storeLocatorCollection.id)
                            );

                            // Step 1: Delete existing media entries
                            return this.storeMediaRepository.search(criteria, Shopware.Context.api).then((existingStoreMedia) => {
                                const deletePromises = existingStoreMedia.map(media =>
                                    this.storeMediaRepository.delete(media.id, Shopware.Context.api)
                                );
                                return Promise.all(deletePromises);
                            });
                        }
                    })
                    .then(() => {
                        if (this.storeMedia.length > 0) {
                            const mediaPromises = this.storeMedia.map((mediaItem, index) => {
                                let storeMedia = this.storeMediaRepository.create();
                                storeMedia.storeId = this.storeLocatorCollection.id;
                                storeMedia.mediaId = mediaItem.id;
                                storeMedia.position = index; // Assign position
                                return this.storeMediaRepository.save(storeMedia);
                            });
                            return Promise.all(mediaPromises);
                        }
                    })
                    .then(() => {
                        this.isLoading = false;
                        this.processSuccess = true;
                        this.createNotificationSuccess({
                            title: this.$t('Success'),
                            message: this.$t('storelocator.message.validation-add-success')
                        });
                        this.$router.push({ path: '/storelocator/list' });
                    }).catch((exception) => {
                        this.isLoading = false;
                        this.createNotificationError({
                            title: this.$t('Error'),
                            message: exception
                        });
                    });
            } else {
                this.isLoading = false;
            }
        },
        onCancel() {
            this.$router.push({ path: '/storelocator/list' });
        },

        saveFinish() {
            this.processSuccess = false;
        },
        validation() {
            if (!this.storeLocatorCollection.title || !this.storeLocatorCollection.address || !this.storeLocatorCollection.longitude || !this.storeLocatorCollection.latitude) {
                this.createNotificationError({
                    title: this.$t('Error'),
                    message: this.$t('storelocator.message.validation-error')
                });
                return false;
            }
            if (!this.storeLocatorCollection.state && this.states.length) {
                this.createNotificationError({
                    title: this.$t('Error'),
                    message: this.$t('storelocator.message.validation-error')
                });
                return false;
            }
            if (this.storeLocatorCollection.title === '' || this.storeLocatorCollection.address === '' || this.storeLocatorCollection.longitude === '' || this.storeLocatorCollection.latitude === '') {
                this.createNotificationError({
                    title: this.$t('Error'),
                    message: this.$t('storelocator.message.validation-error')
                });
                return false;
            }
            if (!this.isValidSchedule) {
                this.createNotificationError({
                    title: this.$t('Error'),
                    message: this.$t('storelocator.message.validation-error')
                });
                return false;
            }
            return true;
        },
        onRemoveMediaItem() {
            this.storeLocatorCollection.logo = null;
        },
        successfulUpload({ targetId }) {
            this.storeLocatorCollection.logo = targetId;
        },
        async getCountryStates() {
            if (!(this.storeLocatorCollection && this.storeLocatorCollection.country)) {
                return Promise.resolve();
            }
            return await this.countryStateRepository.search(this.stateCriteria).then((response) => {
                this.states = response;
            });
        },
        async successfulMultiUpload({ targetId }) {
            if (targetId) {
                try {
                    const mediaEntity = await this.mediaRepository.get(targetId, Shopware.Context.api);
                    this.storeMedia.push(mediaEntity);
                } catch (error) {
                    console.error('Error fetching media entity:', error);
                }
            }
        },
        handleCountryUpdate() {
            this.storeLocatorCollection.state = null;
            this.getCountryStates();
        },
        capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        },
        // onRemoveMultiMediaItem(mediaItem) {
        //     this.storeMedia = this.storeMedia.filter(id => id !== mediaItem.id);
        // },
        onRemoveMultiMediaItem(mediaItem) {
            this.storeMedia = this.storeMedia.filter(id => {
                if (id === mediaItem.id) {
                    this.deleteEntryFromMedia(mediaItem); // Call your function
                }
                return id !== mediaItem.id;
            });
        },
        deleteEntryFromMedia(mediaItem){
            const criteria = new Shopware.Data.Criteria();
            criteria.addFilter(
                Shopware.Data.Criteria.equals('mediaId', mediaId),
                Shopware.Data.Criteria.equals('storeId', storeId)
            );

            this.repositoryFactory.create('store_locator_media')
                .search(criteria, Shopware.Context.api)
                .then((result) => {
                    if (result.total > 0) {
                        result.forEach((entry) => {
                            this.repositoryFactory.create('store_locator_media')
                                .delete(entry.id, Shopware.Context.api);
                        });
                    }
                })
                .catch((error) => {
                    this.createNotificationError({
                        title: 'Error',
                        message: error.message
                    });
                });
        },
        onMediaItemDragSort(dragData, dropData, validDrop) {
            if (!validDrop) {
                return;
            }

            // Find index of dragged and dropped media items
            const dragIndex = this.storeMedia.findIndex(item => item.id === dragData.id);
            const dropIndex = this.storeMedia.findIndex(item => item.id === dropData.id);

            if (dragIndex === -1 || dropIndex === -1 || dragIndex === dropIndex) {
                return;
            }

            // Swap elements in storeMedia array
            const temp = this.storeMedia[dragIndex];
            this.$set(this.storeMedia, dragIndex, this.storeMedia[dropIndex]);
            this.$set(this.storeMedia, dropIndex, temp);
        },
        removeFile(media) {
            // Filter out the media item from storeMedia
            this.storeMedia = this.storeMedia.filter(item => item.id !== media.id);
        },
        updateMediaItemPositions() {
            this.storeMedia.forEach((medium, index) => {
                medium.position = index;
            });
        },
        // updateCurrentValue(value) {
        //     this.currentValue = value;
        // },
        changeValue(newArrivals) {
            if (!Array.isArray(newArrivals)) {
                newArrivals = [];
            }
            this.newArrivals = newArrivals;
            this.storeLocatorCollection.newArrivals = newArrivals;
        },
        onPaymentMethodChangeValue(paymentMethods){
            if (!Array.isArray(paymentMethods)) {
                paymentMethods = [];
            }
            this.paymentMethods = paymentMethods;
            this.storeLocatorCollection.paymentMethod = paymentMethods;
        },
        onBrandChangeValue(brands){
            if (!Array.isArray(brands)) {
                brands = [];
            }
            this.brands = brands;
            this.storeLocatorCollection.manufacturer = brands;
        },
        fetchPaymentMethods() {
            //update value of payment method when mapping type updates
            const criteria = new Shopware.Data.Criteria();
            criteria.addFilter(Shopware.Data.Criteria.equals('active', true));

            //Fetch payment methods
            this.repositoryFactory
                .create("payment_method")
                .search(criteria)
                .then((result) => {
                    if (!(result instanceof EntityCollection)) {
                        return Promise.reject(
                            new Error(
                                this.$t(
                                    "global.notification.notificationLoadingDataErrorMessage"
                                )
                            )
                        );
                    }
                    this.availablePaymentMethods = result.map(method => ({
                        label: method.name,  // Display name in dropdown
                        value: method.id     // ID for selection
                    }));
                    return Promise.resolve();
                })
                .catch((error) => {
                    this.createNotificationError({
                        title: 'Error',
                        message: error.message || error
                    });
                })
                .finally(() => { });
        },
        fetchManufacturers() {
            //update value of payment method when mapping type updates
            const criteria = new Shopware.Data.Criteria();
            //Fetch payment methods
            this.repositoryFactory
                .create("product_manufacturer")
                .search(criteria)
                .then((result) => {
                    if (!(result instanceof EntityCollection)) {
                        return Promise.reject(
                            new Error(
                                this.$t(
                                    "global.notification.notificationLoadingDataErrorMessage"
                                )
                            )
                        );
                    }
                    this.availableManufacturers = result.map(method => ({
                        label: method.name,  // Display name in dropdown
                        value: method.id     // ID for selection
                    }));
                    return Promise.resolve();
                })
                .catch((error) => {
                    this.createNotificationError({
                        title: 'Error',
                        message: error.message || error
                    });
                })
                .finally(() => { });
        },
        setConfig() {
            // this.brands = this.storeLocatorCollection.manufacturer ? this.storeLocatorCollection.manufacturer : []
            // this.paymentMethods = this.storeLocatorCollection.paymentMethod ? this.storeLocatorCollection.paymentMethod : [];
            // this.newArrivals = this.storeLocatorCollection.newArrivals ? this.storeLocatorCollection.newArrivals : [];

            if (!Array.isArray(this.storeLocatorCollection.manufacturer)) {
                this.storeLocatorCollection.manufacturer = [];
            }
            this.brands = this.storeLocatorCollection.manufacturer;

            if (!Array.isArray(this.storeLocatorCollection.paymentMethod)) {
                this.storeLocatorCollection.paymentMethod = [];
            }
            this.paymentMethods = this.storeLocatorCollection.paymentMethod;
            
            // ✅ Always ensure newArrivals is an array
            if (!Array.isArray(this.storeLocatorCollection.newArrivals)) {
                this.storeLocatorCollection.newArrivals = [];
            }
            this.newArrivals = this.storeLocatorCollection.newArrivals;
        }
    },
});
