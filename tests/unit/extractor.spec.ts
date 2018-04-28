import { ParseDatabase } from '@/ark/data';
import testData from '@/ark/test_data';
import * as Servers from '@/servers';
import { PerformTest } from '@/testing';
import theStore from '@/ui/store';
import { expect } from 'chai';
import { readFileSync } from 'fs';


before('load values', () => {
   const valuesJson = readFileSync('public/data/data.json').toString();
   ParseDatabase(valuesJson);
   Servers.initialise();
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
      const result = PerformTest(data);

      expect(result).to.have.property('pass').which.equals(true);
      expect(result.options).to.have.length.gt(0);
   });
});
