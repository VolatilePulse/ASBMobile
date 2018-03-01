"use strict";

/**
 * @fileOverview Controls the data flow for the app
 */

import Dexie from "dexie";

import * as app from './app';
import { CreatureStats } from './ark/multipliers';
import { Server } from './ark/multipliers';


export const multipliers = new Dexie("Multipliers");
multipliers.version(1).stores({
   statMultipliers: '[species+statIndex],species',
});
multipliers.open();

export const library = new Dexie("Library");
library.version(1).stores({
   servers: '++,name',
   creatures: 'uuid,name,server_id',
   settings: '',
});
library.open();

export const settings = new Dexie("Settings");
settings.version(1).stores({
   settings: '',
});
settings.open();

/**
 * @returns {string[]} Array of sorted species names
*/
export function GetSpeciesNames() {
   return multipliers.statMultipliers.orderBy("species").keys()
      .then(allKeys => allKeys.map(row => row.species));
}

/**
 * Creates ASBM ready objects from a JSON String and populates the DB
 * @async
 * @param {string} json Json-encoded stirng
 * @returns {Promise}
 */

// This function is only called either when the values.json file needs update (and is passed the text from the file)
// Or in order to populate the app objects
export async function LoadValues(json) {
   // Clear existing multipliers from DB
   await multipliers.statMultipliers.clear();

   // Parse the received JSON file
   let jsonObject = JSON.parse(json);

   // Array to pass the multipliers using .bulkPut
   let linearArray = [];

   for (var i in jsonObject.species) {
      let speciesData = jsonObject.species[i];
      app.data.speciesMultipliers[speciesData.name] =
         new CreatureStats(speciesData.statsRaw,
            speciesData.TBHM,
            speciesData.doesNotUseOxygen,
            speciesData.NoImprintingForSpeed);

      for (var index = 0; index < 8; index++) {
         linearArray.push(Object.assign(
            { species: speciesData.name, statIndex: index },
            app.data.speciesMultipliers[speciesData.name][index]));
      }
   }

   // Define the constant servers and populate the list if empty
   app.data.officialServer = new Server(jsonObject.statMultipliers, jsonObject.imprintingMultiplier);
   app.data.officialSPMultiplier = new Server(jsonObject.statMultipliersSP, jsonObject.imprintingMultiplier, true);
   app.data.servers["Official Server"] = new Server(null, 1, false);
   app.data.servers["Official Single Player"] = new Server(null, 1, true);
   // Generate some test servers
   app.data.servers["kohonac HP.IDM: 2.0"] = new Server([[,, 2, ],,,,,,, ], 1, true);
   app.data.servers["eldoco87"] = new Server([,,,,,, [2,,, ], ], 1, false);

   await multipliers.statMultipliers.bulkPut(linearArray);

   // var testObj = {};
   // await multipliers.statMultiplier.toCollection().each(obj => {
   //    if (testObj[obj.species] == undefined)
   //       testObj[obj.species] = [];
   //    testObj[obj.species][obj.statIndex] = new StatMultiplier(obj);
   // });
}
