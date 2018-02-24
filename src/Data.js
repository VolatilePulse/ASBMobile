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
   LoadValues(text) {
      app.speciesDB = JSON.parse(text);
      for(var i in app.speciesDB.species) {
         var temp = document.createElement("option");
         temp.text = app.speciesDB.species[i].name;
         document.getElementById("inputSpecies").add(temp);
         app.myMultipliers[app.speciesDB.species[i].name] = new ASBM.StatMultipliers(app.speciesDB.species[i].statsRaw, app.speciesDB.species[i].TBHM, app.speciesDB.species[i].doesNotUseOxygen, app.speciesDB.species[i].NoImprintingForSpeed);
      }
      app.officialServerSettings = new ASBM.Server(app.speciesDB.statMultipliers, null, false, app.speciesDB.imprintingMultiplier);
      app.officialSPSettings = new ASBM.Server(app.speciesDB.statMultipliersSP, app.officialServerSettings, true, app.speciesDB.imprintingMultiplier);
   },

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
   ObjectCreation (json) {
      return new Promise(function(resolve, reject) {
         // Check for content of the json string
         if (json === "")
            reject(Error("The data is missing!"));
         
         // We want to either resolve to the next function, or just return to it in general
         // We want the next function to handle the assignment of variables to Vue
         var jsonObject = JSON.parse(json);
         for(var i in jsonObject.species)
            app.myMultipliers[jsonObject.species[i].name] = new ASBM.StatMultipliers(
               jsonObject.species[i].statsRaw,
               jsonObject.species[i].TBHM,
               jsonObject.species[i].doesNotUseOxygen,
               jsonObject.species[i].NoImprintingForSpeed);

         app.officialServerSettings = new ASBM.Server(jsonObject.statMultipliers, null, false, jsonObject.imprintingMultiplier);
         app.officialSPSettings = new ASBM.Server(jsonObject.statMultipliersSP, app.officialServerSettings, true, jsonObject.imprintingMultiplier);

         // Allows next .then to access myMultipliers directly once we are done with it
         resolve(app.myMultipliers);
      });
   }
}