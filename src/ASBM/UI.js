/**
 * @fileOverview Controls the interaction between the DOM and Javascript
 */

"use strict";

var ASBM = ASBM || {};
ASBM.UI = ASBM.UI || {};

// Populates the Drop Down Element with the Species
ASBM.UI.DropDownInit = function () {
   for (var species in app.creatures) {
      app.speciesNames.push(species);
   }
}

ASBM.UI.CreateApp = function () {
   return new Vue({
      el: '#app',
      data: {
         dataLoaded: false,

         showSidebar: true,
         tab: 'welcome',
         devMode: true,

         statImages: [
            "Health.png", "Stamina.png", "Oxygen.png", "Food.png",
            "Weight.png", "Melee.png", "Speed.png", "Torpor.png",
         ],

         speciesDB: {},
         officialServerSettings: {},
         officialSPSettings: {},
         extractObject: {},
         myMultipliers: {},
         multipliersDB: new Dexie("Multipliers"),

         testData: testData,

         speciesNames: [],

         extractor: {
            species: "Rex",
            mode: "Tamed",
            imprint: 0,
            exactly: false,
            stats: new Array(8),
         },

      },
      
      methods: {
      },
   });
};
