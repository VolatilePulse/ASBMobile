/**
 * @fileOverview Controls the data flow for the app
 */

import { CreatureStats, Server } from './multipliers';
import theStore from '@/ui/store';

/**
 * Load the data file containing creature multipliers and official server settings
 * @param {string} json Json-encoded string with the contents of data.json
 */
export function LoadData(json: string) {
   // Parse the received JSON file
   const jsonObject = JSON.parse(json);

   // Clear species list, ready to be populated
   theStore.speciesNames = [];

   for (const creature in jsonObject.species) {
      const speciesData = jsonObject.species[creature];
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
