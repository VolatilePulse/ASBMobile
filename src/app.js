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

// Register Service Worker
if ('serviceWorker' in navigator) {
   navigator.serviceWorker
            .register('./ServiceWorker.js')
            .then(function() { console.log("Service Worker Registered!"); });
}

// Adds all necessary scripts
document.write(
   '<script type="application/javascript" src="https://cdn.jsdelivr.net/npm/vue@2.5.13/dist/vue.js"></script>' +
   '<script type="application/javascript" src="src/ASBM/Creature.js"></script>' + 
   '<script type="application/javascript" src="src/ASBM/Extractor.js"></script>' + 
   '<script type="application/javascript" src="src/ASBM/Library.js"></script>' + 
   '<script type="application/javascript" src="src/ASBM/Multipliers.js"></script>' + 
   '<script type="application/javascript" src="src/ASBM/UI.js"></script>' + 
   '<script type="application/javascript" src="src/Data.js"></script>' + 
   '<script type="application/javascript" src="src/Utils.js"></script>' + 
   '<script type="application/javascript" src="src/Ark.js"></script>' 
);
document.addEventListener("DOMContentLoaded", app.Init);