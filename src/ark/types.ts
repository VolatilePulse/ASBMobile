import { StatMultiplier, ServerMultiplier } from '@/ark/multipliers';


interface StatLike {
   Lw: number;
   Ld: number;
}

/** Server multiplier overrides */
export type MultipliersArray = Array<Array<number | undefined> | undefined>;

/** Multipliers from server and species together */
export type CombinedMultipliers = StatMultiplier[] & ServerMultiplier[];

export interface ServerDef {
   serverName: string;
   IBM: number;
   singlePlayer: boolean;
   multipliers: MultipliersArray;
}

export interface TestData {
   tag: string;
   species: string;
   level: number;
   imprint: number;
   mode: 'Wild' | 'Tamed' | 'Bred';
   values: number[];
   serverName: string;
   results: StatLike[][];
}
