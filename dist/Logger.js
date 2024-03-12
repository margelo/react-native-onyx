"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAlert = exports.logInfo = exports.registerLogger = void 0;
// eslint-disable-next-line @typescript-eslint/no-empty-function
let logger = () => { };
/**
 * Register the logging callback
 */
function registerLogger(callback) {
    logger = callback;
}
exports.registerLogger = registerLogger;
/**
 * Send an alert message to the logger
 */
function logAlert(message) {
    logger({ message: `[Onyx] ${message}`, level: 'alert' });
}
exports.logAlert = logAlert;
/**
 * Send an info message to the logger
 */
function logInfo(message) {
    logger({ message: `[Onyx] ${message}`, level: 'info' });
}
exports.logInfo = logInfo;
