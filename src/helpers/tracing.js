const openTelemetry = require("@opentelemetry/sdk-node");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { ExpressInstrumentation } = require("@opentelemetry/instrumentation-express");
const { ZipkinExporter } = require("@opentelemetry/exporter-zipkin");
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { SequelizeInstrumentation } = require('opentelemetry-instrumentation-sequelize');

const sdk = new openTelemetry.NodeSDK({
    resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: 'slack-potluck',
        [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV,
    }),
    traceExporter: new ZipkinExporter({
        url: `${process.env.ZIPKIN_URL}/api/v2/spans`
    }),
    instrumentations: [HttpInstrumentation, ExpressInstrumentation, SequelizeInstrumentation]
});

module.exports = sdk;
