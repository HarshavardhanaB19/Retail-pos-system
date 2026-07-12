const EventEmitter = require('events');
const eventBus = new EventEmitter();

// Log every event for visibility (simulates future subscriber modules)
eventBus.on('order.created', (data) => console.log('[EVENT] order.created:', data));
eventBus.on('order.confirmed', (data) => console.log('[EVENT] order.confirmed:', data));
eventBus.on('stock.low', (data) => console.log('[EVENT] stock.low:', data));
eventBus.on('payment.recorded', (data) => console.log('[EVENT] payment.recorded:', data));
eventBus.on('discount.applied', (data) => console.log('[EVENT] discount.applied:', data));

module.exports = eventBus;