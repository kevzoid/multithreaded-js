'use strict';
importScripts('https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js');

const {assign} = Object;
const sleep = ms=>new Promise(resolve=>setTimeout(resolve, ms));
const mk_error = (msg, code, ctor=Error)=>assign(new ctor(msg), {code});
const qw = ([str])=>str.split(/\s+/);
const rm_undefined = obj=>_.omitBy(obj, _.isUndefined);

let commands = new Proxy(assign(Object.create(null), {
    fib(limit){
        let prev = 1n, next = 0n, swap;
        while (limit--)
            swap = prev; prev += next; next = swap;
        return ''+next;
    },
    sqrt(max){ return _.sum([...Array(max).keys()].map(Math.sqrt)); },
    bad(){ throw mk_error('Intentional error!', 'intentional'); },
}), {
    // - artifically apply 1s async sleep to all methods, to simulate real load
    // - validate existence of the RPC method on the target object
    get(target, prop, receiver){
        return async(...args)=>{
            if (!Reflect.has(target, prop))
                throw mk_error(`Method "${prop}" is not defined`);
            await sleep(1_000);
            return Reflect.apply(target[prop], receiver, args);
        };
    },
});

const wrap_result = async(id, handler)=>{
    let result, error;
    try { result = await handler(); }
    catch(e){ error = e.message; }
    return rm_undefined({id, result, error});
};

const onmessage_handler = fn=>async msg=>{
    let handler = ()=>fn(_.pick(msg.data, qw`id fn args`));
    self.postMessage(await wrap_result(msg.data.id, handler));
};

self.onmessage = onmessage_handler(({fn, args})=>commands[fn](...args));
