const { env } = process;

const config = module.exports;
// const USWEST = 'oss-us-west-1'; // ONCI=true Using the region of Silicon Valley in the United States would be faster
// test
config.oss = {
  accessKeyId: env.ALI_SDK_OSS_ID,
  accessKeySecret: env.ALI_SDK_OSS_SECRET,
  accountId: env.ALI_SDK_STS_ROLE.match(/^acs:ram::(\d+):role/i)[1], // Obtain the main account ID through roleRan
  region: env.ALI_SDK_OSS_REGION,
  // endpoint: env.ONCI ? `https://${USWEST}.aliyuncs.com` : undefined,
  maxSocket: 50
};

config.sts = {
  accessKeyId: env.ALI_SDK_STS_ID,
  accessKeySecret: env.ALI_SDK_STS_SECRET,
  roleArn: env.ALI_SDK_STS_ROLE,
  bucket: env.ALI_SDK_STS_BUCKET,
  // endpoint: env.ONCI ? 'https://sts.aliyuncs.com/' : undefined,
  maxSocket: 50
  // callbackServer: env.ALI_SDK_CALLBACK_IP
};

config.metaSyncTime = env.ONCI ? '1s' : '1000ms';
config.timeout = '120s';
