const openTelemetry = require("@opentelemetry/sdk-node");

class Tracer {
    static _name = "slack-potluck";

    static get() {
        return openTelemetry.api.trace.getTracer(this._name);
    }

    /**
     * 
     * @param {openTelemetry.api.Span} span 
     * @param {Error} error 
     */
    static handleError(span, error) {
        span.setAttribute("app.error", true);
        span.setAttribute("app.error.stacktrace", error.stack);
        span.setAttribute("app.error.message", error.message);
        span.setAttribute("app.error.name", error.name);
        span.setStatus(openTelemetry.api.SpanStatusCode.ERROR);
    }

    /**
     * @callback withSpanCallback
     * @param {openTelemetry.api.Span} span
     * @returns {*}
     */
    
    /**
     * 
     * @param {string} name 
     * @param {withSpanCallback} callback function called in the context of the span and receives the newly created span as an argument
     * @returns 
     */
    static withSpan(name, callback) {
        const tracer = this.get();
        let span = tracer.startSpan(name, {}, openTelemetry.api.context.active());
        const context = openTelemetry.api.trace.setSpan(openTelemetry.api.context.active(), span);
        return openTelemetry.api.context.with(context, (sp2) => {
            try {
                return callback(sp2);
            } catch (e) {
                this.handleError(sp2, e);
                throw e;
            } finally {
                sp2.end();
            }
        }, undefined, span);
    }

    /**
     * 
     * @param {string} name 
     * @param {withSpanCallback} callback function called in the context of the span and receives the newly created span as an argument
     * @returns 
     */
    static withSpanAsync(name, callback) {
        const tracer = this.get();
        let span = tracer.startSpan(name, {}, openTelemetry.api.context.active());
        const context = openTelemetry.api.trace.setSpan(openTelemetry.api.context.active(), span);
        return openTelemetry.api.context.with(context, (sp2) => {
            return callback(sp2)
                .then((out) => {
                    return out;
                })
                .catch((e) => {
                    this.handleError(sp2, e);
                    throw e;
                })
                .finally(() => {
                    sp2.end();
                });
        }, undefined, span);
    }
}

module.exports = Tracer;