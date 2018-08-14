import { EventEmitter } from 'events';


// TODO: Add a timeout option
export function eventWaiter(emitter: EventEmitter, name: string | symbol) {
   return new Promise((resolve, _reject) => {
      emitter.once(name, (...args: any[]) => {
         resolve(args);
      });
   });
}

export interface SubSystem {
   initialise(): void;
}
