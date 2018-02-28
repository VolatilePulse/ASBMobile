"use strict";

var ASBM = ASBM || {};
ASBM.UI = ASBM.UI || {};

/** @namespace ASBM.UI */
ASBM.UI.Tester = {
   Create() {
      return Vue.component("tester", {
         props: [],
         template: "#tester-template",

         data: () => ({
            testResults: [],
            openTestIndex: null,
         }),

         computed: {
            testData: () => app.testData,
            speciesNames: () => app.speciesNames,
            statImages: () => app.statImages,
         },

         methods: {
            runAllTests: ASBM.UI.Tester.RunAllTests,
            runTest: ASBM.UI.Tester.RunTest,
            openResults(index) { this.openTestIndex = (this.openTestIndex != index) ? index : null; },
            isPass(index) { return this.testResults[index] && this.testResults[index].pass; },
            isFail(index) { return this.testResults[index] && !this.testResults[index].pass; },
         },
      });
   },

   async RunTest(index) {
      let ui = app.$refs.tester;

      // Clear out existing pass/fail
      Vue.set(ui.testResults, index, undefined);
      await Utils.Delay(100); // allow the UI to update

      let results = ASBM.UI.Tester.PerformTest(ui.testData[index]);
      Vue.set(ui.testResults, index, results);
      ui.openTestIndex = index;
   },

   async RunAllTests() {
      let ui = app.$refs.tester;

      // Clear out existing pass/fail
      for (let index = 0; index < ui.testData.length; index++) {
         Vue.set(ui.testResults, index, undefined);
      }

      await Utils.Delay(100); // allow the UI to update

      let data;
      let failFound = false;
      for (let index = 0; index < ui.testData.length; index++) {
         let results = ASBM.UI.Tester.PerformTest(ui.testData[index]);
         Vue.set(ui.testResults, index, results);

         // Open up the first failure found
         if (!failFound && results.pass == false) {
            ui.openTestIndex = index;
            failFound = true;
         }

         await Utils.Delay(100); // unblock the browser for a moment
      }
   },

   PerformTest(data) {
      var isWild = (data.mode == "Wild");
      var isTamed = (data.mode == "Tamed");
      var isBred = (data.mode == "Bred");
      var imprintBonus = data.imprint / 100;
      var exactly = !!data.exactly;
      var singlePlayer = !!data.singlePlayer;

      // Prepare the input values for use with the extractor
      let values = data.stats.map(Ark.ConvertValue);

      // TODO: Allow tests to specify overridden multipliers
      // Tests should always use a custom server, not the user's current server
      let tempServer = new ASBM.Server([null,null,null,null,null,null,null,null], 1, singlePlayer);

      let multipliers = Ark.GetMultipliers(app.currentServer, data.species);

      // Set the vueCreature properties to prepare for extraction
      app.vueCreature = new ASBM.VueCreature();
      app.vueCreature.wild = isWild;
      app.vueCreature.tamed = isTamed;
      app.vueCreature.bred = isBred;
      app.vueCreature.IB = imprintBonus;
      app.vueCreature.exactly = exactly;
      app.vueCreature.values = values;
      app.vueCreature.server = tempServer;
      app.vueCreature.level = data.level;
      app.vueCreature.species = data.species;

      let extractObject = new ASBM.Extractor(app.vueCreature);
      extractObject.extract();

      let pass = JSON.stringify(data['results']) == JSON.stringify(app.vueCreature.stats);

      return { pass: pass, results: app.vueCreature.stats };
   },
};
