/**
 * @fileOverview Controls the interaction between the DOM and Javascript
 */

"use strict";

var ASBM = ASBM || {};

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

      // Copy the results into `app` so they will be displayed
      for (var i = 0; i < 8; i++) {
         let target = {};
         let options = extractObject.results[i];
         if (options.length) {
            target.Lw = options[0].Lw;
            target.Ld = options[0].Ld;
         }

         target.optionsText = options.map(stat => `(${stat.Lw}+${stat.Ld})`).join(',');

         Object.assign(app.extractor.results[i], target);
      }
   }
}
