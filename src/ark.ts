import { DAMAGE, SPEED, PRE_IB, PRE_TE, NUM_STATS } from './consts';
import * as Utils from './utils';
import * as Servers from './servers';
import { Server } from './ark/multipliers';
import theStore from '@/ui/store';
import { Stat } from '@/ark/creature';
import { CombinedMultipliers } from '@/ark/types';


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
export function DisplayValue(value: number, index: number) {
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

/**
 * Generate a multipliers object for the Extractor
 */
export function GetMultipliers(serverName: string, speciesName: string): CombinedMultipliers {
   const server = Servers.getServerByName(serverName);

   // The Server object tells us everything we need to know about the multipliers
   const multipliers = Utils.DeepMergeSoft(new Server(), theStore.officialServer, server);

   // Single Player multiplies the official/override multipliers
   if (server.singlePlayer) {
      for (const stat in theStore.officialSPMultiplier) {
         for (const multiplier in theStore.officialSPMultiplier[stat]) {
            multipliers[stat][multiplier] = multipliers[stat][multiplier] * (theStore.officialSPMultiplier[stat][multiplier] || 1);
         }
      }
   }

   // Copy in species-related data
   Utils.DeepMerge(multipliers, theStore.speciesMultipliers[speciesName]);

   // Set IBM for each stat
   for (let stat = 0; stat < NUM_STATS; stat++) {
      if (multipliers[stat].noImprint)
         multipliers[stat].IBM = 0;
      else
         multipliers[stat].IBM = server.IBM;
   }

   return multipliers;
}
