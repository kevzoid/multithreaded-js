'use strict';
const crypto = require('crypto');
const {with_duration} = require('../util.js');

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

const main = (iterations=10_000_000)=>{
    let total = 0;
    for (let i=0; i<iterations; i++)
    {
        let int;
        if (is_happy_coin(int = random64int()))
        {
            total++;
            process.stdout.write(int+' ');
        }
    }
    process.stdout.write('\nTotal: '+total+'\n');
};

// avg duration for 10_000_000 iterations: 145s (~2.5 min)
if (require.main==module)
    with_duration(main, process.env.ITERATIONS);