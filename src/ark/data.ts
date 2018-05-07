import { ID_OFFICIAL_SERVER, ID_OFFICIAL_SERVER_SP } from '@/ark/servers_predef';
import { Server } from '@/data/objects';
import theStore from '@/ui/store';
import { SpeciesParameters } from './multipliers';


/**
 * Load the data file containing creature multipliers and official server settings.
 * This is done synchronously so needs to be relatively fast.
 */
export function ParseDatabase(jsonObject: any) {
   // Local stores for constructing the data (unobserved until read)
   const speciesNames = [];
   const speciesMultipliers: { [species: string]: SpeciesParameters } = {};

   // Read all of the species data
   for (const creature in jsonObject.species) {
      const speciesData = jsonObject.species[creature];
      speciesNames.push(creature);
      speciesMultipliers[creature] = new SpeciesParameters(
         speciesData.stats,
         speciesData.TBHM,
         speciesData.noOxygen,
         speciesData.noImprint,
         speciesData.bp);
   }

   // Sort species names for nicer display
   speciesNames.sort();

   // Make it available in the store, enabling observation
   theStore.speciesNames = speciesNames;
   theStore.speciesMultipliers = speciesMultipliers;

   // Define the constant servers and populate the list if empty
   theStore.officialServer = new Server(jsonObject.settings.officialMultipliers, jsonObject.settings.imprintingMultiplier, false, ID_OFFICIAL_SERVER);
   theStore.officialServerSP = new Server(jsonObject.settings.officialMultipliersSP, jsonObject.settings.imprintingMultiplier, true, ID_OFFICIAL_SERVER_SP);

   // Save the version number
   theStore.valuesVersion = jsonObject.settings.version;
}
