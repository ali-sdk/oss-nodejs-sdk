import { isBlob } from '../../common/utils/isBlob';
import { isFile } from '../../common/utils/isFile';
import { isBuffer } from '../../common/utils/isBuffer';

const getBuffer = file => {
  // Some browsers do not support Blob.prototype.arrayBuffer, such as IE
  if (file.arrayBuffer) return file.arrayBuffer();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result);
    };
    reader.onerror = (e) => {
      reject(e);
    };
    reader.readAsArrayBuffer(file);
  });
};

export async function _createStream(file: any, start: number, end: number): Promise<Buffer> {
  if (isBlob(file) || isFile(file)) {
    const _file = file.slice(start, end);
    const fileContent = await getBuffer(_file);
    return Buffer.from(fileContent);
  } else if (isBuffer(file)) {
    return file.subarray(start, end);
  } else {
    throw new Error('_createStream requires File/Blob/Buffer.');
  }
}
