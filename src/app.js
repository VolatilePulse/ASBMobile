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
    
   Init() {
      // Proposed future syntax
      // Utils.AsyncFileRead("values.json")
      //    .then(text => Data.ObjectCreation(text))
      //    .then(creatures => app.VueInit(creatures))
      //    .catch(error => app.CriticalError);
      Utils.AsyncFileRead("values.json")
         .then(json => Data.LoadValues(json))
         .then(() => ASBM.UI.DropDownInit())
         .catch(error => console.log(error));
      document.getElementById("extractButton").addEventListener("click", ASBM.UI.Extract);
      document.getElementById("TestCases").addEventListener("click", Testing);
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


// Testing purposes
function Testing() {
   var testCase = [];
   testCase[0] = {
      species: "Rex",
      level: 152,
      wild: false,
      tamed: true,
      bred: false,
      imprint: 0.39,
      stats: [5280.1, 1386.0, 315, 11100, 650, 2.704, 1, 15593.5],
      exactly: false,
      server: new ASBM.Server(
         [null, null, null, null, null, null, null, null],
         Utils.DeepMerge({}, app.officialServerSettings, app.officialSPSettings)
      ),
      results: [[{"Lw":19,"Ld":0}],[{"Lw":23,"Ld":0}],[{"Lw":11,"Ld":0}],[{"Lw":27,"Ld":0}],[{"Lw":15,"Ld":0}],[{"Lw":25,"Ld":0,"wildLevel":103,"TE":0.9404388714733548},{"Lw":26,"Ld":0,"wildLevel":108,"TE":0.8007288070579223},{"Lw":27,"Ld":0,"wildLevel":113,"TE":0.6667918858001503},{"Lw":28,"Ld":0,"wildLevel":119,"TE":0.5382775119617228},{"Lw":29,"Ld":0,"wildLevel":125,"TE":0.4148629148629146},{"Lw":30,"Ld":0,"wildLevel":132,"TE":0.29625044216483926},{"Lw":31,"Ld":0,"wildLevel":138,"TE":0.1821651630811943},{"Lw":32,"Ld":0,"wildLevel":146,"TE":0.07235274089206765}],[{"Lw":24,"Ld":0},{"Lw":25,"Ld":0},{"Lw":26,"Ld":0},{"Lw":27,"Ld":0},{"Lw":28,"Ld":0},{"Lw":29,"Ld":0},{"Lw":30,"Ld":0},{"Lw":31,"Ld":0}],[{"Lw":151,"Ld":0}]]
   };

   // FIXME: Doesn't work!!!
   testCase[1] = {
      //(Baryonyx, Lvl 130, TE: 59.9%): HP: 2129.6 (13, 3); St: 1072.5 (23, 0); Fo: 6300 (18, 0); We: 416 (14, 0); Dm: 223.1% (11, 0); To: 3424.5 (126);
      species: "Baryonyx",
      level: 130,
      wild: false,
      tamed: true,
      bred: false,
      imprint: 0.81,
      stats: [2129.6, 1072.5, 0, 6300, 416, 2.231, 1.2, 3424.5],
      exactly: false,
      server: new ASBM.Server(
         [null, null, null, null, null, null, null, null],
         Utils.DeepMerge({}, app.officialServerSettings, app.officialSPSettings),
         true,
         1
      ),
      results: [[{"Lw":19,"Ld":0}],[{"Lw":23,"Ld":0}],[{"Lw":11,"Ld":0}],[{"Lw":27,"Ld":0}],[{"Lw":15,"Ld":0}],[{"Lw":25,"Ld":0,"wildLevel":103,"TE":0.9404388714733548},{"Lw":26,"Ld":0,"wildLevel":108,"TE":0.8007288070579223},{"Lw":27,"Ld":0,"wildLevel":113,"TE":0.6667918858001503},{"Lw":28,"Ld":0,"wildLevel":119,"TE":0.5382775119617228},{"Lw":29,"Ld":0,"wildLevel":125,"TE":0.4148629148629146},{"Lw":30,"Ld":0,"wildLevel":132,"TE":0.29625044216483926},{"Lw":31,"Ld":0,"wildLevel":138,"TE":0.1821651630811943},{"Lw":32,"Ld":0,"wildLevel":146,"TE":0.07235274089206765}],[{"Lw":24,"Ld":0},{"Lw":25,"Ld":0},{"Lw":26,"Ld":0},{"Lw":27,"Ld":0},{"Lw":28,"Ld":0},{"Lw":29,"Ld":0},{"Lw":30,"Ld":0},{"Lw":31,"Ld":0}],[{"Lw":151,"Ld":0}]]
   };

   for (var i = 0; i < testCase.length; i ++) {
      var multipliers = Utils.DeepMerge({},
         app.officialServerSettings,
         (testCase[i].server.singlePlayer) ? app.officialSPSettings : {},
         testCase[i].server,
         app.myMultipliers[testCase[i].species]);

      app.extractObject = new ASBM.Extraction(
         multipliers,
         testCase[i].stats,
         testCase[i].level,
         testCase[i].wild,
         testCase[i].tamed,
         testCase[i].bred,
         testCase[i].imprint,
         testCase[i].exactly);
      app.extractObject.extractLevels();

      // Display the results
      var tempObj = {};
      console.log("Does it match?");
      console.log(JSON.stringify(testCase[i].results) == JSON.stringify(app.extractObject.results));
      console.log("Expected:");
      console.log(testCase[i].results);
      console.log("Actual:");
      console.log(app.extractObject.results);
      console.log(Utils.DeepMerge(tempObj, app.officialServerSettings, ((testCase[i].server.singlePlayer) ? app.officialSPSettings : {})));
      console.log(tempObj);
      console.log("Server:");
      console.log(Utils.DeepMerge(tempObj, testCase[i].server));
   }
}