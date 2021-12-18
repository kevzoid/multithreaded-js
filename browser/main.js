'use strict';

class Rpc_worker {
    #worker;
    constructor(file){
        this._vfd = 0;
        this.in_flight = new Map();
        this.#worker = new Worker(file);
        this.#worker.onmessage = this.onmessage.bind(this);
    }
    // XXX: add batching
    exec([fn, ...args]){
        let id = this._vfd++;
        let promise = new Promise((resolve, reject)=>{
            this.in_flight.set(id, {resolve, reject});
            this.#worker.postMessage({fn, args, id});
        });
        promise.finally(()=>this.in_flight.delete(id));
        return promise;
    }
    onmessage({data: msg}){
        let ctx;
        if (!(ctx = this.in_flight.get(msg.id)))
            throw new Error(`ID ${msg.id} was not found!`);
        if (msg.error)
            return void ctx.reject(msg.error);
        ctx.resolve(msg.result);
    }
}

const main = async()=>{
    let worker = new Rpc_worker('./worker.js');
    let methods = [
        ['fib', 1_000],
        ['sqrt', 1_000_000],
        ['bad'],
        ['fake'],
    ];
    let results = await Promise.allSettled(methods.map(worker.exec, worker));
    results.forEach((result, i)=>{
        let [method, ...args] = methods[i];
        console.log(method+`(${args.length ? args.join(', ') : ''})`, result);
    });
};

main().catch(console.error);