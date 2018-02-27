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
            runTest: data => ASBM.UI.Tester.RunTest(data),
            runAllTests: ASBM.UI.Tester.RunAllTests,
            openResults: function (index) { this.openTestIndex = (this.openTestIndex != index) ? index : null; },
            isPass: function (index) { return this.testResults[index] && this.testResults[index].pass; },
            isFail: function (index) { return this.testResults[index] && !this.testResults[index].pass; },
         },
      });
   },

   RunTest(index) {
      let ui = app.$refs.tester;
      let results = ASBM.UI.Tester.PerformTest(ui.testData[index]);
      Vue.set(ui.testResults, index, results);
      ui.openTestIndex = index;
   },

   async RunAllTests() {
      let ui = app.$refs.tester;

      let data;
      let failFound = false;
      for (let index = 0; index < ui.testData.length; index++) {
         let results = ASBM.UI.Tester.PerformTest(ui.testData[index]);
         Vue.set(ui.testResults, index, results);

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

      // TODO: This is only temporary until integrated into the Server UI
      app.currentServer = new ASBM.Server([null,null,null,null,null,null,null,null], 1, singlePlayer);

      let multipliers = Ark.GetMultipliers(app.currentServer, data.species);

      let extractObject = new ASBM.Extractor(multipliers, values, data.level, isWild, isTamed, isBred, imprintBonus, exactly);
      extractObject.extract();

      let pass = JSON.stringify(data['results']) == JSON.stringify(extractObject.results);

      return { pass: pass, results: extractObject.results };
   },
};
