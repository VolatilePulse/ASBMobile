import { PerformTest, TestDefinition } from '@/testing';
import theStore from '@/ui/store';
import { expect } from 'chai';
import { initForExtraction } from '../common/init';

// tslint:disable:no-unused-expression


const L1_REX: TestDefinition = {
   description: 'Simplest possible Rex',
   creature: {
      species: 'Rex', level: 1, imprintingBonus: 0, isTamed: true, inputSource: 'asbm_user_input',
      values: [1100.1, 420, 150, 3000, 500, 125.8, 100, 1550.5],
      currentServer: 'Official Server',
   },
   criteria: [
      { test: 'has_an_option' },
      { test: 'has_option', levelsDom: [0, 0, 0, 0, 0, 0, 0, 0], levelsWild: [0, 0, 0, 0, 0, 0, 0, 0], },
   ],
};


beforeAll(async () => {
   await initForExtraction();
});

describe('values.json', () => {
   it('should include Rex', () => {
      expect(theStore.speciesMultipliers).to.include.keys('Rex');
   });

   it('Rex has multipliers', () => {
      expect(theStore.speciesMultipliers['Rex'][0]).to.be.a('object').with.property('TBHM');
   });
});

describe('extractor', () => {
   it('should extract L1 Rex in official', () => {
      const result = PerformTest(L1_REX, theStore.officialServer);
      expect(result).to.have.property('result').which.equals('pass');
      expect(result.output.options).to.not.be.empty;
   });
});
