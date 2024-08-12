"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.put = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mime_1 = __importDefault(require("mime"));
const is_type_of_1 = __importDefault(require("is-type-of"));
const putStream_1 = require("./putStream");
const getFileSize_1 = require("../utils/getFileSize");
const objectName_1 = require("../../common/utils/objectName");
const convertMetaToHeaders_1 = require("../../common/utils/convertMetaToHeaders");
const objectUrl_1 = require("../../common/utils/objectUrl");
const encodeCallback_1 = require("../../common/utils/encodeCallback");
const isBuffer_1 = require("../../common/utils/isBuffer");
const crc64_1 = require("../../common/utils/crc64");
/**
 * put an object from String(file path)/Buffer/ReadableStream
 * @param {String} name the object key
 * @param {Mixed} file String(file path)/Buffer/ReadableStream
 * @param {Object} options
 *        {Object} options.callback The callback parameter is composed of a JSON string encoded in Base64
 *        {String} options.callback.url  the OSS sends a callback request to this URL
 *        {String} options.callback.host  The host header value for initiating callback requests
 *        {String} options.callback.body  The value of the request body when a callback is initiated
 *        {String} options.callback.contentType  The Content-Type of the callback requests initiatiated
 *        {Object} options.callback.customValue  Custom parameters are a map of key-values, e.g:
 *                  customValue = {
 *                    key1: 'value1',
 *                    key2: 'value2'
 *                  }
 * @return {Object}
 */
async function put(name, file, options = {}) {
    let content;
    name = objectName_1.objectName(name);
    if (isBuffer_1.isBuffer(file)) {
        content = file;
    }
    else if (is_type_of_1.default.string(file)) {
        const stats = fs_1.default.statSync(file);
        if (!stats.isFile()) {
            throw new Error(`${file} is not file`);
        }
        options.mime = options.mime || mime_1.default.getType(path_1.default.extname(file));
        const stream = fs_1.default.createReadStream(file);
        options.contentLength = await getFileSize_1.getFileSize(file);
        return await putStream_1.putStream.call(this, name, stream, options);
    }
    else if (is_type_of_1.default.readableStream(file)) {
        return await putStream_1.putStream.call(this, name, file, options);
    }
    else {
        throw new TypeError('Must provide String/Buffer/ReadableStream for put.');
    }
    options.headers = options.headers || {};
    convertMetaToHeaders_1.convertMetaToHeaders(options.meta, options.headers);
    const method = options.method || 'PUT';
    const params = this._objectRequestParams(method, name, options);
    encodeCallback_1.encodeCallback(params, options);
    params.mime = options.mime;
    params.content = content;
    params.successStatuses = [200];
    const result = await this.request(params);
    if (options === null || options === void 0 ? void 0 : options.crc64) {
        if (!crc64_1.checkCrc64(content, result.res.headers['x-oss-hash-crc64ecma'])) {
            throw new Error('crc64 check faild');
        }
    }
    const ret = {
        name,
        url: objectUrl_1.objectUrl(name, this.options),
        res: result.res
    };
    if (params.headers && params.headers['x-oss-callback']) {
        ret.data = JSON.parse(result.data.toString());
    }
    return ret;
}
exports.put = put;
