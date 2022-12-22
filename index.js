const got = require("got");
const correlationMiddleware = require('./src/middlewares/correlation.middleware');

module.exports = {
    correlationMiddleware: correlationMiddleware,
    gotHttpClient: got.extend({
        hooks: {
            beforeRequest: [
                options => {
                    options.decompress = true;
                    options.resolveBodyOnly = true;
                    options.responseType = 'json';
                    // Todo:
                    //options.headers[correlationIdHeaderName] = correlationMiddleware.getCorrelationId();
                    //options.headers[serviceAuthHeaderName] = getServiceAuthKey();
                }
            ]
        }
    })
}