import ms from 'humanize-ms';
import urlutil from 'url';
import { checkBucketName } from '../utils/checkBucketName';
import { checkValidEndpoint, checkValidRegion } from '../utils/checkValid';

function setEndpoint(endpoint, secure) {
  checkValidEndpoint(endpoint);
  let url = urlutil.parse(endpoint);

  if (!url.protocol) {
    url = urlutil.parse(`http${secure ? 's' : ''}://${endpoint}`);
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Endpoint protocol must be http or https.');
  }

  return url;
}

export function setRegion(region, internal, secure) {
  checkValidRegion(region);
  const protocol = secure ? 'https://' : 'http://';
  let suffix = internal ? '-internal.aliyuncs.com' : '.aliyuncs.com';
  const prefix = 'vpc100-oss-cn-';
  // aliyun VPC region: https://help.aliyun.com/knowledge_detail/38740.html
  if (region.substr(0, prefix.length) === prefix) {
    suffix = '.aliyuncs.com';
  }

  return urlutil.parse(protocol + region + suffix);
}

// check local web protocol,if https secure default set true , if http secure default set false
function isHttpsWebProtocol() {
  let secure = false;
  try {
    secure = location && location.protocol === 'https:';
  // eslint-disable-next-line no-empty
  } catch (error) {}
  return secure;
}

export function initOptions(options) {
  if (!options || !options.accessKeyId || !options.accessKeySecret) {
    throw new Error('require accessKeyId, accessKeySecret');
  }

  if (options.stsToken && !options.refreshSTSToken && !options.refreshSTSTokenInterval) {
    console.warn(
      "It's recommended to set 'refreshSTSToken' and 'refreshSTSTokenInterval' to refresh stsToken、accessKeyId、accessKeySecret automatically when sts info expires"
    );
  }

  if (options.bucket) {
    checkBucketName(options.bucket);
  }
  const opts = Object.assign(
    {
      region: 'oss-cn-hangzhou',
      internal: false,
      secure: isHttpsWebProtocol(),
      timeout: 60000,
      bucket: null,
      endpoint: null,
      cname: false,
      isRequestPay: false,
      sldEnable: false,
      useFetch: false,
      headerEncoding: 'utf-8',
      amendTimeSkewed: 0, // record the time difference between client and server
      refreshSTSTokenInterval: 60000 * 5,
      refreshSTSToken: null, // auto set sts config
      enableProxy: false,
      proxy: null,
    },
    options
  );

  opts.accessKeyId = opts.accessKeyId.trim();
  opts.accessKeySecret = opts.accessKeySecret.trim();

  if (opts.timeout) {
    opts.timeout = ms(opts.timeout);
  }

  if (opts.endpoint) {
    opts.endpoint = setEndpoint(opts.endpoint, opts.secure);
  } else if (opts.region) {
    opts.endpoint = setRegion(opts.region, opts.internal, opts.secure);
  } else {
    throw new Error('require options.endpoint or options.region');
  }

  opts.inited = true;
  return opts;
}
