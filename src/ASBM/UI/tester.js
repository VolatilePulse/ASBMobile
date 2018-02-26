"use strict";

var ASBM = ASBM || {};
ASBM.UI = ASBM.UI || {};

ASBM.UI.Tester = {
   Create() {
      return Vue.component("tester", {
         props: [],
         template: "#tester-template",
         data: () => ({
            testData: testData,
            testResults: [],
         }),
         computed: {
            speciesNames: () => app.speciesNames,
            statImages: () => app.statImages,
         },
         methods: {
            runTest: data => ASBM.UI.Tester.RunTest(data),
            runAllTests: ASBM.UI.Tester.RunAllTests,
         },
      });
   },

   RunTest(data) {

   },

   RunAllTests() {

   },
};
