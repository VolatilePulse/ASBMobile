"use strict";

import 'w3-css/w3.css';
import withRender from './Extractor.html?style=./Extractor.css';

import * as app from "../../app";
import * as Ark from '../../ark';
import { Server } from '../../ark/multipliers';
import { Extractor } from '../../ark/extractor';


export default withRender({
   props: [],
   template: "#extractor-template",

   data: () => ({
      species: "Rex",
      mode: "Tamed",
      imprint: 0,
      level: "",
      exactly: false,
      stats: new Array(8),
   }),

   computed: {
      speciesNames: () => app.data.speciesNames,
      statImages: () => app.data.statImages,
   },

   methods: {
      extract: PerformExtraction,
      formatFloat: (n, decimalPlaces = 2) => new Intl.NumberFormat({ maximumFractionDigits: decimalPlaces, useGrouping: false }).format(n),
      formatRound: n => new Intl.NumberFormat({ maximumFractionDigits: 0, useGrouping: false }).format(n),
      debugShowOptions: options => options.map(stat => `(${stat.Lw}+${stat.Ld})`).join(','),
      debugStatValue: (i, extractor) => extractor.results[i][0].calculateValue(extractor.m[i], !extractor.isWild, extractor.TE, extractor.IB),
   },
});

// TODO: Prevent user from crashing the app by entering bad data
function PerformExtraction(ui) {
   // Read values from the UI
   var species = ui.species;
   var level = ui.level;
   var isWild = (ui.mode == "Wild");
   var isTamed = (ui.mode == "Tamed");
   var isBred = (ui.mode == "Bred");
   var imprintBonus = ui.imprint / 100;
   var exactly = !!ui.exactly;
   var singlePlayer = !!ui.singlePlayer;

   // Prepare the input values for use with the extractor
   var values = ui.stats.map(Ark.ConvertValue);

   // TODO: This is only temporary until integrated into the Server UI
   // FIXME: Without a permanent server structure, either one or all fail
   app.data.currentServer = new Server([null, null, null, null, null, null, null, null], 1, singlePlayer);

   let multipliers = Ark.GetMultipliers(app.data.currentServer, species);

   let extractObject = new Extractor(multipliers, values, level, isWild, isTamed, isBred, imprintBonus, exactly);
   extractObject.extract();

   // Copy into `app` so they will be displayed
   ui.results = extractObject.results;
   ui.extractor = extractObject;
}
