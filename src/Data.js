/**
 * @fileOverview Controls the data flow for the app
 */

"use strict";

var Data = {

   /**
    * @description Creates ASBM ready objects from a JSON String and populates the DB
    * @param {JSON String} text 
    * @namespace Data
    */

   // This function is only called either when the values.json file needs update (and is passed the text from the file)
   // Or in order to populate the app objects
   LoadValues(json) {
      return new Promise((resolve, reject) => {
         // Define our DB
         app.multipliersDB.version(1).stores({statMultiplier: '[species+statIndex]'});
         let promises = [];

         // Check to see if the values need updated
         // TODO Handle new values.json fetched from server
         if (json) {
            // Create the objects from file
            let jsonObject = JSON.parse(json);
            // Array to pass the multipliers using .bulkPut
            let linearArray = [];

            for(var i in jsonObject.species) {
               app.myMultipliers[jsonObject.species[i].name] =
                  new ASBM.StatMultipliers(jsonObject.species[i].statsRaw,
                                           jsonObject.species[i].TBHM,
                                           jsonObject.species[i].doesNotUseOxygen,
                                           jsonObject.species[i].NoImprintingForSpeed);

               for (var index = 0; index < 8; index ++)
                  linearArray.push(Object.assign({}, app.myMultipliers[jsonObject.species[i].name][index], {species: jsonObject.species[i].name, statIndex: index}));
                                                    
            }
            
            let putPromise = app.multipliersDB.statMultiplier.bulkPut(linearArray);
            promises.push(putPromise);

            app.officialServerSettings = new ASBM.Server(jsonObject.statMultipliers, null, false, jsonObject.imprintingMultiplier);
            // Single Player settings Multiply official settings, not override them
            for(var i = 0; i < 8; i ++) {
               if (!jsonObject.statMultipliersSP[i])
                  continue;
                  
               if (jsonObject.statMultipliersSP[i][0]) //TaM
                  jsonObject.statMultipliersSP[i][0] *= app.officialServerSettings[i].TaM;
               if (jsonObject.statMultipliersSP[i][1]) //TmM
                  jsonObject.statMultipliersSP[i][1] *= app.officialServerSettings[i].TmM;
               if (jsonObject.statMultipliersSP[i][2]) //IdM
                  jsonObject.statMultipliersSP[i][2] *= app.officialServerSettings[i].IdM;
               if (jsonObject.statMultipliersSP[i][3]) //IwM
                  jsonObject.statMultipliersSP[i][3] *= app.officialServerSettings[i].IwM;
            }
            app.officialSPSettings = new ASBM.Server(jsonObject.statMultipliersSP, app.officialServerSettings, true, jsonObject.imprintingMultiplier);
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