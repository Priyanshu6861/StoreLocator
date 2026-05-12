import template from './storelocator-add.html.twig';
import './storelocator-add.scss';

const { Component, Mixin, Utils } = Shopware;
const { Criteria } = Shopware.Data;
const { EntityCollection } = Shopware.Data;

Component.register('storelocator-add', {
    template: template,
    inject: [
        'repositoryFactory',
        'systemConfigApiService'
    ],
    emits: [
        'media-open'
    ],
    mixins: [
        Mixin.getByName('notification')
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
        }
    },
    metaInfo() {
        return {
            title: this.$t("storelocator.title.add")
        };
    },
    created() {
        this.repository = this.repositoryFactory.create('store_locator');
        this.storeMediaRepository = this.repositoryFactory.create('store_locator_media');
        this.fetchPaymentMethods();
        this.fetchManufacturers();
    },
    data() {
        return {
            schedule: {
                monday: { active: false, start: null, end: null },
                tuesday: { active: false, start: null, end: null },
                wednesday: { active: false, start: null, end: null },
                thursday: { active: false, start: null, end: null },
                friday: { active: false, start: null, end: null },
                saturday: { active: false, start: null, end: null },
                sunday: { active: false, start: null, end: null },
            },
            storeLocatorCollection: {},
            isLoading: false,
            repository: null,
            processSuccess: false,
            active: true,
            title: null,
            latitude: null,
            longitude: null,
            address: null,
            country: null,
            stateId: null,
            states: [],
            city: null,
            zip: null,
            number: null,
            email: null,
            url: null,
            logo: null,
            countryId: null,
            uploadTag: Utils.createId(),
            uploadStoreImagesTag: Utils.createId(),
            storeMediaRepository: null,
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
            availableManufacturers: [],
            metaTitle: '',
            metaDescription: '',
            seoKeywords: ''
        };
    },
    computed: {
        countryRepository() {
            return this.repositoryFactory.create('country');
        },

        countryStateRepository() {
            return this.repositoryFactory.create('country_state');
        },

        countryId: {
            get() {
                return this.countryId;
            },

            set(countryId) {
                this.countryId = countryId;
            },
        },

        countryCriteria() {
            const criteria = new Criteria(1, 25);
            criteria.addSorting(Criteria.sort('position', 'ASC', true))
                .addSorting(Criteria.sort('name', 'ASC'));
            return criteria;
        },
        mediaRepository() {
            return this.repositoryFactory.create('media'); // Get media repository
        },

        stateCriteria() {
            if (!this.countryId) {
                return null;
            }

            const criteria = new Criteria(1, 25);
            criteria.addFilter(Criteria.equals('countryId', this.countryId))
                .addSorting(Criteria.sort('position', 'ASC', true))
                .addSorting(Criteria.sort('name', 'ASC'));
            return criteria;
        },
        isValidSchedule() {
            return Object.values(this.schedule).every(day => !day.active || (day.start !== null && day.end !== null));
        }
    },
    watch: {
        countryId: {
            immediate: true,
            handler(newId, oldId) {

                if (typeof oldId !== 'undefined') {
                    this.stateId = null;
                }

                if (!this.countryId) {
                    this.country = null;
                    return Promise.resolve();
                }

                return this.countryRepository.get(this.countryId).then((country) => {
                    this.country = country;

                    this.getCountryStates();
                });
            }
        }
    },
    methods: {
        onClickSave() {
            this.isLoading = true;
            if (this.validation()) {
                this.storeLocatorCollection = this.repository.create();
                this.storeLocatorCollection.active = this.active;
                this.storeLocatorCollection.title = this.title;
                this.storeLocatorCollection.address = this.address;
                this.storeLocatorCollection.url = this.url;
                this.storeLocatorCollection.longitude = this.longitude;
                this.storeLocatorCollection.latitude = this.latitude;
                this.storeLocatorCollection.logo = this.logo;
                this.storeLocatorCollection.state = this.stateId;
                this.storeLocatorCollection.country = this.countryId;
                this.storeLocatorCollection.city = this.city;
                this.storeLocatorCollection.postalCode = this.zip;
                this.storeLocatorCollection.number = this.number;
                this.storeLocatorCollection.email = this.email;
                this.storeLocatorCollection.description = this.description;
                this.storeLocatorCollection.workingHours = JSON.stringify(this.schedule);
                this.storeLocatorCollection.parkingAvailable = this.parkingAvailable;
                this.storeLocatorCollection.atm = this.atm;
                this.storeLocatorCollection.newArrivals = this.newArrivals;
                this.storeLocatorCollection.paymentMethod = this.paymentMethods;
                this.storeLocatorCollection.manufacturer = this.brands;
                this.storeLocatorCollection.metaTitle = this.metaTitle;
                this.storeLocatorCollection.metaDescription = this.metaDescription;
                this.storeLocatorCollection.seoKeywords = this.seoKeywords;
                this.repository
                    .save(this.storeLocatorCollection)
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
                    // this.storeMedia.forEach(media => {
                    //     this.storeMediaCollection = this.storeMediaRepository.create();
                    //     this.storeMediaCollection.storeId
                    //     this.storeMediaRepository.save()
                    // });
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
            if (!this.title || !this.address || !this.longitude || !this.latitude) {
                this.createNotificationError({
                    title: this.$t('Error'),
                    message: this.$t('storelocator.message.validation-error')
                });
                return false;
            }
            if (!this.stateId && this.states.length) {
                this.createNotificationError({
                    title: this.$t('Error'),
                    message: this.$t('storelocator.message.validation-error')
                });
                return false;
            }
            if (this.title === '' || this.address === '' || this.longitude === '' || this.latitude === '') {
                this.createNotificationError({
                    title: this.$t('Error'),
                    message: this.$t('storelocator.message.validation-error')
                });
                return false;
            }
            if (!(parseFloat(this.longitude) >= -180 && parseFloat(this.longitude) < 180)) {
                this.createNotificationError({
                    title: this.$t('Error'),
                    message: this.$t('storelocator.message.longitude-validation-error')
                });
                return false;
            }
            if (!(parseFloat(this.latitude) >= -90 && parseFloat(this.latitude) <= 90)) {
                this.createNotificationError({
                    title: this.$t('Error'),
                    message: this.$t('storelocator.message.latitude-validation-error')
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
        successfulUpload({ targetId }) {

            this.logo = targetId;
        },
        onRemoveMediaItem() {
            this.logo = null;
        },
        getCountryStates() {
            if (!this.country) {
                return Promise.resolve();
            }
            return this.countryStateRepository.search(this.stateCriteria).then((response) => {
                this.states = response;
            });
        },
        capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
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
        onRemoveMultiMediaItem(mediaItem) {
            this.storeMedia = this.storeMedia.filter(id => id !== mediaItem.id);
        },
        onOpenMedia() {
            this.$emit('media-open');
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
            this.storeMedia = this.storeMedia.filter(item => item.id !== media.id);
        },
        updateMediaItemPositions() {
            this.storeMedia.forEach((medium, index) => {
                medium.position = index;
            });
        },
        changeValue(newArrivals){
            this.newArrivals = newArrivals;            
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
        fetchManufacturers(){
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
        }
    }
});
