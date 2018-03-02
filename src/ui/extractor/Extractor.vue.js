"use strict";

import 'w3-css/w3.css';
import withRender from './Extractor.html?style=./Extractor.css';

import * as app from "../../app";
import * as Ark from '../../ark';
import { Extractor } from '../../ark/extractor';

import testData from '../../test_data';
import { PRE_IB } from '../../consts';


export default withRender({
   props: [],
   template: "#extractor-template",

   data: () => ({
      testData: testData,

      autoExtract: false,

      species: app.data.tempCreature.species,
      mode: app.data.tempCreature.wild ? "Wild" : app.data.tempCreature.tamed ? "Tamed" : "Bred",
      level: app.data.tempCreature.level,
      imprint: Ark.DisplayValue(app.data.tempCreature.IB, PRE_IB),
      exactly: app.data.tempCreature.exactly,
      values: app.data.tempCreature.values.map(Ark.DisplayValue),

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
         var multipliers = Ark.GetMultipliers(this.creature.serverName, this.creature.species);
         return (this.values[i]) ? this.creature.stats[i][0].calculateValue(multipliers[i], !this.extractor.wild, this.extractor.TE, this.extractor.IB) : 0;
      }
   },

   // Not sure what this is used for, but would only update after choosing another test case
   // Also, it clears the entire creature everytime I switch views.
   created() {
      //this.extractor = new Extractor(app.data.tempCreature);
      this.creature = app.data.tempCreature;
   }
});

function InsertTestData(test) {
   // Copy some fields from the test into the extractor
   for (let field of ['species', 'level', 'exactly'])
      this.creature[field] = test[field];
   for (let field of ['imprint', 'mode'])
      this[field] = test[field];

   this.values = Array.from(test.values);

   // Set the current server to the one specified by the test
   this.creature.serverName = test.serverName;
}

function PerformExtraction() {

   // Convert properties that couldn't be bound directly to creature
   this.creature.wild = (this.mode == "Wild");
   this.creature.tamed = (this.mode == "Tamed");
   this.creature.bred = (this.mode == "Bred");
   this.creature.IB = Ark.ConvertValue(this.imprint, PRE_IB);
   this.creature.exactly = !!this.exactly;
   this.creature.values = this.values.map(Ark.ConvertValue);

   this.extractor = new Extractor(this.creature);
   this.extractor.extract();
}
