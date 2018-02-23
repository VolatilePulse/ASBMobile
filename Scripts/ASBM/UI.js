/**
 * @fileOverview Controls the interaction between the DOM and Javascript
 */

 "use strict";

var ASBM = ASBM || {};

ASBM.UI = {
   Extract() {
      // Testing purposes
      document.getElementById("inputSpecies").value = "Rex";
      document.getElementById("inputLevel").value = 152;
      document.getElementById("inputWild").checked = false;
      document.getElementById("inputTamed").checked = true;
      document.getElementById("inputBred").checked = false;
      document.getElementById("inputImprint").value = 39;
      document.getElementById("inputHealth").value = 5280.1;
      document.getElementById("inputStamina").value = 1386.0;
      document.getElementById("inputOxygen").value = 315.0;
      document.getElementById("inputFood").value = 11100.0;
      document.getElementById("inputWeight").value = 650.0;
      document.getElementById("inputMelee").value = 270.4;
      document.getElementById("inputSpeed").value = 100.0;
      document.getElementById("inputTorpor").value = 15593.5;
      
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
      var values = [8];
      
      for (var i = 0; i < valuesDOM.length; i ++)
         values[i] = parseFloat(valuesDOM[i].value);
      
      // Convert melee and speed to decimals
      values[5] /= 100;
      values[6] /= 100;
      
      // Create other important variables
      var multipliers = Utils.DeepMerge({}, app.officialServerSettings, app.myMultipliers[species]);
      
      app.extractObject = new ASBM.Extraction(multipliers, values, level, isWild, isTamed, isBred, imprintBonus, exactly);
      app.extractObject.extractLevels();
      console.log(app.extractObject.results);
   }
}
