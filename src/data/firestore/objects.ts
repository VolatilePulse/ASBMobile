import { CreatureStatus, LibraryId, ServerId, Stat, UserId } from '@/data/firestore/types';


export interface User {
   libraries: LibraryId[];
}

export interface Library {
   name: string;
   owner: UserId;
   admins: UserId[];
   members: UserId[];
   pending: UserId[];
}

export interface Server {
   name: string;
   IBM: number;
   multipliers: Array<Array<number | null | undefined>>;
   singlePlayer: boolean;
}

export interface Creature {
   name: string;

   uuid?: string;
   dinoId1?: number;
   dinoId2?: number;

   tribe: string;
   owner: string;

   originServer: ServerId;
   currentServer: ServerId;

   species: string;

   isWild: boolean;
   isTamed: boolean;
   isBred: boolean;

   TE?: number;
   wildLevel?: number;
   IB: number;

   level: number;
   stats: Stat[];

   status: CreatureStatus;
}
