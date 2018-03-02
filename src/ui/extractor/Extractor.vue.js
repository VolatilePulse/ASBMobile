"use strict";

import 'w3-css/w3.css';
import withRender from './Extractor.html?style=./Extractor.css';

import * as app from "../../app";
import * as Ark from '../../ark';
import { Extractor } from '../../ark/extractor';

import testData from '../../test_data';
import { FilledArray } from '../../utils';


export default withRender({
   props: [],
   template: "#extractor-template",

   data: () => ({
      testData: testData,

      autoExtract: false,

      mode: "Tamed",
      imprint: 0,
      exactly: false,
      values: [],

      extractor: {},
      creature: {},
   }),

   computed: {
      speciesNames: () => app.data.speciesNames,
      statImages: () => app.data.statImages,
   },

   methods: {
      extract: PerformExtraction,
      insertTestData: InsertTestData,
      formatFloat: (n, decimalPlaces = 2) => new Intl.NumberFormat({ maximumFractionDigits: decimalPlaces, useGrouping: false }).format(n),
      formatRound: n => new Intl.NumberFormat({ maximumFractionDigits: 0, useGrouping: false }).format(n),
      debugShowOptions: options => (options && options['length']) ? options.map(stat => `(${stat.Lw}+${stat.Ld})`).join(',') : "-none-",
      debugStatValue(i) {
         var multipliers = Ark.GetMultipliers(app.data.currentServerName, this.extractor.species);
         return this.creature.stats[i][0].calculateValue(multipliers[i], !this.extractor.wild, this.extractor.TE, this.extractor.IB);
      }
   },

   created() {
      this.extractor = new Extractor(app.data.tempCreature);
      this.creature = this.extractor.c;
   }
});

function InsertTestData(test) {
   // Copy some fields from the test into the extractor
   for (let field of ['species', 'level', 'imprint', 'exactly', 'mode'])
      this.creature[field] = test[field];

   this.values = Array.from(test.values);

   // Set the current server to the one specified by the test
   this.creature.serverName = test.serverName;
}

function PerformExtraction() {
   // Convert properties that couldn't be bound directly to creature
   this.creature.wild = (this.mode == "Wild");
   this.creature.tamed = (this.mode == "Tamed");
   this.creature.bred = (this.mode == "Bred");
   this.creature.IB = this.imprint / 100;
   this.creature.exactly = !!this.exactly;
   this.creature.values = this.values.map(Ark.ConvertValue);

   this.creature.stats = FilledArray(8, () => []); // FIXME: Exctractor should do this
   this.extractor.extract();

   console.log(JSON.stringify(this.extractor.c.stats));
}
