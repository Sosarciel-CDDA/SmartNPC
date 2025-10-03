import { Eoc, EocEffect } from "@sosarciel-cdda/schema";

export const listCtor = <
    Id extends string,
    Prop extends readonly string[],
>(opt:{ id:Id; prop:Prop; })=>{
    const {prop,id} = opt;
    const length = `${id}_Length` as const;
    const eachIdx  = `${id}_EachIndex` as const;
    const isVaildPtr = `${id}_IsVaildPtr` as const;

    type FixedProp = [...Prop,"IsVaild"];
    const fixedProp = [...prop,"IsVaild"] as FixedProp;

    /**获取位于某位置的成员变量名 */
    const where = (numstr:string)=> fixedProp.reduce((acc,cur)=>
        ({...acc,[cur]:`${id}_${numstr}_${cur}`}),{}) as {
            [K in FixedProp[number]]:`${Id}_${number}_${K}`
        };

    /**生成一个遍历列表的eoc */
    const genEachEoc = (
        eid:string,effect:EocEffect[]
    )=>({
        type:"effect_on_condition",
        id:`${id}_Each_${eid}`,
        eoc_type:"ACTIVATION",
        effect:[
            {math:[eachIdx,'=','0']},
            {run_eocs:{
                id:`${id}_Each_${eid}_Until`,
                eoc_type:'ACTIVATION',
                effect:[
                    {math:[eachIdx,'+=','1']},
                    ...effect,
                ],
            }, iterations: {math:[length]}}
        ],
    }) satisfies Eoc;

    /**生成一个遍历列表有效部分的eoc */
    const genEachVaildEoc = (
        eid:string,effect:EocEffect[]
    )=>genEachEoc(eid,[
        {set_string_var:(where(`<global_val:${eachIdx}>`) as any).IsVaild,target_var:{context_val:isVaildPtr},parse_tags:true},
        {if:{math:[`v_${isVaildPtr}`,'==','1']},then:[...effect]}
    ]);

    const firstUnvaildDone = `${id}_firstUnvaild_Done` as const;
    /**生成一段在首个失效idx运行的eoc
     * 若均有效则会分配一个超length的idx, 然后使length自增
     */
    const genFirstUnvaildEoc = (eid:string,effect:EocEffect[])=>({
        type:"effect_on_condition",
        id:`${id}_FirstUnvaild_${eid}`,
        eoc_type:"ACTIVATION",
        effect:[
            {math:[eachIdx,'=','0']},
            {math:[firstUnvaildDone,'=','0']},
            {run_eocs:{
                id:`${id}_FirstUnvaild_${eid}_Until`,
                eoc_type:'ACTIVATION',
                effect:[
                    {math:[eachIdx,'+=','1']},
                    {set_string_var:(where(`<global_val:${eachIdx}>`) as any).IsVaild,target_var:{context_val:isVaildPtr},parse_tags:true},
                    {if:{math:[`v_${isVaildPtr}`,'!=','1']},then:[
                        ...effect,
                        {math:[firstUnvaildDone,'=','1']},
                    ]},
                    {if:{math:[eachIdx,'==',`${length}+1`]},then:[
                        {math:[length,'+=','1']}
                    ]},
                ],
            },
            iterations: {math:[`${length}+1`]},
            condition:{math:[firstUnvaildDone,'!=','1']}}
        ],
    }) satisfies Eoc;

    return {
        length,eachIdx,where,genEachEoc,genEachVaildEoc,genFirstUnvaildEoc
    };
}