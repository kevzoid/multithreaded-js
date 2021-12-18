'use strict';
const E = exports;

E.with_duration = (fn, ...args)=>{
    let start = Date.now();
    fn(...args);
    console.log(`Finished in: ${Date.now()-start}ms`);
};