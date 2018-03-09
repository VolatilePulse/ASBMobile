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
 * Creates ASBM ready objects from a JSON String and populates the DB
 * @async
 * @param {string} json Json-encoded stirng
 * @returns {Promise}
 */

// This function is only called either when the values.json file needs update (and is passed the text from the file)
// Or in order to populate the app objects
export async function LoadValues(json) {
   // Clear existing multipliers from DB
   await multipliers.table('statMultipliers').clear(); // Cleaned up for type checking, but a nearer solution would be better in the long run

   // Parse the received JSON file
   let jsonObject = JSON.parse(json);

   // Array to pass the multipliers using .bulkPut
   let linearArray = [];

   // Clear species list, ready to be populated
   app.data.speciesNames = [];

   /*    for (var i in jsonObject.species) {
      let speciesData = jsonObject.species[i];
      app.data.speciesNames.push(speciesData.name);

      app.data.speciesMultipliers[speciesData.name] =
         new CreatureStats(speciesData.statsRaw,
            speciesData.TamedBaseHealthMultiplier,
            speciesData.doesNotUseOxygen,
            speciesData.NoImprintingForSpeed);

      for (var index = 0; index < 8; index++) {
         linearArray.push(Object.assign(
            { species: speciesData.name, statIndex: index },
            app.data.speciesMultipliers[speciesData.name][index]));
      }
   } */

   for (var creature in jsonObject.species) {
      let speciesData = jsonObject.species[creature];
      app.data.speciesNames.push(creature);
      app.data.speciesMultipliers[creature] =
         new CreatureStats(speciesData.stats,
            speciesData.TBHM,
            speciesData.noOxygen,
            speciesData.noImprint);

      for (var index = 0; index < 8; index++) {
         linearArray.push(Object.assign(
            { species: creature, statIndex: index },
            app.data.speciesMultipliers[creature][index]));
      }
   }

   //await multipliers.statMultipliers.bulkPut(linearArray);

   // Sorted species names, please
   app.data.speciesNames.sort();

   // Define the constant servers and populate the list if empty
   app.data.officialServer = new Server(jsonObject.settings.officialMultipliers, jsonObject.settings.imprintingMultiplier);
   app.data.officialSPMultiplier = new Server(jsonObject.settings.officialMultipliersSP, jsonObject.settings.imprintingMultiplier, true);

   // TODO: Put official and official SP servers into the pre-defined servers list using these values

   // var testObj = {};
   // await multipliers.statMultiplier.toCollection().each(obj => {
   //    if (testObj[obj.species] == undefined)
   //       testObj[obj.species] = [];
   //    testObj[obj.species][obj.statIndex] = new StatMultiplier(obj);
   // });
}
