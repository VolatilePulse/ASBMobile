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
            
            // Create the DB
            for (var species in app.myMultipliers) {
               for (var index = 0; index < 8; index ++) {
                  let putPromise = app.multipliersDB.statMultiplier
                     .put(Object.assign({}, app.myMultipliers[species][index], {species: species, statIndex: index}));
                  promises.push(putPromise);
               }
            }
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
   })},

   // Attempt to make LoadValues a promise instead of a function
   // resolve is an expected good return
   // Whatever is passed to resolve, is passed on to the next .then call
   // reject if a failed result
   // reject is sent to .catch
   // or both can be processed by (function(param1, param2) {}) where param1 is the content of a success event
   // and param2 is the content of a failed event
   // Expected usage:
   // GetFile: Load asset from cache/server
   // ObjectCreation: Convert the json into ASBM Objects
   // SetVueObjects: Assign necessary variables to Vue elements
   // CriticalError: Suggest user refreshes their browser or goes online
   //    GetFile("file.ext").then(ObjectCreation).then(SetVueObjects).catch(CriticalError);

   // We will only get a json string if the file loaded correctly
   // Convert Cad's object to ASBM objects
   LoadValues2 (json) {
      return new Promise(function(resolve, reject) {
         app.multipliersDB.version(DB_VER_M).stores({
            multiplier: 'B, Id, Iw, TBHM, Ta, Tm, IBM'
         });
         // Check to see if the json file has been updated
         // if (json === "") {
         if (true) {
            // File hasn't been updated continue using the DB
         }
         
         // We want to either resolve to the next function, or just return to it in general
         // We want the next function to handle the assignment of variables to Vue
         var jsonObject = JSON.parse(json);
         for(var i in jsonObject.species) {
            app.myMultipliers[jsonObject.species[i].name] = new ASBM.StatMultipliers(
               jsonObject.species[i].statsRaw,
               jsonObject.species[i].TBHM,
               jsonObject.species[i].doesNotUseOxygen,
               jsonObject.species[i].NoImprintingForSpeed);
         }

         console.log(app.myMultipliers[Argentavis][0]);

         resolve(true)

         /*for (var species in app.myMultipliers)
            for (var i in app.myMultipliers[species])
               */

         app.officialServerSettings = new ASBM.Server(jsonObject.statMultipliers, null, false, jsonObject.imprintingMultiplier);
         app.officialSPSettings = new ASBM.Server(jsonObject.statMultipliersSP, app.officialServerSettings, true, jsonObject.imprintingMultiplier);

         // Allows next .then to access myMultipliers directly once we are done with it
         resolve(app.myMultipliers);
      });
   }
}