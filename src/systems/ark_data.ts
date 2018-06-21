import { SpeciesParameters } from '@/ark/multipliers';
import theStore, { EVENT_LOADED_DATA } from '@/ui/store';
import { Delay } from '@/utils';
import { SubSystem } from './common';


/** Subsystem that handles loading and parsing data.json */
export class ArkDataSystem implements SubSystem {
   async initialise() {
      console.log('ArkDataSystem: Sleeping');
      // Let the app become responsive before doing anything
      await Delay(250);

      let response: Response;

      try {
         console.log('ArkDataSystem: Fetching core data.json');
         response = await fetch('/data/data.json');
      }
      catch (ex) {
         console.error(ex);
         theStore.dataLoadError = 'Failed to fetch database: ' + ex;
         theStore.loadErrors.push('Failed to fetch database: ' + ex);
         return;
      }

      try {
         const json = await response.json();
         ParseDatabase(json);
      }
      catch (ex) {
         console.error(ex);
         theStore.dataLoadError = 'Failed to parse database: ' + ex;
         theStore.loadErrors.push('Failed to parse database: ' + ex);
         return;
      }

      console.log('ArkDataSystem: Marking loaded');
      theStore.loaded.data = true;
      theStore.dataLoaded = true;
      theStore.events.emit(EVENT_LOADED_DATA);
   }
}


function ParseDatabase(jsonObject: any) {
   // Local stores for constructing the data (unobserved until saved into theStore)
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

   // FIXME: TRANSITION : Pouch removal
   // Define the constant servers and populate the list if empty
   // theStore.officialServer = new Server(jsonObject.settings.officialMultipliers, jsonObject.settings.imprintingMultiplier, false, ID_OFFICIAL_SERVER);
   // theStore.officialServerSP = new Server(jsonObject.settings.officialMultipliersSP, jsonObject.settings.imprintingMultiplier, true, ID_OFFICIAL_SERVER_SP);

   // Save the version number
   theStore.valuesVersion = jsonObject.settings.version;
}
