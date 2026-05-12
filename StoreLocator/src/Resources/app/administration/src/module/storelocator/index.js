import './page/storelocator';
import './page/storelocator-add';
import './page/storelocator-edit';

import enGB from './snippet/en-GB';
import deDE from './snippet/de_DE';


Shopware.Module.register('storelocator', {
    type: 'plugin',
    name: 'storelocator.menu',
    color: '#FFA500',
    title: 'storelocator.menu',
    description: 'Store Locator for Shopware 6',

    snippets: {
        'en-GB': enGB,
        'de-DE': deDE
    },

    routes: {
        list: {
            component: 'storelocator',
            path: 'list',
            meta: {
                privilege: 'store_locator:read'
            }
        },
        edit: {
            title: 'storelocator.title.edit',
            component: 'storelocator-edit',
            path: 'edit/:id',
            meta: {
                parentPath: 'storelocator.list',
                privilege: 'store_locator:update'
            }
        },
        add: {
            title: 'storelocator.title.add',
            component: 'storelocator-add',
            path: 'add',
            meta: {
                parentPath: 'storelocator.list',
                privilege: 'store_locator:create'
            }
        }
    },

    navigation: [{
        label: 'storelocator.menu',
        color: '#ff3d58',
        path: 'storelocator.list',
        parent: 'sw-content',
        position: 100,
        privilege: 'store_locator:read'
    }],

    settingsItem: [{
        group: 'plugin',
        to: 'storelocator.list',
        name: 'storelocator.menu',
        privilege: 'store_locator:read'
    }]
});
