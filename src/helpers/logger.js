const winston = require("winston");

function getLoggerInstance(serviceName) {
  const localInstance = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: winston.format.json(),
    defaultMeta: { service: serviceName },
    transports: [
      //
      // - Write all logs with importance level of `error` or less to `error.log`
      // - Write all logs with importance level of `info` or less to `combined.log`
      //
      new winston.transports.File({ filename: "error.log", level: "error" }),
      new winston.transports.File({ filename: "combined.log" }),
      new winston.transports.Console({
        format: winston.format.simple(),
      }),
    ],
  });

  localInstance.getLevel = function () {
    return this.level;
  };
  return localInstance;
}

module.exports = {
  logger: global,
  getInstance: getLoggerInstance,
};
