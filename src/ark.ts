import { StatMultipliers, StatServerMultipliers } from '@/ark/multipliers';
import { Stat } from '@/ark/types';
import { DAMAGE, HEALTH, NUM_STATS, PRE_IB, PRE_TE, SPEED, TORPOR } from '@/consts';
import { Server } from '@/data/objects';
import theStore from '@/ui/store';
import merge from 'lodash/merge';
import * as Utils from './utils';


export function FormatAllOptions(stats: Stat[][]) {
   return stats.map(options => FormatOptions(options)).join('\n');
}

export function FormatOptions(options: Stat[]) {
   return options.map(option => FormatOption(option)).join(',') || '-';
}

export function FormatOption(option: Stat, noBrackets = false) {
   if (!option) return '-';
   const { Lw, Ld } = option;
   if (noBrackets)
      return `${Lw}+${Ld}`;
   return `(${Lw}+${Ld})`;
}

export function Precision(index: number) {
   // Displays Damage and Speed as 153.5(%)
   if (index === DAMAGE || index === SPEED)
      return 3;
   // Displays TE as 98.34(%)
   if (index === PRE_TE)
      return 2;
   // Displays IB as 38.8810(%)
   if (index === PRE_IB)
      return 4;
   // Displays other stats as 18362.4
   return 1;
}

/**
 * Will convert decimal values to a percentage and round to the correct Display precision
 * @param {number} value The value that is to be rounded
 * @param {number} index Number corresponding with the index of a stat
 * @returns {number} The rounded, converted value
 */
export function DisplayValue(value: number, index: number): number {
   let returnValue = value;

   if (index === DAMAGE || index === SPEED || index === PRE_TE || index === PRE_IB)
      returnValue *= 100;

   // We want to convert it to Display in ASBM
   returnValue = Utils.RoundTo(returnValue, Precision(index));

   return returnValue;
}

// Converts a value (from the UI) to a working value for ASBM
export function ConvertValue(value: number, index: number) {
   let returnValue = value;

   if (index === DAMAGE || index === SPEED || index === PRE_TE || index === PRE_IB)
      returnValue /= 100;

   // We want to convert it to Use in ASBM
   returnValue = Utils.RoundTo(returnValue, Precision(index));

   return returnValue;
}

/** Gather combined multipliers for the given server and species */
export function GetMultipliers(server: Server, speciesName: string): StatMultipliers[] {

   // Gather raw multipliers first from the official server, overriding with settings from the given server
   const values = merge([], theStore.officialServer.multipliers, server.multipliers);

   // Apply single-player multipliers
   if (server.singlePlayer) {
      for (let stat = HEALTH; stat <= TORPOR; stat++) {
         for (const param in theStore.officialServerSP.multipliers[stat]) {
            values[stat][param] *= theStore.officialServerSP.multipliers[stat][param] || 1;
         }
      }
   }

   // Convert to objects
   const speciesValues = theStore.speciesMultipliers[speciesName];
   const multipliers: StatMultipliers[] = values.map((v, i) => ({ ...new StatServerMultipliers(v[0], v[1], v[2], v[3]), ...speciesValues[i] }));

   // Set IBM for each stat
   for (let stat = 0; stat < NUM_STATS; stat++)
      multipliers[stat].IBM = multipliers[stat].noImprint ? 0 : server.IBM;

   return multipliers;
}
