var speciesDB = {};
var officialServerSettings = {};
var officialSPSettings = {};
var extractObject = {};
var myMultipliers = {};

document.addEventListener("DOMContentLoaded", Init);

// Initializes all variables that require the page to finish loading
function Init() {
   AsyncFileRead("values.json", LoadValues);
   document.getElementById("extractButton").addEventListener("click", Extract);
}

function AsyncFileRead(file, callback) {
   var rawFile = new XMLHttpRequest();
   rawFile.overrideMimeType("application/json");
   rawFile.open("GET", file, true);
   rawFile.onreadystatechange = function() {
      if (rawFile.readyState === 4 && rawFile.status == "200")
         callback(rawFile.responseText);
   }
   rawFile.send(null);
}

function Extract() {
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
   var level = Number(levelDOM.value);
   var isWild = isWildDOM.checked;
   var isTamed = isTamedDOM.checked;
   var isBred = isBredDOM.checked;
   var imprintBonus = Number(imprintBonusDOM.value / 100);
   var exactly = exactlyDOM.checked;
   var values = [8];
   
   for (var i = 0; i < valuesDOM.length; i ++)
      values[i] = valuesDOM[i].value;
   
   // Convert melee and speed to decimals
   values[5] /= 100;
   values[6] /= 100;
   
   // Create other important variables
   var multipliers = DeepMerge({}, officialServerSettings, myMultipliers[species]);
   
   extractObject = new extraction(multipliers, values, level, isWild, isTamed, isBred, imprintBonus, exactly);
   extractObject.extractLevels(myMultipliers[document.getElementById("inputSpecies").selectedIndex],
                               DeepMerge({}, officialServerSettings, officialSPSettings));
   console.log(extractObject.results);
}

function LoadValues(text) {
   speciesDB = JSON.parse(text);
   for(var i in speciesDB.species) {
      var temp = document.createElement("option");
      temp.text = speciesDB.species[i].name;
      document.getElementById("inputSpecies").add(temp);
      myMultipliers[speciesDB.species[i].name] = new statMultipliers(speciesDB.species[i].statsRaw, speciesDB.species[i].TBHM, speciesDB.species[i].doesNotUseOxygen, speciesDB.species[i].NoImprintingForSpeed);
   }
   officialServerSettings = new server(speciesDB.statMultipliers, null, false, speciesDB.imprintingMultiplier);
   officialSPSettings = new server(speciesDB.statMultipliersSP, officialServerSettings, true, speciesDB.imprintingMultiplier);
}

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
function isObject(item) {
   return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
function DeepMerge(target, ...sources) {
   if (!sources.length)
      return target;
   
   const source = sources.shift();

   if (isObject(target) && isObject(source)) {
      for (const key in source) {
         if (isObject(source[key])) {
            if (!target[key])
               Object.assign(target, {[key]: {}});
            DeepMerge(target[key], source[key]);
         }
         else
            Object.assign(target, {[key]: source[key]});
      }
   }

   return DeepMerge(target, ...sources);
}