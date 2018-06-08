import { CreatureStatus, InputSource, LibraryId, ServerId, UserId } from '@/data/firestore/types';
import firebase from 'firebase/app';


export interface User {
   libraries: LibraryId[];
}

export interface Library {
   name: string;
   owner: UserId;
   admins: { [user: string]: true };
   members: { [user: string]: true };
   pending: { [user: string]: true };
}

export interface Server {
   name: string;
   IBM: number;
   multipliers: Array<Array<number | null | undefined>>;
   singlePlayer: boolean;
}

export interface Creature {
   dinoId1?: number;
   dinoId2?: number;

   speciesName: string;
   speciesBP: string;

   status: CreatureStatus;

   name: string;

   tribe: string;
   owner: string;
   imprinter?: string;

   originServer?: ServerId;
   currentServer: ServerId;

   isWild?: boolean;
   isTamed?: boolean;
   isBred?: boolean;

   isFemale: boolean;
   isNeutered?: boolean;

   level: number;
   levelsWild: number[];
   levelsDom: number[];
   statValues: number[];
   breedingValues: number[];
   TE: number;
   WL: number;
   IB: number;

   mutations: number;
   mutationsMaternal: number;
   mutationsPaternal: number;

   tags: { [name: string]: true };

   times: {
      growingUntil?: firebase.firestore.Timestamp;
      cooldownUntil?: firebase.firestore.Timestamp;
      addedToLibrary?: firebase.firestore.Timestamp;
      domesticated?: firebase.firestore.Timestamp;
   };

   inputSource: InputSource;
}
