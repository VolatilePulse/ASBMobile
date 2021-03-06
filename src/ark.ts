import { StatMultipliers } from '@/ark/multipliers';
import { DAMAGE, HEALTH, PRE_IB, PRE_TE, SERVER_IDM, SERVER_IWM, SERVER_TAM, SERVER_TMM, SPEED, TORPOR } from '@/consts';
import { Server } from '@/data/firestore/objects';
import { CreatureDataSource } from '@/data/firestore/types';
import { floatRange, intervalFromDecimal } from '@/number_utils';
import theStore from '@/ui/store';
import IA from 'interval-arithmetic';
import _ from 'lodash';
import * as Utils from './utils';

/** @fileOverview Ark-related utility functions */


// export function FormatAllOptions(stats: Stat[][]) {
//    return stats.map(options => FormatOptions(options)).join('\n');
// }

// export function FormatOptions(options: Stat[]) {
//    return options.map(option => FormatOption(option)).join(',') || '-';
// }

// export function FormatOption(option: Stat, noBrackets = false) {
//    if (!option) return '-';
//    const { Lw, Ld } = option;
//    if (noBrackets)
//       return `${Lw}+${Ld}`;
//    return `(${Lw}+${Ld})`;
// }

/** Return the normal precision for the specified stat when displayed */
export function displayPrecision(index: number) {
   // Displays Damage and Speed as 153.5(%)
   if (index === DAMAGE || index === SPEED)
      return 3; // ...prior to division by 100

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
export function formatDisplayValue(value: number, index: number, places?: number): number {
   let returnValue = value;

   if (index === DAMAGE || index === SPEED || index === PRE_TE || index === PRE_IB)
      returnValue *= 100;

   // We want to convert it to Display in ASBM
   if (places == null) places = displayPrecision(index);
   returnValue = Utils.RoundTo(returnValue, places);

   return returnValue;
}

/** Convert an input value into an Interval representing it's value and precision */
export function inputValueToInterval(value: number, index: number, source: CreatureDataSource) {
   const precision: number = inputDataPrecision(index, source);
   let range = intervalFromDecimal(value, precision);

   if (index === DAMAGE || index === SPEED || index === PRE_TE || index === PRE_IB)
      range = IA.div(range, IA(100));

   return range;
}

/** Returns the number of decimal places given by the input the specified source for this type of data */
function inputDataPrecision(index: number, source: CreatureDataSource) {
   let precision: number;

   if (source === 'asb_user_input' || source === 'asbm_user_input') {
      precision = 1;
      if (index === PRE_IB) precision = 0;
   }
   else if (source === 'ark_export') {
      precision = 6;
      if (index === DAMAGE || index === SPEED)
         precision = 4;
   }
   else {
      // TODO: Do we need to get precisions for asb_xml or ark_tools_export?
      throw new Error('Invalid data source');
   }

   return precision;
}

/** Gather combined multipliers for the given server and species */
export function gatherMultipliers(server: Server, speciesName: string): StatMultipliers[] {

   // Gather raw multipliers first from the official server, overriding with settings from the given server
   const values = _.merge({}, theStore.officialServer.multipliers, server.multipliers);

   // Find the settings for the species
   const speciesValues = theStore.speciesMultipliers[speciesName];
   if (!speciesValues) throw new Error(`Unknown species '${speciesName}'`);

   const multipliers: StatMultipliers[] = [];
   for (let stat = HEALTH; stat <= TORPOR; stat++) {
      // Make up a set of multipliers, based on the species values and server multipliers
      multipliers[stat] = new StatMultipliers(speciesValues[stat]);
      multipliers[stat].IBM = speciesValues[stat].noImprint ? IA.ZERO : floatRange(server.IBM);

      // Apply single-player multipliers
      if (server.singlePlayer && theStore.officialServerSP.multipliers[stat]) {
         multipliers[stat].Iw = IA.mul(multipliers[stat].Iw, floatRange(theStore.officialServerSP.multipliers[stat][SERVER_IWM] || 1));
         multipliers[stat].Id = IA.mul(multipliers[stat].Id, floatRange(theStore.officialServerSP.multipliers[stat][SERVER_IDM] || 1));

         if (IA.gt(multipliers[stat].Ta, IA.ZERO))
            multipliers[stat].Ta = IA.mul(multipliers[stat].Ta, floatRange(theStore.officialServerSP.multipliers[stat][SERVER_TAM] || 1));
         if (IA.gt(multipliers[stat].Tm, IA.ZERO))
            multipliers[stat].Tm = IA.mul(multipliers[stat].Tm, floatRange(theStore.officialServerSP.multipliers[stat][SERVER_TMM] || 1));
      }

      // Pre-calculate what we can
      const { 0: TaM, 1: TmM, 2: IdM, 3: IwM } = values[stat];
      if (IA.gt(multipliers[stat].Ta, IA.ZERO))
         multipliers[stat].Ta = IA.mul(multipliers[stat].Ta, floatRange(TaM));
      if (IA.gt(multipliers[stat].Tm, IA.ZERO))
         multipliers[stat].Tm = IA.mul(multipliers[stat].Tm, floatRange(TmM));

      multipliers[stat].Id = IA.mul(multipliers[stat].Id, floatRange(IdM));
      multipliers[stat].Iw = IA.mul(multipliers[stat].Iw, floatRange(IwM));

      if (!IA.equal(multipliers[stat].IBM, IA.ZERO))
         multipliers[stat].IBM = IA.div(multipliers[stat].IBM, IA(5)); // * 0.2

      multipliers[stat].TBHM = multipliers[stat].TBHM || IA.ONE;
   }

   return multipliers;
}
