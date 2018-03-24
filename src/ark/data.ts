"use strict";

/**
 * @fileOverview Controls the data flow for the app
 */

import { CreatureStats, Server } from './multipliers';
import theStore from '@/ui/store';

/**
 * Creates ASBM ready objects from a JSON String and populates the DB
 * @async
 * @param {string} json Json-encoded stirng
 * @returns {Promise}
 */

/** Load the data file containing creature multipliers and official server settings */
export async function LoadData(json) {
   // Parse the received JSON file
   let jsonObject = JSON.parse(json);

   // Clear species list, ready to be populated
   theStore.speciesNames = [];

   for (var creature in jsonObject.species) {
      let speciesData = jsonObject.species[creature];
      theStore.speciesNames.push(creature);
      theStore.speciesMultipliers[creature] = new CreatureStats(
         speciesData.stats,
         speciesData.TBHM,
         speciesData.noOxygen,
         speciesData.noImprint);
   }

   // Sorted species names, please
   theStore.speciesNames.sort();

   // Define the constant servers and populate the list if empty
   theStore.officialServer = new Server(jsonObject.settings.officialMultipliers, jsonObject.settings.imprintingMultiplier);
   theStore.officialSPMultiplier = new Server(jsonObject.settings.officialMultipliersSP, jsonObject.settings.imprintingMultiplier, true);
}
