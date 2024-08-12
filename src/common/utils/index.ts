import { _getObjectMeta } from './_getObjectMeta';
import { authorization } from './authorization';
import { checkBrowserAndVersion } from './checkBrowserAndVersion';
import { checkBucketName } from './checkBucketName';
import { checkBucketTag } from './checkBucketTag';
import { checkObjectTag } from './checkObjectTag';
import { checkValid } from './checkValid';
import { convertMetaToHeaders } from './convertMetaToHeaders';
import { deepCopy } from './deepCopy';
import { deleteFileSafe } from './deleteFileSafe';
import { divideParts } from './divideParts';
import { encodeCallback } from './encodeCallback';
import { escapeName } from './escapeName';
import { formatObjKey } from './formatObjKey';
import { formatQuery } from './formatQuery';
import { formatTag } from './formatTag';
import { getPartSize } from './getPartSize';
import { getReqUrl } from './getReqUrl';
import { getResource } from './getResource';
import { getSourceName } from './getSourceName';
import { getStrBytesCount } from './getStrBytesCount';
import { isArray } from './isArray';
import { isBlob } from './isBlob';
import { isFile } from './isFile';
import { isIP } from './isIP';
import { isObject } from './isObject';
import { mergeDefault } from './mergeDefault';
import { obj2xml } from './obj2xml';
import { objectName } from './objectName';
import { objectUrl } from './objectUrl';
import { parseXML } from './parseXML';
import { policy2Str } from './policy2Str';
import signUtils from './signUtils';
import { WebFileReadStream } from './webFileReadStream';
import { checkCrc64, checkCrc64File } from './crc64';

export default {
  _getObjectMeta,
  authorization,
  checkBrowserAndVersion,
  checkBucketName,
  checkBucketTag,
  checkObjectTag,
  checkValid,
  convertMetaToHeaders,
  deepCopy,
  deleteFileSafe,
  divideParts,
  encodeCallback,
  escapeName,
  formatObjKey,
  formatQuery,
  formatTag,
  getPartSize,
  getReqUrl,
  getResource,
  getSourceName,
  getStrBytesCount,
  isArray,
  isBlob,
  isFile,
  isIP,
  isObject,
  mergeDefault,
  obj2xml,
  objectName,
  _objectName: objectName,
  objectUrl,
  _objectUrl: objectUrl,
  parseXML,
  policy2Str,
  signUtils,
  WebFileReadStream,
  checkCrc64,
  checkCrc64File
};
