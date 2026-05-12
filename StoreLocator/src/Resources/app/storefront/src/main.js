// Import all necessary Storefront plugins
import StoreLocator from './storeLocator/storeLocator';
import StoreLocatorDetail from './storeLocator/storeLocatorDetail';
// Register your plugin via the existing PluginManager
const PluginManager = window.PluginManager;
PluginManager.register('StoreLocator', StoreLocator, '[data-storeLocator]');
PluginManager.register('StoreLocatorDetail', StoreLocatorDetail, '[data-storeLocatorDetail]');