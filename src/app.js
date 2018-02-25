/**
 * @fileOverview Contains necessary initialization of variables and objects as well as the overall webapp object
 */

"use strict";

const HEALTH = 0, STAMINA = 1, OXYGEN = 2, FOOD = 3, WEIGHT = 4, DAMAGE = 5, SPEED = 6, TORPOR = 7;
const STAT_B = 0, STAT_IW = 1, STAT_ID = 2, STAT_TA = 3, STAT_TM = 4;
const SERVER_TAM = 0, SERVER_TMM = 1, SERVER_IDM = 2, SERVER_IWM = 3;
const DB_VER_M = 1, DB_VER_L = 1;

// Some dummy data, including your own... (click to insert into the form)
// I haven't included the expected results in here, but they could be moved here easily
var dummyData = [
   {
      tag: "Level Tamed 1 Rex",
      species: "Rex", level: 1, imprint: 0, exactly: false, mode: "Tamed",
      stats: [1100.1, 420, 150, 3000, 500, 125.8, 100, 1550.5],
   },
   {
      tag: "Level Tamed 8 Rex TE 0% exactly",
      species: "Rex", level: 8, imprint: 0, exactly: true, mode: "Tamed",
      stats: [1320.1, 462, 165, 3300, 510, 112, 100, 2201.5],
   },
   {
      tag: "Level Tamed 8 Rex TE 100% (99.94%)",
      species: "Rex", level: 8, imprint: 0, exactly: false, mode: "Tamed",
      stats: [1320.1, 462, 165, 3300, 510, 131.7, 100, 2201.5],
   },
   {
      tag: "Level 152 Rex 39% imprint",
      species: "Rex", level: 152, imprint: 39, exactly: false, mode: "Tamed",
      stats: [5280.1, 1386.0, 315, 11100, 650, 270.4, 100, 15593.5],
   },
   {
      tag: "...a Baryonx",
      species: "Baryonyx", level: 130, imprint: 81, exactly: false, mode: "Tamed",
      stats: [2129.6, 1072.5, 0, 6300, 416, 223.1, 120, 3424.5],
   },
]

/**
 * @description Initializes all variables that require the page to finish loading
 */
function Init() {
   app = new Vue({
      el: '#app',
      data: {
         dataLoaded: false,

         statImages: [
            "Health.png", "Stamina.png", "Oxygen.png", "Food.png",
            "Weight.png", "Melee.png", "Speed.png", "Torpor.png",
         ],

         speciesDB: {},
         officialServerSettings: {},
         officialSPSettings: {},
         extractObject: {},
         myMultipliers: {},
         multipliersDB: new Dexie("Multipliers"),

         dummyData: dummyData,

         speciesNames: [],

         extractor: {
            species: "Rex",
            mode: "Tamed",
            imprint: 0,
            exactly: false,
            stats: new Array(8),
            results: Array.apply(null, Array(10)).map(function () { return { Lw: "", Ld: "", optionsText: "" } }),
            // ^ above line creates placeholders for stat results
         },
      },
      computed: {
      },
      methods: {
         extract: ASBM.UI.Extract,
         testData: Testing,
         insertDummyData: InsertDummyData,
         debugShowOptions: options => options.map(stat => `(${stat.Lw}+${stat.Ld})`).join(','),
      },
   });

   Utils.AsyncFileRead("values.json")
      .then(json => Data.LoadValues(json))
      .then(() => ASBM.UI.DropDownInit())
      .then(() => app.dataLoaded = true) // Reveal the main form once loading is complete
      .catch(error => console.log("Load error: " + error));
};

function InsertDummyData(data) {
   Object.assign(app.extractor, data);
}

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
      results: [[{ "Lw": 19, "Ld": 0 }], [{ "Lw": 23, "Ld": 0 }], [{ "Lw": 11, "Ld": 0 }], [{ "Lw": 27, "Ld": 0 }], [{ "Lw": 15, "Ld": 0 }], [{ "Lw": 25, "Ld": 0, "wildLevel": 103, "TE": 0.9404388714733548 }, { "Lw": 26, "Ld": 0, "wildLevel": 108, "TE": 0.8007288070579223 }, { "Lw": 27, "Ld": 0, "wildLevel": 113, "TE": 0.6667918858001503 }, { "Lw": 28, "Ld": 0, "wildLevel": 119, "TE": 0.5382775119617228 }, { "Lw": 29, "Ld": 0, "wildLevel": 125, "TE": 0.4148629148629146 }, { "Lw": 30, "Ld": 0, "wildLevel": 132, "TE": 0.29625044216483926 }, { "Lw": 31, "Ld": 0, "wildLevel": 138, "TE": 0.1821651630811943 }, { "Lw": 32, "Ld": 0, "wildLevel": 146, "TE": 0.07235274089206765 }], [{ "Lw": 24, "Ld": 0 }, { "Lw": 25, "Ld": 0 }, { "Lw": 26, "Ld": 0 }, { "Lw": 27, "Ld": 0 }, { "Lw": 28, "Ld": 0 }, { "Lw": 29, "Ld": 0 }, { "Lw": 30, "Ld": 0 }, { "Lw": 31, "Ld": 0 }], [{ "Lw": 151, "Ld": 0 }]]
   };

   // FIXME: Works with the exception of damage. Likely related to the recursive function
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
      results: [[{ "Lw": 13, "Ld": 3 }], [{ "Lw": 23, "Ld": 0 }], [{ "Lw": -1, "Ld": 0 }], [{ "Lw": 18, "Ld": 0 }], [{ "Lw": 14, "Ld": 0 }], [], [{ "Lw": -1, "Ld": 0 }], [{ "Lw": 126, "Ld": 0 }]]
   };

   // Loops the Test Cases and outputs to the console the results
   for (var i = 0; i < testCase.length; i++) {
      var multipliers = Utils.DeepMerge({}, app.officialServerSettings, (testCase[i].server.singlePlayer) ? app.officialSPSettings : {}, testCase[i].server, app.myMultipliers[testCase[i].species]);

      app.extractObject = new ASBM.Extractor(
         multipliers,
         testCase[i].stats,
         testCase[i].level,
         testCase[i].wild,
         testCase[i].tamed,
         testCase[i].bred,
         testCase[i].imprint,
         testCase[i].exactly);
      app.extractObject.extract();

      // Display the results
      console.log("Does it match?");
      console.log(JSON.stringify(testCase[i].results) == JSON.stringify(app.extractObject.results));
      console.log("Expected:");
      console.log(testCase[i].results);
      console.log("Actual:");
      console.log(app.extractObject.results);
      //console.log(JSON.stringify(app.extractObject.results));
      console.log("Server:");
      console.log(Utils.DeepMerge({}, app.officialServerSettings, ((testCase[i].server.singlePlayer) ? app.officialSPSettings : {}), testCase[i].server));
   }
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
   '<script type="application/javascript" src="src/Data.js"></script>' +
   '<script type="application/javascript" src="src/Utils.js"></script>' +
   '<script type="application/javascript" src="src/Ark.js"></script>'
);
document.addEventListener("DOMContentLoaded", Init);
