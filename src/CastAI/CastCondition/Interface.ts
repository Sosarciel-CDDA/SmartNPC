import { Spell } from '@sosarciel-cdda/schema';
import {JObject} from '@zwa73/utils';
import { CastAIData, CastCond } from '../Interface';



/**快捷定义的施法条件 */
export type DefineCastCond<ID extends string,DATA extends JObject={}> =
    {} extends DATA
    ? ID
    : {
        /**施法条件定义类别 */
        type:ID;
    }&DATA;

/**快捷定义的施法函数 */
export type DefineCastCondFunc<T extends DefineCastCond<any,any>> =
    (data:T,spell:Spell)=>CastAIData;