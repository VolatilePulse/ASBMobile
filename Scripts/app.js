/**
 * @fileOverview Contains necessary initialization of variables and objects as well as the overall webapp object
 */

"use strict";

const HEALTH = 0, STAMINA = 1, OXYGEN = 2, FOOD = 3, WEIGHT = 4, DAMAGE = 5, SPEED = 6, TORPOR = 7;

var app = {
   /**
    * @description Initializes all variables that require the page to finish loading
    */
    speciesDB: {},
    officialServerSettings: {},
    officialSPSettings: {},
    extractObject: {},
    myMultipliers: {},
    
   Init() {
      Utils.AsyncFileRead("values.json", Data.LoadValues);
      document.getElementById("extractButton").addEventListener("click", ASBM.UI.Extract);
   }
}

// Adds all necessary scripts
document.write(
   '<script type="application/javascript" src="https://cdn.jsdelivr.net/npm/vue@2.5.13/dist/vue.js"></script>' +
   '<script type="application/javascript" src="Scripts/ASBM/Creature.js"></script>' + 
   '<script type="application/javascript" src="Scripts/ASBM/Extractor.js"></script>' + 
   '<script type="application/javascript" src="Scripts/ASBM/Library.js"></script>' + 
   '<script type="application/javascript" src="Scripts/ASBM/Multipliers.js"></script>' + 
   '<script type="application/javascript" src="Scripts/ASBM/UI.js"></script>' + 
   '<script type="application/javascript" src="Scripts/Data.js"></script>' + 
   '<script type="application/javascript" src="Scripts/Utils.js"></script>' + 
   '<script type="application/javascript" src="Scripts/Ark.js"></script>' 
);
document.addEventListener("DOMContentLoaded", app.Init);