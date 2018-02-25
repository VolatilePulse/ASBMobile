/**
 * @fileOverview Controls the data flow for the app
 */

"use strict";

var Data = {

   /**
    * @description Creates an ASBM ready object using a JSON String
    * @param {JSON String} text 
    * @namespace Data
    */

   // This function is only called either when the values.json file needs update (and is passed the text from the file)
   // Or in order to populate the app objects
   LoadValues(text) {
      return new Promise((resolve, reject) => {
         // Define our DB
         app.multipliersDB.version(1).stores({statMultiplier: '[species+statIndex]'});
         let promises = [];

         // Check to see if the values need updated
         // TODO Handle new values.json fetched from server
         if (text) {
            // Create the objects from file
            var jsonObject = JSON.parse(text);
            for(var i in jsonObject.species)
               app.myMultipliers[jsonObject.species[i].name] =
                  new ASBM.StatMultipliers(jsonObject.species[i].statsRaw,
                                           jsonObject.species[i].TBHM,
                                           jsonObject.species[i].doesNotUseOxygen,
                                           jsonObject.species[i].NoImprintingForSpeed);

            app.officialServerSettings = new ASBM.Server(jsonObject.statMultipliers, null, false, jsonObject.imprintingMultiplier);
            app.officialSPSettings = new ASBM.Server(jsonObject.statMultipliersSP, app.officialServerSettings, true, jsonObject.imprintingMultiplier);
            
            // Array to pass the multipliers using .bulkPut
            var linearArray = [];

            // Create the DB
            for (var species in app.myMultipliers)
               for (var index = 0; index < 8; index ++)
                  linearArray.push(Object.assign({}, app.myMultipliers[species][index], {species: species, statIndex: index}));

            let putPromise = app.multipliersDB.statMultiplier.bulkPut(linearArray);
            promises.push(putPromise);
         }

         // Otherwise the DB already exists
         else {
            var testObj = {};
            let readPromise = app.multipliersDB.statMultiplier
               .toCollection()
               .each(obj => {
                  if (testObj[obj.species] == undefined)
                     testObj[obj.species] = [];
                  testObj[obj.species][obj.statIndex] = new ASBM.StatMultiplier(obj)});
            promises.push(readPromise);
         }

         Promise.all(promises).then(() => resolve()).catch(err => reject(err));
   })}
}