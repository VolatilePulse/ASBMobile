import { ConvertValue } from '@/ark';
import { Extractor } from '@/ark/extractor';
import servers from '@/ark/servers_predef';
import testData from '@/ark/test_data';
import { Creature } from '@/data/objects';
import { expect } from 'chai';
import theStore from '@/ui/store';
import { ParseDatabase } from '@/ark/data';
import { readFileSync } from 'fs';


before('load values', () => {
   const valuesJson = readFileSync('public/data/data.json').toString();
   ParseDatabase(valuesJson);
});

describe('values.json', () => {
   it('values.json should include Rex', () => {
      expect(theStore.speciesMultipliers).to.include.keys('Rex');
   });

   it('values.json Rex has multipliers', () => {
      expect(theStore.speciesMultipliers['Rex'][0]).to.be.a('object').with.property('TBHM');
   });
});

describe('extractor', () => {

   it('should extract L1 Rex in official', () => {
      const data = testData[0];
      const server = servers[0];
      const creature = new Creature();

      // Set the properties to prepare for extraction
      creature.wild = (data.mode === 'Wild');
      creature.tamed = (data.mode === 'Tamed');
      creature.bred = (data.mode === 'Bred');
      creature.IB = data.imprint / 100;
      creature.values = data.values.map(ConvertValue);
      creature.serverId = data.serverId;
      creature.level = data.level;
      creature.species = data.species;

      const extractor = new Extractor(creature, server);
      extractor.extract();

      expect(extractor.options).to.have.length.gt(0);
   });
});
