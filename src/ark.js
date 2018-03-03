"use strict";

import { DAMAGE, SPEED, PRE_IB, PRE_TE } from './consts';
import * as Utils from './utils';
import * as app from './app';
import { Server } from './ark/multipliers';


export function Precision(index) {
   // Displays Damage and Speed as 153.5(%)
   if (index == DAMAGE || index == SPEED)
      return 3;
   // Displays TE as 98.34(%)
   if (index == PRE_TE)
      return 4;
   // Displays IB as 38.8810(%)
   if (index == PRE_IB)
      return 6;
   // Displays other stats as 18362.4
   return 1;
}

/**
 * Will convert decimal values to a percentage and round to the correct Display precision
 * @param {number} value The value that is to be rounded
 * @param {number} index Number corresponding with the index of a stat
 * @returns {number} The rounded, converted value
 */
export function DisplayValue(value, index) {
   let returnValue = value;

   if (index == DAMAGE || index == SPEED || index == PRE_TE || index == PRE_IB)
      returnValue *= 100;

   // We want to convert it to Display in ASBM
   returnValue = Utils.RoundTo(returnValue, Precision(index));

   return returnValue;
}

// Converts a value (from the UI) to a working value for ASBM
export function ConvertValue(value, index) {
   let returnValue = value;

   if (index == DAMAGE || index == SPEED || index == PRE_TE || index == PRE_IB)
      returnValue /= 100;

   // We want to convert it to Use in ASBM
   returnValue = Utils.RoundTo(returnValue, Precision(index));

   return returnValue;
}

/**
 * Generate a multipliers object for the Extractor
 * @param {string} serverName
 * @param {string} speciesName
 */
export function GetMultipliers(serverName, speciesName) {
   // The Server object tells us everything we need to know about the multipliers
   let multipliers = Utils.DeepMergeSoft(new Server(), app.data.officialServer, app.data.servers[serverName]);

   // Single Player multiplies the official/override multipliers
   if (app.data.servers[serverName].singlePlayer)
      for (var stat in app.data.officialSPMultiplier)
         for (var multiplier in app.data.officialSPMultiplier[stat])
            multipliers[stat][multiplier] = Utils.RoundTo(multipliers[stat][multiplier] * app.data.officialSPMultiplier[stat][multiplier], 3);

   Utils.DeepMerge(multipliers, app.data.speciesMultipliers[speciesName]);

   return multipliers;
}
