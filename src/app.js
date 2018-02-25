/**
 * @fileOverview Contains necessary initialization of variables and objects as well as the overall webapp object
 */

"use strict";

const HEALTH = 0, STAMINA = 1, OXYGEN = 2, FOOD = 3, WEIGHT = 4, DAMAGE = 5, SPEED = 6, TORPOR = 7;
const DB_VER_M = 1, DB_VER_L = 1;

var app = {
   /**
    * @description Initializes all variables that require the page to finish loading
    */
   speciesDB: {},
   officialServerSettings: {},
   officialSPSettings: {},
   extractObject: {},
   myMultipliers: {},
   multipliersDB: new Dexie("Multipliers"),
    
   async Init() {
      try {
         let json = await Utils.AsyncFileRead("values.json");
         await Data.LoadValues(json);
         
         for (var species in app.myMultipliers) {
            var temp = document.createElement("option");
            temp.text = species;
            document.getElementById("inputSpecies").add(temp);
         }

         console.log("Loaded!");
         document.getElementById("extractButton").addEventListener("click", ASBM.UI.Extract);
      } catch (error) {
         console.log("Error: "+error);
      }
   }
}

// Register Service Worker
if ('serviceWorker' in navigator) {
   // Service worker must be added during the load event
   window.addEventListener('load', function() {

      // Attempt to register our Service work
      navigator.serviceWorker.register('/ServiceWorker.js').then(function(registration) {
         // Registration was successful
         console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, function(err) {
         // registration failed :(
         console.log('ServiceWorker registration failed: ', err);
      });
   });
 }

// Adds all necessary scripts
document.write(
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
