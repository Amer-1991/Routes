const EventEmitter = require('events');
class GlobalEventEmitter extends EventEmitter {}
const globalEventEmitter = new GlobalEventEmitter();

module.exports = { globalEventEmitter };