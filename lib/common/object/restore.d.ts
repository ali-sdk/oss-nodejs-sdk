import { MultiVersionCommonOptions } from '../../types/params';
/**
 * Restore Object
 * @param {String} name the object key
 * @param {Object} options {type : Archive or ColdArchive}
 * @returns {{res}}
 */
export declare function restore(this: any, name: string, options: MultiVersionCommonOptions): Promise<{
    res: any;
}>;
