const proto = exports;
const obj2xml = require('../utils/obj2xml');

proto.putBucket = async function putBucket(name, options) {
  this._checkBucketName(name, true);
  options = options || {};
  const params = this._bucketRequestParams('PUT', name, '', options);

  const CreateBucketConfiguration = {};
  const paramlXMLObJ = {
    CreateBucketConfiguration
  };

  if (options.StorageClass) {
    CreateBucketConfiguration.StorageClass = options.StorageClass;
    params.mime = 'xml';
    params.content = obj2xml(paramlXMLObJ, { headers: true });
  }

  params.successStatuses = [200];
  const result = await this.request(params);
  return {
    bucket: (result.headers.location && result.headers.location.substring(1)) || null,
    res: result.res
  };
};
