/**
 * @fileOverview Controls the interaction between the DOM and Javascript
 */

"use strict";

var ASBM = ASBM || {};
ASBM.UI = ASBM.UI || {};

<<<<<<< HEAD
// Populates the Drop Down Element with the Species
ASBM.UI.DropDownInit = function () {
   for (var species in app.myMultipliers) {
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
=======
ASBM.UI = {
   // Populates the Drop Down Element with the Species
   DropDownInit() {
      for (var species in app.myMultipliers) {
         app.speciesNames.push(species);
      }
   },

   // TODO: Prevent user from crashing the app by entering bad data
   Extract() {
      // Read values from the UI
      var species = app.extractor.species;
      var level = app.extractor.level;
      var isWild = (app.extractor.mode == "Wild");
      var isTamed = (app.extractor.mode == "Tamed");
      var isBred = (app.extractor.mode == "Bred");
      var imprintBonus = app.extractor.imprint / 100;
      var exactly = !!app.extractor.exactly;

      var values = app.extractor.stats.slice(); // take a copy so we can modify it

      // Convert melee and speed to decimals
      values[DAMAGE] /= 100; values[DAMAGE] = Utils.RoundTo(values[DAMAGE], Ark.Precision(DAMAGE));
      values[SPEED] /= 100; values[SPEED] = Utils.RoundTo(values[SPEED], Ark.Precision(SPEED));

      // Create other important variables
      var multipliers = Utils.DeepMerge({}, app.officialServerSettings, app.myMultipliers[species]);

      let extractObject = new ASBM.Extractor(multipliers, values, level, isWild, isTamed, isBred, imprintBonus, exactly);
      extractObject.extract();

      // Copy into `app` so they will be displayed
      app.extractor.results = extractObject.results;
      app.extractObject = extractObject;
   }
}
>>>>>>> temp
