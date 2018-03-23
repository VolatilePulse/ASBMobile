"use strict";

/**
 * @fileOverview Controls the data flow for the app
 */

import * as app from '../app';
import { CreatureStats, Server } from './multipliers';

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
   app.data.speciesNames = [];

   for (var creature in jsonObject.species) {
      let speciesData = jsonObject.species[creature];
      // @ts-ignore
      app.data.speciesNames.push(creature);
      app.data.speciesMultipliers[creature] =
         new CreatureStats(speciesData.stats,
            speciesData.TBHM,
            speciesData.noOxygen,
            speciesData.noImprint);
   }

   // Sorted species names, please
   app.data.speciesNames.sort();

   // Define the constant servers and populate the list if empty
   app.data.officialServer = new Server(jsonObject.settings.officialMultipliers, jsonObject.settings.imprintingMultiplier);
   app.data.officialSPMultiplier = new Server(jsonObject.settings.officialMultipliersSP, jsonObject.settings.imprintingMultiplier, true);
}
