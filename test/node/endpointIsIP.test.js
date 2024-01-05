const dns = require('dns');
const assert = require('assert');
const utils = require('./utils');
const oss = require('../../lib/client');
const config = require('../config').oss;

async function getIP(hostname) {
  return new Promise((resolve, reject) => {
    dns.lookup(hostname, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

describe('test/endpoint.test.js', () => {
  const { prefix } = utils;
  let store;
  let bucket;
  [
    {
      authorizationV4: false
    },
    {
      authorizationV4: true
    }
  ].forEach((moreConfigs, index) => {
    describe(`test endpoint in iterate ${index}`, () => {
      before(async () => {
        store = oss({ ...config, ...moreConfigs });
        bucket = `ali-oss-test-object-bucket-${prefix.replace(/[/.]/g, '-')}${index}`;

        await store.putBucket(bucket);
        const endpoint = await getIP(`${bucket}.${store.options.endpoint.hostname}`);
        const testEndpointConfig = Object.assign({}, config, moreConfigs, {
          cname: true,
          endpoint
        });
        store = oss(testEndpointConfig);
        store.useBucket(bucket);
      });

      after(async () => {
        await utils.cleanBucket(store, bucket);
      });

      describe('endpoint is ip', () => {
        it('should put and get', async () => {
          try {
            const name = `${prefix}ali-sdk/oss/putWidhIP.js`;
            const object = await store.put(name, __filename);
            assert(object.name, name);

            const result = await store.get(name);
            assert(result.res.status, 200);
          } catch (error) {
            assert(false, error.message);
          }
        });
      });
    });
  });
});
