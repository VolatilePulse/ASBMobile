import { ParseDatabase } from '@/ark/data';
import { TestData } from '@/ark/types';
import * as Servers from '@/servers';
import { PerformTest } from '@/testing';
import theStore from '@/ui/store';
import { expect } from 'chai';
import { readFileSync } from 'fs';


const L1_REX: TestData = {
   tag: 'TE 100%',
   species: 'Rex', level: 1, imprint: 0, mode: 'Tamed',
   values: [1100.1, 420, 150, 3000, 500, 125.8, 100, 1550.5],
   serverId: 'predef:Official Server',
   // tslint:disable-next-line:max-line-length
   results: [[{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }], [{ Lw: 0, Ld: 0 }]],
};


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
      const result = PerformTest(L1_REX);
      expect(result).to.have.property('pass').which.equals(true);
      expect(result.options).to.have.length.gt(0);
   });
});
