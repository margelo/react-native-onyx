type LogData = {
    message: string;
    level: 'alert' | 'info';
};
type LoggerCallback = (data: LogData) => void;
/**
 * Register the logging callback
 */
declare function registerLogger(callback: LoggerCallback): void;
/**
 * Send an alert message to the logger
 */
declare function logAlert(message: string): void;
/**
 * Send an info message to the logger
 */
declare function logInfo(message: string): void;
export { registerLogger, logInfo, logAlert };
