import { CreatureDataSource, CreatureStatus, Multipliers, ServerId, UserId } from '@/data/firestore/types';
import firebase from 'firebase/app';


export interface User {
   photoURL?: string;
   displayName?: string;
   color?: string;
   libraries?: { [library_id: string]: true };
}

export interface Library {
   name: string;
   owner: UserId;
   public: boolean;
   admins: { [user_id: string]: true };
   members: { [user_id: string]: true };
   pending: { [user_id: string]: true };
}

export interface Server {
   name: string;
   IBM: number;
   multipliers: Multipliers;
   singlePlayer: boolean;
}

export interface Creature {
   dinoId1?: number;
   dinoId2?: number;

   species: string;
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

   levelsWild: { [stat_index: number]: number };
   levelsDom: { [stat_index: number]: number };
   tamingEff: number;
   imprintingBonus: number;

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

   inputSource: CreatureDataSource;

   // Cached values
   level?: number;
   breedingLevel?: number;
   wildLevel?: number;
   statValues?: { [stat_index: number]: number };
   breedingValues?: { [stat_index: number]: number };
}
