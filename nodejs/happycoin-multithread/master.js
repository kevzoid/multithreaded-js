'use strict';
const os = require('os');
const {Worker, isMainThread} = require('worker_threads');
const _ = require('lodash');
const {with_duration} = require('../util.js');

const THREADS_COUNT = _.clamp(os.cpus().length, 1, 4);

let workers = [];
const main = async(iterations=10_000_000)=>{
    iterations /= THREADS_COUNT;
    let total = 0, tasks = [];
    for (let i=0; i<THREADS_COUNT; i++)
    {
        let worker = new Worker('./worker.js', {workerData: {iterations}});
        workers.push(worker);
        tasks.push(new Promise((resolve, reject)=>{
            worker.on('error', reject);
            worker.on('exit', resolve);
            worker.on('message', ({id, match})=>{
                process.stdout.write(`[${id}] ${match} `);
                total++;
            });
        }));
    }
    await Promise.all(tasks);
    process.stdout.write('\nTotal: '+total+'\n');
};

// avg duration for 10_000_000 iterations (4x/8x threads): 50s
// - almost 3x as fast as the single-threaded implementation
if (require.main==module && isMainThread)
{
    with_duration(main, process.env.ITERATIONS).catch(e=>{
        workers.forEach(w=>w.terminate());
        console.error(e);
        process.exit(1);
    });
}