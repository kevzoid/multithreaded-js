'use strict';
const E = exports;

E.with_duration = async(fn, ...args)=>{
    let start = Date.now();
    try { return await fn(...args); }
    finally { console.log(`Finished in: ${Date.now()-start}ms`); }
};