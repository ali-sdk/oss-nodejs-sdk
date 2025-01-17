const assert = require('assert');
const { isArray } = require('./common/utils/isArray');
const { checkBucketName: _checkBucketName } = require('../lib/common/utils/checkBucketName');
const { formatTag } = require('../lib/common/utils/formatTag');

const proto = exports;

function toArray(obj) {
  if (!obj) return [];
  if (isArray(obj)) return obj;
  return [obj];
}

/**
 * Bucket opertaions
 */

proto.listBuckets = async function listBuckets(query = {}, options = {}) {
  // prefix, marker, max-keys

  const { subres = {} } = query;
  const rest = {};
  for (const key in query) {
    if (key !== 'subres') {
      rest[key] = query[key];
    }
  }
  const params = this._bucketRequestParams('GET', '', Object.assign(subres, options.subres), options);

  params.query = rest;

  const result = await this.request(params);

  if (result.status === 200) {
    const data = await this.parseXML(result.data);
    let buckets = data.Buckets || null;
    if (buckets) {
      if (buckets.Bucket) {
        buckets = buckets.Bucket;
      }
      if (!isArray(buckets)) {
        buckets = [buckets];
      }
      buckets = buckets.map(item => ({
        name: item.Name,
        region: item.Location,
        creationDate: item.CreationDate,
        storageClass: item.StorageClass,
        StorageClass: item.StorageClass,
        tag: formatTag(item)
      }));
    }
    return {
      buckets,
      owner: {
        id: data.Owner.ID,
        displayName: data.Owner.DisplayName
      },
      isTruncated: data.IsTruncated === 'true',
      nextMarker: data.NextMarker || null,
      res: result.res
    };
  }

  throw await this.requestError(result);
};

proto.useBucket = function useBucket(name) {
  _checkBucketName(name);
  return this.setBucket(name);
};

proto.setBucket = function useBucket(name) {
  _checkBucketName(name);
  this.options.bucket = name;
  return this;
};

proto.getBucket = function getBucket() {
  return this.options.bucket;
};

proto.getBucketLocation = async function getBucketLocation(name, options) {
  _checkBucketName(name);
  name = name || this.getBucket();
  const params = this._bucketRequestParams('GET', name, 'location', options);
  params.successStatuses = [200];
  params.xmlResponse = true;
  const result = await this.request(params);
  return {
    location: result.data,
    res: result.res
  };
};

proto.getBucketInfo = async function getBucketInfo(name, options) {
  _checkBucketName(name);
  name = name || this.getBucket();
  const params = this._bucketRequestParams('GET', name, 'bucketInfo', options);
  params.successStatuses = [200];
  params.xmlResponse = true;
  const result = await this.request(params);
  return {
    bucket: result.data.Bucket,
    res: result.res
  };
};

proto.deleteBucket = async function deleteBucket(name, options) {
  _checkBucketName(name);
  const params = this._bucketRequestParams('DELETE', name, '', options);
  const result = await this.request(params);
  if (result.status === 200 || result.status === 204) {
    return {
      res: result.res
    };
  }
  throw await this.requestError(result);
};

// acl

proto.putBucketACL = async function putBucketACL(name, acl, options) {
  _checkBucketName(name);
  const params = this._bucketRequestParams('PUT', name, 'acl', options);
  params.headers = {
    'x-oss-acl': acl
  };
  params.successStatuses = [200];
  const result = await this.request(params);
  return {
    bucket: (result.headers.location && result.headers.location.substring(1)) || null,
    res: result.res
  };
};

proto.getBucketACL = async function getBucketACL(name, options) {
  _checkBucketName(name);
  const params = this._bucketRequestParams('GET', name, 'acl', options);
  params.successStatuses = [200];
  params.xmlResponse = true;
  const result = await this.request(params);
  return {
    acl: result.data.AccessControlList.Grant,
    owner: {
      id: result.data.Owner.ID,
      displayName: result.data.Owner.DisplayName
    },
    res: result.res
  };
};

// logging

proto.putBucketLogging = async function putBucketLogging(name, prefix, options) {
  _checkBucketName(name);
  const params = this._bucketRequestParams('PUT', name, 'logging', options);
  let xml = `${'<?xml version="1.0" encoding="UTF-8"?>\n<BucketLoggingStatus>\n<LoggingEnabled>\n<TargetBucket>'}${name}</TargetBucket>\n`;
  if (prefix) {
    xml += `<TargetPrefix>${prefix}</TargetPrefix>\n`;
  }
  xml += '</LoggingEnabled>\n</BucketLoggingStatus>';
  params.content = xml;
  params.mime = 'xml';
  params.successStatuses = [200];
  const result = await this.request(params);
  return {
    res: result.res
  };
};

proto.getBucketLogging = async function getBucketLogging(name, options) {
  _checkBucketName(name);
  const params = this._bucketRequestParams('GET', name, 'logging', options);
  params.successStatuses = [200];
  params.xmlResponse = true;
  const result = await this.request(params);
  const enable = result.data.LoggingEnabled;
  return {
    enable: !!enable,
    prefix: (enable && enable.TargetPrefix) || null,
    res: result.res
  };
};

proto.deleteBucketLogging = async function deleteBucketLogging(name, options) {
  _checkBucketName(name);
  const params = this._bucketRequestParams('DELETE', name, 'logging', options);
  params.successStatuses = [204, 200];
  const result = await this.request(params);
  return {
    res: result.res
  };
};

proto.putBucketCORS = async function putBucketCORS(name, rulesOrConfiguration, options) {
  _checkBucketName(name);

  let rules = [];
  let responseVary;

  if (isArray(rulesOrConfiguration)) {
    rules = rulesOrConfiguration || [];
  } else {
    rules = rulesOrConfiguration.rules || [];
    responseVary = rulesOrConfiguration.responseVary;
  }

  assert(rules.length, 'rules is required');
  rules.forEach(rule => {
    assert(rule.allowedOrigin, 'allowedOrigin is required');
    assert(rule.allowedMethod, 'allowedMethod is required');
  });

  const params = this._bucketRequestParams('PUT', name, 'cors', options);
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<CORSConfiguration>';
  const parseOrigin = val => {
    xml += `<AllowedOrigin>${val}</AllowedOrigin>`;
  };
  const parseMethod = val => {
    xml += `<AllowedMethod>${val}</AllowedMethod>`;
  };
  const parseHeader = val => {
    xml += `<AllowedHeader>${val}</AllowedHeader>`;
  };
  const parseExposeHeader = val => {
    xml += `<ExposeHeader>${val}</ExposeHeader>`;
  };
  for (let i = 0, l = rules.length; i < l; i++) {
    const rule = rules[i];
    xml += '<CORSRule>';

    toArray(rule.allowedOrigin).forEach(parseOrigin);
    toArray(rule.allowedMethod).forEach(parseMethod);
    toArray(rule.allowedHeader).forEach(parseHeader);
    toArray(rule.exposeHeader).forEach(parseExposeHeader);
    if (rule.maxAgeSeconds) {
      xml += `<MaxAgeSeconds>${rule.maxAgeSeconds}</MaxAgeSeconds>`;
    }
    xml += '</CORSRule>';
  }

  if (typeof responseVary === 'boolean') {
    xml += `<ResponseVary>${responseVary.toString()}</ResponseVary>`;
  }

  xml += '</CORSConfiguration>';
  params.content = xml;
  params.mime = 'xml';
  params.successStatuses = [200];
  const result = await this.request(params);
  return {
    res: result.res
  };
};

proto.getBucketCORS = async function getBucketCORS(name, options) {
  _checkBucketName(name);
  const params = this._bucketRequestParams('GET', name, 'cors', options);
  params.successStatuses = [200];
  params.xmlResponse = true;
  const result = await this.request(params);
  const rules = [];
  if (result.data && result.data.CORSRule) {
    let { CORSRule } = result.data;
    if (!isArray(CORSRule)) CORSRule = [CORSRule];
    CORSRule.forEach(rule => {
      const r = {};
      Object.keys(rule).forEach(key => {
        r[key.slice(0, 1).toLowerCase() + key.slice(1, key.length)] = rule[key];
      });
      rules.push(r);
    });
  }
  return {
    rules,
    res: result.res
  };
};

proto.deleteBucketCORS = async function deleteBucketCORS(name, options) {
  _checkBucketName(name);
  const params = this._bucketRequestParams('DELETE', name, 'cors', options);
  params.successStatuses = [204];
  const result = await this.request(params);
  return {
    res: result.res
  };
};

// referer

proto.putBucketReferer = async function putBucketReferer(name, allowEmpty, referers, options) {
  _checkBucketName(name);
  const params = this._bucketRequestParams('PUT', name, 'referer', options);
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<RefererConfiguration>\n';
  xml += `  <AllowEmptyReferer>${allowEmpty ? 'true' : 'false'}</AllowEmptyReferer>\n`;
  if (referers && referers.length > 0) {
    xml += '  <RefererList>\n';
    for (let i = 0; i < referers.length; i++) {
      xml += `    <Referer>${referers[i]}</Referer>\n`;
    }
    xml += '  </RefererList>\n';
  } else {
    xml += '  <RefererList />\n';
  }
  xml += '</RefererConfiguration>';
  params.content = xml;
  params.mime = 'xml';
  params.successStatuses = [200];
  const result = await this.request(params);
  return {
    res: result.res
  };
};

proto.getBucketReferer = async function getBucketReferer(name, options) {
  _checkBucketName(name);
  const params = this._bucketRequestParams('GET', name, 'referer', options);
  params.successStatuses = [200];
  params.xmlResponse = true;
  const result = await this.request(params);
  let referers = result.data.RefererList.Referer || null;
  if (referers) {
    if (!isArray(referers)) {
      referers = [referers];
    }
  }
  return {
    allowEmpty: result.data.AllowEmptyReferer === 'true',
    referers,
    res: result.res
  };
};

proto.deleteBucketReferer = async function deleteBucketReferer(name, options) {
  _checkBucketName(name);
  return await this.putBucketReferer(name, true, null, options);
};

// private apis

proto._bucketRequestParams = function _bucketRequestParams(method, bucket, subres, options) {
  return {
    method,
    bucket,
    subres,
    headers: options && options.headers,
    additionalHeaders: options && options.additionalHeaders,
    timeout: options && options.timeout,
    ctx: options && options.ctx
  };
};
