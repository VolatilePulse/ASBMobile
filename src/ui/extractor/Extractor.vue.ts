import Vue from 'vue';
import Component from 'vue-class-component';

import WithRender from './Extractor.html?style=./Extractor.css';

import * as app from "../../app";
import * as Ark from '../../ark';
import { PRE_IB, statNames } from '../../consts';
import { FormatNumber, FilledArray, DeepCopy } from '../../utils';
import { Extractor } from '../../ark/extractor';

import testData from '../../ark/test_data';
import { VueCreature } from '@/ark/creature';
import theStore from '@/ui/store';


@WithRender
@Component({
   name: "extractor",
})
export default class ExtractorComponent extends Vue {
   store = theStore;

   testData = testData;
   statNames = statNames;

   autoExtract = false;

   mode = "Tamed";
   imprint = 0;
   values = FilledArray(8, () => undefined);

   extractor: Extractor = null;


   range(n) { return Array.from({ length: n }, (x, i) => i); }
   formatFloat(n) { return FormatNumber(n, 2); }
   formatRound(n) { return FormatNumber(n, 0); }

   extract() {
      let creature = this.store.tempCreature;

      // Convert properties that couldn't be bound directly to creature
      creature.wild = (this.mode == "Wild");
      creature.tamed = (this.mode == "Tamed");
      creature.bred = (this.mode == "Bred");
      creature.IB = Ark.ConvertValue(this.imprint, PRE_IB);
      creature.values = DeepCopy(this.values.map(Ark.ConvertValue)); // convert values, then create a clean un-observed copy

      this.extractor = new Extractor(creature);
      this.extractor.extract();
   }

   insertTestData(test) {
      // Copy some fields from the test directly into the extractor
      this.store.tempCreature.species = test.species;
      this.store.tempCreature.level = test.level;

      // Copy some fields into the UI, because they're converted later
      this.imprint = test.imprint;
      this.mode = test.mode;

      // Take a copy of the stat values so they can be modified by the user
      this.values = Array.from(test.values);

      // Set the current server to the one specified by the test
      this.store.tempCreature.serverName = test.serverName;
   }

   // Nasty debug-only methods to show stats and their options
   debugShowOptions(options) {
      return (options && options['length']) ? options.map(stat => `(${stat.Lw}+${stat.Ld})`).join(',') : "-none-";
   }

   debugStatValue(i) {
      let creature = this.store.tempCreature;
      if (!creature.m) return '-';
      return creature.stats[i][0].calculateValue(creature.m[i], !creature.wild, creature.TE, creature.IB);
   }
}
