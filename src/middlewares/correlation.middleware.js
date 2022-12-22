const request = require('request'),
    uuid = require('node-uuid'),
    rp = require('request-promise'),
    contextService = require('request-context'),
    token = require('../../token'),
    path = require('path');

const appDir = __dirname.substr(0, __dirname.indexOf('node_modules'));
const serviceInfo = require(path.resolve(appDir, './package.json'));

const correlationKey = 'request:correlationId';
const correlationIdHeaderName = 'x-correlation-id';
const serviceAuthHeaderName = 'x-service-auth-key';

const getCorrelationId = () => {
    return contextService.get(correlationKey);
};

const getServiceAuthKey = () => {
    return token.generateToken({
        serviceName: serviceInfo.name,
        version: serviceInfo.version
    });
};

module.exports = async (req, res, next) => {
    if (!req.headers[correlationIdHeaderName])
        req.headers[correlationIdHeaderName] = uuid();
    contextService.set(correlationKey, req.headers[correlationIdHeaderName]);

    next();
};

const wrapRequestLib = (request) => {
    const originalInitParams = request.initParams;
    function initParams (uri, options, callback) {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }
        if (!options)
            options = {};
        if (!options.headers)
            options.headers = {};
        options.headers[correlationIdHeaderName] = getCorrelationId();
        options.headers[serviceAuthHeaderName] = getServiceAuthKey();
        return originalInitParams(uri, options, callback);
    }

    function verbFunc (verb) {
        var method = verb.toUpperCase();
        return function (uri, options, callback) {
            var params = initParams(uri, options, callback);
            params.method = method;
            return request(params, params.callback);
        };
    }

    const OriginalRequest = request.Request;
    function overridenRequest (params) {
        if (!params)
            params = {};
        if (!params.headers)
            params.headers = {};
        params.headers[correlationIdHeaderName] = getCorrelationId();
        params.headers[serviceAuthHeaderName] = getServiceAuthKey();

        return new OriginalRequest(params);
    }

    request.Request = overridenRequest;
    request.initParams = initParams;
    request.verbFunc = verbFunc;
    request.get = verbFunc('get');
    request.head = verbFunc('head');
    request.options = verbFunc('options');
    request.post = verbFunc('post');
    request.put = verbFunc('put');
    request.patch = verbFunc('patch');
    request.del = verbFunc('delete');
    request['delete'] = verbFunc('delete');
};

wrapRequestLib(request);
wrapRequestLib(rp);