/**
 * @fileOverview Controls the data flow for the app
 */

import { CreatureStats, Server } from './multipliers';
import theStore from '@/ui/store';

/**
 * Load the data file containing creature multipliers and official server settings
 * @param {string} json Json-encoded string with the contents of data.json
 */
export function ParseDatabase(json: string) {
   // Parse the received JSON file
   const jsonObject = JSON.parse(json);

   // Local stores for constructing the data (unobserved until read)
   const speciesNames = [];
   const speciesMultipliers: { [species: string]: CreatureStats } = {};

   // Read all of the species data
   for (const creature in jsonObject.species) {
      const speciesData = jsonObject.species[creature];
      speciesNames.push(creature);
      speciesMultipliers[creature] = new CreatureStats(
         speciesData.stats,
         speciesData.TBHM,
         speciesData.noOxygen,
         speciesData.noImprint);
   }

   // Sort species names for nicer display
   speciesNames.sort();

   // Make it available in the store, enabling observation
   theStore.speciesNames = speciesNames;
   theStore.speciesMultipliers = speciesMultipliers;

   // Define the constant servers and populate the list if empty
   theStore.officialServer = new Server(jsonObject.settings.officialMultipliers, jsonObject.settings.imprintingMultiplier);
   theStore.officialSPMultiplier = new Server(jsonObject.settings.officialMultipliersSP, jsonObject.settings.imprintingMultiplier, true);

   // Make the whole DB available in case it's needed
   // FIXME: Consider removing this if nothing uses it as it stops it from being GC'd
   theStore.valuesJson = jsonObject;
}
