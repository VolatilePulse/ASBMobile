import { SpeciesParameters } from '@/ark/multipliers';
import { NUM_STATS } from '@/consts';
import { Server } from '@/data/firestore/objects';
import { Multipliers } from '@/data/firestore/types';
import theStore, { EVENT_LOADED_DATA } from '@/ui/store';
import { Delay } from '@/utils';
import { SubSystem } from './common';


/** Subsystem that handles loading and parsing data.json */
class ArkDataSystem implements SubSystem {
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


/** Only to be used by tests */
export function ParseDatabase(jsonObject: any) {
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

   // Define the constant servers and populate the list if empty
   theStore.officialServer = makeServer('Official', jsonObject.settings.officialMultipliers, jsonObject.settings.imprintingMultiplier, false);
   theStore.officialServerSP = makeServer('Official Single Player', jsonObject.settings.officialMultipliersSP, jsonObject.settings.imprintingMultiplier, true);

   // Save the version number
   theStore.valuesVersion = jsonObject.settings.version;
}

export const arkDataSystem = new ArkDataSystem();


function makeServer(name: string, mults: number[][], ibm: number, sp: boolean): Server {
   const server: Server = {
      multipliers: MultArrayToObjects(mults),
      IBM: ibm,
      singlePlayer: sp,
      name,
   };
   return server;
}

export function MultArrayToObjects(arr: number[][]): Multipliers {
   const result: Multipliers = {};

   // Always do every index
   for (let i = 0; i < NUM_STATS; i++) {
      const value = arr[i];
      if (value == null) {
         result[i] = {};
      }
      else {
         result[i] = ArrayToObjectValues(value);
      }
   }

   return result;
}

export function ArrayToObjectValues<T>(arr: T[]): { [index: string]: T } {
   const result: { [index: string]: T } = {};

   Object.entries(arr).forEach(([index, value]) => {
      result[index] = value;
   });

   return result;
}
