import { Stat } from '@/ark/types';
import { DatabaseObject } from '@/data/database';
import { FilledArray } from '@/utils';


export class Server extends DatabaseObject {
   name: string;

   constructor(public multipliers: Array<Array<number | null | undefined>>, public IBM: number = 1, public singlePlayer: boolean = false, id?: string) {
      super(id);
   }
}


export class Creature extends DatabaseObject {
   // null is used here to ensure the fields are Observable, but still clearly not set
   name?: string = null;
   tribe?: string = null;
   owner?: string = null;
   serverId?: string = null;
   species?: string = null;
   uuid?: string = null;
   wild = true;
   tamed = false;
   bred = false;
   TE = 0;
   IB = 0;
   level: number = 0;
   stats: Stat[][] = FilledArray(8, () => []);
   values: number[] = FilledArray(8, () => undefined);

   constructor() {
      super();
   }
}
