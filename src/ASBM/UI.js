/**
 * @fileOverview Controls the interaction between the DOM and Javascript
 */

 "use strict";

var ASBM = ASBM || {};

ASBM.UI = {
   // Populates the Drop Down Element with the Species
   DropDownInit() {
      for (var species in app.myMultipliers) {
         var temp = document.createElement("option");
         temp.text = species;
         document.getElementById("inputSpecies").add(temp);
      }
   },

   Extract() {
      // Grab DOM elements
      var speciesDOM = document.getElementById("inputSpecies");
      var levelDOM = document.getElementById("inputLevel");
      var isWildDOM = document.getElementById("inputWild");
      var isTamedDOM = document.getElementById("inputTamed");
      var isBredDOM = document.getElementById("inputBred");
      var imprintBonusDOM = document.getElementById("inputImprint");
      var exactlyDOM = document.getElementById("inputExactly");
      var valuesDOM = document.getElementsByName("Values");
      
      // Assign values from DOM elements
      var species = speciesDOM.value;
      var level = levelDOM.value;
      var isWild = isWildDOM.checked;
      var isTamed = isTamedDOM.checked;
      var isBred = isBredDOM.checked;
      var imprintBonus = imprintBonusDOM.value / 100;
      var exactly = exactlyDOM.checked;
      var values = [];
      
      for (var i = 0; i < valuesDOM.length; i ++)
         values[i] = parseFloat(valuesDOM[i].value);
      
      // Convert melee and speed to decimals
      values[DAMAGE] /= 100; values[DAMAGE] = Utils.RoundTo(values[DAMAGE], Ark.Precision(DAMAGE));
      values[SPEED] /= 100; values[SPEED] = Utils.RoundTo(values[SPEED], Ark.Precision(SPEED));
      
      // Create other important variables
      var multipliers = Utils.DeepMerge({}, app.officialServerSettings, app.myMultipliers[species]);
      
      app.extractObject = new ASBM.Extractor(multipliers, values, level, isWild, isTamed, isBred, imprintBonus, exactly);
      app.extractObject.extract();
   }
}