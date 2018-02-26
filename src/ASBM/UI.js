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
   Extract(ui) {
      // Read values from the UI
      var species = ui.species;
      var level = ui.level;
      var isWild = (ui.mode == "Wild");
      var isTamed = (ui.mode == "Tamed");
      var isBred = (ui.mode == "Bred");
      var imprintBonus = ui.imprint / 100;
      var exactly = !!ui.exactly;

      // Prepare the input values for use with the extractor
      var values = ui.stats.map(Ark.ConvertValue);

      // Create other important variables
      var multipliers = Utils.DeepMerge({}, app.officialServerSettings, app.myMultipliers[species]);

      let extractObject = new ASBM.Extractor(multipliers, values, level, isWild, isTamed, isBred, imprintBonus, exactly);
      extractObject.extract();

      // Copy into `app` so they will be displayed
      ui.results = extractObject.results;
      ui.extractor = extractObject;
   }
}
