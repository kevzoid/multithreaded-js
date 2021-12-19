'use strict';
const {parentPort, threadId, workerData} = require('worker_threads');
const crypto = require('crypto');

const random64int = ()=>{
    let ta = new BigUint64Array(1);
    crypto.randomFillSync(ta);
    return ta[0];
};

// Perfect digital invariant
// https://en.wikipedia.org/wiki/Perfect_digital_invariant
const pdi = (int, base=10n)=>{
    let total = 0n;
    while (int>0)
    {
        total += (int%base)**2n;
        int /= base;
    }
    return total;
};

// https://en.wikipedia.org/wiki/Happy_number
const is_happy_number = int=>{
    let seen = new Set();
    while (int>1 && !seen.has(int))
    {
        seen.add(int);
        int = pdi(int);
    }
    return int==1;
};

// intentionally checking divisibility last, so that the output is less verbose
// and the expensive computation is always being called
const is_happy_coin = int=>is_happy_number(int) && int%10_000n==0;

let found = 0;
for (let i=0; i<workerData.iterations; i++)
{
    let int;
    if (is_happy_coin(int = random64int()))
    {
        parentPort.postMessage({id: threadId, match: int});
        found++;
    }
}
