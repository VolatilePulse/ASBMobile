"use strict";

import 'w3-css/w3.css';
import withRender from './Extractor.html?style=./Extractor.css';

import * as app from "../../app";
import * as Ark from '../../ark';
import { Extractor } from '../../ark/extractor';

import testData from '../../test_data';

export default withRender({
   props: [],
   template: "#extractor-template",

   data: () => ({
      testData: testData,

      species: "Rex",
      mode: "Tamed",
      imprint: 0,
      level: "",
      exactly: false,
      stats: new Array(8),

      extractor: {},
   }),

   computed: {
      speciesNames: () => app.data.speciesNames,
      statImages: () => app.data.statImages,
   },

   methods: {
      extract: PerformExtraction,
      insertTestData: (data) => {Object.assign(this.extractor, data);},
      formatFloat: (n, decimalPlaces = 2) => new Intl.NumberFormat({ maximumFractionDigits: decimalPlaces, useGrouping: false }).format(n),
      formatRound: n => new Intl.NumberFormat({ maximumFractionDigits: 0, useGrouping: false }).format(n),
      debugShowOptions: options => options.map(stat => `(${stat.Lw}+${stat.Ld})`).join(','),
      debugStatValue: (i, extractor) => extractor.results[i][0].calculateValue(Ark.GetMultipliers(extractor.server, extractor.species)[i], !extractor.wild, extractor.TE, extractor.IB),
   },
});

// TODO: Prevent user from crashing the app by entering bad data
function PerformExtraction(ui) {
   // Change the currentServer to the Test Data's server
   app.data.currentServer = ui.server;

   // Set the vueCreature properties to prepare for extraction
   app.data.vueCreature.wild = (ui.mode == "Wild");
   app.data.vueCreature.tamed = (ui.mode == "Tamed");
   app.data.vueCreature.bred = (ui.mode == "Bred");
   app.data.vueCreature.IB = ui.imprint / 100;
   app.data.vueCreature.exactly = !!ui.exactly;
   app.data.vueCreature.values = ui.stats.map(Ark.ConvertValue);
   app.data.vueCreature.server = ui.server;
   app.data.vueCreature.level = ui.level;
   app.data.vueCreature.species = ui.species;

   let extractObject = new Extractor(app.data.vueCreature);
   extractObject.extract();

   // Copy into `app` so they will be displayed
   ui.results = app.data.vueCreature.stats;
   ui.extractor = app.data.vueCreature;
}
