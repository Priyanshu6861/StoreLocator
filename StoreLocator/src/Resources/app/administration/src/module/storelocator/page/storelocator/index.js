import template from './storelocator.html.twig';

const { Component, Mixin } = Shopware;
const { Criteria } = Shopware.Data;

Component.register('storelocator', {
    template: template,
    inject: ['repositoryFactory', 'acl'],

    mixins: [
        Mixin.getByName('salutation'),
        Mixin.getByName('listing')
    ],

    created() {
        this.getList();
    },

    data() {
        return {
            total: 0,
            storeLocatorCollection: null,
            repository: null,
            isLoading: false,
            processSuccess: false
        };
    },
    metaInfo() {
        return {
            title: this.$t("storelocator.title.list"),
        };
    },
    computed: {
        columns() {
            return [
                {
                    property: 'active',
                    dataIndex: 'active',
                    label: 'storelocator.field.active',
                    allowResize: true,
                    align: 'center',
                    sortable: true,
                },
                {
                    property: 'title',
                    dataIndex: 'title',
                    label: 'storelocator.field.store',
                    allowResize: true,
                    align: 'center',
                    sortable: true,
                },
                {
                    property: 'longitude',
                    dataIndex: 'longitude',
                    label: 'storelocator.field.longitude',
                    allowResize: true,
                    align: 'center',
                    sortable: true,
                },
                {
                    property: 'latitude',
                    dataIndex: 'latitude',
                    label: 'storelocator.field.latitude',
                    allowResize: true,
                    align: 'center',
                    sortable: true,
                }
            ];
        }
    },
    methods: {
        getList() {
            const criteria = new Criteria();
            this.repository = this.repositoryFactory.create('store_locator');
            this.repository.search(criteria, Shopware.Context.api).then((result) => {
                this.storeLocatorCollection = result;
                this.total = result.total;
            })
        },
        saveFinish() {
            this.processSuccess = false;
        },
        editItem(item) {
            const route = { path: '/storelocator/edit/' + item.id };
            this.$router.push(route);
        },
        addNew() {
            const addRoute = { path: '/storelocator/add' };
            this.$router.push(addRoute);
        },
        allowAddNew() {
            return this.acl.can('store_locator:create');
        },
        allowEdit() {
            return this.acl.can('store_locator:update');
        },
        allowView() {
            return this.acl.can('store_locator:read');
        }
    }
});
