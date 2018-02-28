/**
 * @fileOverview Contains necessary initialization of variables and objects as well as the overall webapp object
 */

"use strict";

const HEALTH = 0, STAMINA = 1, OXYGEN = 2, FOOD = 3, WEIGHT = 4, DAMAGE = 5, SPEED = 6, TORPOR = 7;
const PRE_TE = -1, PRE_IB = -2;

const STAT_B = 0, STAT_IW = 1, STAT_ID = 2, STAT_TA = 3, STAT_TM = 4;
const SERVER_TAM = 0, SERVER_TMM = 1, SERVER_IDM = 2, SERVER_IWM = 3;

const DB_VER_M = 1, DB_VER_L = 1;

// Some test data
var testData = [
   {
      tag: "Level Tamed 1 Rex 100% TE",
      species: "Rex", level: 1, imprint: 0, exactly: false, mode: "Tamed", singlePlayer: false,
      stats: [1100.1, 420, 150, 3000, 500, 125.8, 100, 1550.5],
      results: [[{"Lw":0,"Ld":0}],[{"Lw":0,"Ld":0}],[{"Lw":0,"Ld":0}],[{"Lw":0,"Ld":0}],[{"Lw":0,"Ld":0}],[{"Lw":0,"Ld":0,"wildLevel":0,"TE":1}],[{"Lw":0,"Ld":0}],[{"Lw":0,"Ld":0}]],
   },
   {
      tag: "Level Tamed 8 Rex TE 0% exactly",
      species: "Rex", level: 8, imprint: 0, exactly: true, mode: "Tamed", singlePlayer: false,
      stats: [1320.1, 462, 165, 3300, 510, 112, 100, 2201.5],
      results: [[{"Lw":1,"Ld":0}],[{"Lw":1,"Ld":0}],[{"Lw":1,"Ld":0}],[{"Lw":1,"Ld":0}],[{"Lw":1,"Ld":0}],[{"Lw":0,"Ld":0,"wildLevel":6,"TE":0.2655055225148689},{"Lw":1,"Ld":0,"wildLevel":7,"TE":0}],[{"Lw":1,"Ld":0},{"Lw":2,"Ld":0}],[{"Lw":7,"Ld":0}]],
   },
   {
      tag: "Level Tamed 8 Rex TE 100% (99.94%)",
      species: "Rex", level: 8, imprint: 0, exactly: false, mode: "Tamed", singlePlayer: false,
      stats: [1320.1, 462, 165, 3300, 510, 131.7, 100, 2201.5],
      results: [[{"Lw":1,"Ld":0}],[{"Lw":1,"Ld":0}],[{"Lw":1,"Ld":0}],[{"Lw":1,"Ld":0}],[{"Lw":1,"Ld":0}],[{"Lw":1,"Ld":0,"wildLevel":5,"TE":1},{"Lw":2,"Ld":0,"wildLevel":5,"TE":0.7138694638694625}],[{"Lw":0,"Ld":0},{"Lw":1,"Ld":0}],[{"Lw":7,"Ld":0}]],
   },
   {
      tag: "Level 152 Rex 39% imprint",
      species: "Rex", level: 152, imprint: 39, exactly: false, mode: "Tamed", singlePlayer: false,
      stats: [5280.1, 1386.0, 315, 11100, 650, 270.4, 100, 15593.5],
      results: [[{"Lw":19,"Ld":0}],[{"Lw":23,"Ld":0}],[{"Lw":11,"Ld":0}],[{"Lw":27,"Ld":0}],[{"Lw":15,"Ld":0}],[{"Lw":25,"Ld":0,"wildLevel":103,"TE":0.9404388714733548},{"Lw":26,"Ld":0,"wildLevel":108,"TE":0.8007288070579223},{"Lw":27,"Ld":0,"wildLevel":113,"TE":0.6667918858001503},{"Lw":28,"Ld":0,"wildLevel":119,"TE":0.5382775119617228},{"Lw":29,"Ld":0,"wildLevel":125,"TE":0.4148629148629146},{"Lw":30,"Ld":0,"wildLevel":132,"TE":0.29625044216483926},{"Lw":31,"Ld":0,"wildLevel":138,"TE":0.1821651630811943},{"Lw":32,"Ld":0,"wildLevel":146,"TE":0.07235274089206765}],[{"Lw":24,"Ld":0},{"Lw":25,"Ld":0},{"Lw":26,"Ld":0},{"Lw":27,"Ld":0},{"Lw":28,"Ld":0},{"Lw":29,"Ld":0},{"Lw":30,"Ld":0},{"Lw":31,"Ld":0}],[{"Lw":151,"Ld":0}]],
   },
   {
      tag: "Baryonx - Level 130 (Single Player)",
      species: "Baryonyx", level: 130, imprint: 81, exactly: false, mode: "Tamed", singlePlayer: true,
      stats: [2129.6, 1072.5, 0, 6300, 416, 223.1, 120, 3424.5],
      results: [[{"Lw":13,"Ld":3}],[{"Lw":23,"Ld":0}],[{"Lw":-1,"Ld":0}],[{"Lw":18,"Ld":0}],[{"Lw":14,"Ld":0}],[{"Lw":7,"Ld":0,"wildLevel":84,"TE":0.9859374999999998},{"Lw":8,"Ld":0,"wildLevel":87,"TE":0.8803030303030301},{"Lw":9,"Ld":0,"wildLevel":91,"TE":0.7808823529411762},{"Lw":10,"Ld":0,"wildLevel":94,"TE":0.6871428571428567},{"Lw":11,"Ld":0,"wildLevel":97,"TE":0.5986111111111109},{"Lw":12,"Ld":0,"wildLevel":100,"TE":0.5148648648648646},{"Lw":13,"Ld":0,"wildLevel":103,"TE":0.43552631578947343},{"Lw":14,"Ld":0,"wildLevel":107,"TE":0.36025641025640986},{"Lw":15,"Ld":0,"wildLevel":110,"TE":0.28874999999999984},{"Lw":16,"Ld":0,"wildLevel":113,"TE":0.22073170731707337},{"Lw":17,"Ld":0,"wildLevel":117,"TE":0.1559523809523805},{"Lw":18,"Ld":0,"wildLevel":120,"TE":0.09418604651162787},{"Lw":19,"Ld":0,"wildLevel":124,"TE":0.03522727272727233}],[{"Lw":-1,"Ld":0}],[{"Lw":126,"Ld":0}]],
   },
]

/**
 * @description Initializes all variables that require the page to finish loading
 */
function Init() {
   ASBM.UI.Servers.Create();
   ASBM.UI.Extractor.Create();
   ASBM.UI.Tester.Create();
   app = ASBM.UI.CreateApp();

   Utils.AsyncFileRead("values.json")
      .then(json => Data.LoadValues(json))
      .then(() => ASBM.UI.DropDownInit())
      //.then(Utils.DelayFunction(5000)) // demo delayed loading
      .then(() => app.dataLoaded = true) // Reveal the main form once loading is complete
      .catch(error => console.log("Load error: " + error));
   
   // Testing out the new (Vue)Creature class and copy assignment
   // Can be removed (Demonstration purposes only)
   var stuff1 = new ASBM.VueCreature();
   var stuff2 = new ASBM.Creature();
   console.log(JSON.stringify(stuff1));
   console.log(JSON.stringify(stuff2));
   stuff2.stats[2] = new ASBM.Stat(2,10);
   stuff2.species = "Rex";
   stuff1.copyCreature(stuff2);
   console.log(JSON.stringify(stuff1));
   stuff1.clear();
   console.log(JSON.stringify(stuff1));
};

function InsertTestData(data) {
   Object.assign(app.$refs.extractor, data);
}

// The app state
var app = null;

// Register Service Worker
if (false && "serviceWorker" in navigator) { // FIXME: Disabled service worker entirely for now
   // Service worker must be added during the load event
   window.addEventListener("load", function () {

      // Attempt to register our Service work
      navigator.serviceWorker.register("/ServiceWorker.js")
         .then(registration => console.log("ServiceWorker registration successful with scope: ", registration.scope))
         .catch(err => console.log("ServiceWorker registration failed: ", err));
   });
}

// Adds all necessary scripts
// TODO: Consider performance benefits against cleaner HTML
// PWA Audit recommends against using document.write to shave some loading time off of the overall app
document.write(
   '<script type="application/javascript" src="src/ASBM/Creature.js"></script>' +
   '<script type="application/javascript" src="src/ASBM/Extractor.js"></script>' +
   '<script type="application/javascript" src="src/ASBM/Library.js"></script>' +
   '<script type="application/javascript" src="src/ASBM/Multipliers.js"></script>' +
   '<script type="application/javascript" src="src/ASBM/UI.js"></script>' +
   '<script type="application/javascript" src="src/ASBM/UI/extractor.js"></script>' +
   '<script type="application/javascript" src="src/ASBM/UI/tester.js"></script>' +
   '<script type="application/javascript" src="src/ASBM/UI/servers.js"></script>' +
   '<script type="application/javascript" src="src/Data.js"></script>' +
   '<script type="application/javascript" src="src/Utils.js"></script>' +
   '<script type="application/javascript" src="src/Ark.js"></script>'
);
document.addEventListener("DOMContentLoaded", Init);
