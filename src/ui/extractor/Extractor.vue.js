// @ts-ignore
import withRender from './Extractor.html?style=./Extractor.css';

import * as app from "../../app";
import * as Ark from '../../ark';
import { PRE_IB, statNames } from '../../consts';
import { FormatNumber } from '../../utils';
import { Extractor } from '../../ark/extractor';

import testData from '../../test_data';


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

      statNames: statNames,
   }),

   computed: {
      speciesNames: () => app.data.speciesNames,
      statImages: () => app.data.statImages,
      devMode: () => app.data.status.devMode,

      currentMultipliers() { return Ark.GetMultipliers(this.creature.serverName, this.creature.species); },
   },

   methods: {
      range(n) { return Array.from({ length: n }, (x, i) => i); },
      extract: PerformExtraction,
      insertTestData: InsertTestData,
      formatFloat(n) { return FormatNumber(n, 2); },
      formatRound(n) { return FormatNumber(n, 0); },

      // Nasty debug-only methods to show stats and their options
      debugShowOptions: options => (options && options['length']) ? options.map(stat => `(${stat.Lw}+${stat.Ld})`).join(',') : "-none-",
      debugStatValue(i) {
         var multipliers = this.currentMultipliers;
         return this.creature.stats[i][0].calculateValue(multipliers[i], !this.extractor.wild, this.extractor.TE, this.extractor.IB);
      }
   },

   created() {
      this.creature = app.data.tempCreature;
   }
});

function InsertTestData(test) {
   // Copy some fields from the test directly into the extractor
   this.creature.species = test.species;
   this.creature.level = test.level;

   // Copy some fields into the UI, because they're converted later
   this.imprint = test.imprint;
   this.mode = test.mode;
   this.exactly = test.exactly;

   // Take a copy of the stat values so they can be modified by the user
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

   console.log(JSON.stringify(this.extractor.c.stats));
}
