import { convertCreature, convertServer, LowLevelParser, multiplierArrayToObjectValues } from '@/ark/import/asb_xml';
import { expect } from 'chai';
import { readFileSync } from 'fs';
import { decodeBuffer } from '../common/decoding';
import { initForExtraction } from '../common/init';

// tslint:disable:no-unused-expression


beforeAll(async () => {
   await initForExtraction();
});

describe('low-level ASB library importer', () => {
   let result: any;

   beforeAll(() => {
      const buffer = readFileSync('tests/unit/test-asb-library.xml');
      const content = decodeBuffer(buffer);
      const parser = new LowLevelParser();
      parser.acceptData(content);
      result = parser.finish();
   });

   it('has the right shape', () => {
      expect(result).to.be.an('object').and.have.property('CreatureCollection');
      expect(result.CreatureCollection).to.have.property('creatures').to.be.an('array');
      expect(result.CreatureCollection).to.have.property('players').to.be.an('array');
      expect(result.CreatureCollection).to.have.property('multipliers').to.be.an('array');
   });

   it('should contain three players', () => {
      expect(result.CreatureCollection.players).has.length(3);
   });

   it('should have two Spino and an Argy', () => {
      expect(result.CreatureCollection.creatures).has.length(3);
      expect(result.CreatureCollection.creatures[0].species).to.equal('Spino');
      expect(result.CreatureCollection.creatures[1].species).to.equal('Spino');
      expect(result.CreatureCollection.creatures[2].species).to.equal('Argentavis');
   });

   it('should have correct server settings', () => {
      expect(result.CreatureCollection.singlePlayerSettings).to.be.a('boolean').and.be.true;
      expect(result.CreatureCollection.maxServerLevel).to.be.a('number').and.equal(450);
      expect(result.CreatureCollection.multipliers).to.have.length(8);
      expect(result.CreatureCollection.multipliers[0]).to.be.an('array').and.have.length(4);
      expect(result.CreatureCollection.multipliers[0][0]).to.be.a('number').and.equal(0.14);
      expect(result.CreatureCollection.multipliers[0][1]).to.be.a('number').and.equal(0.44);
      expect(result.CreatureCollection.multipliers[0][2]).to.be.a('number').and.equal(0.2);
      expect(result.CreatureCollection.multipliers[0][3]).to.be.a('number').and.equal(1);
      expect(result.CreatureCollection.multipliers[7][0]).to.be.a('number').and.equal(1);
      expect(result.CreatureCollection.multipliers[7][1]).to.be.a('number').and.equal(1);
      expect(result.CreatureCollection.multipliers[7][2]).to.be.a('number').and.equal(1);
      expect(result.CreatureCollection.multipliers[7][3]).to.be.a('number').and.equal(1);
   });

   it('should have data with the correct types', () => {
      expect(result.CreatureCollection.creatures[0]).to.have.property('levelsWild').which.is.an('array').of.length(8);
      expect(result.CreatureCollection.creatures[0].levelsWild[0]).to.be.a('number');
      expect(result.CreatureCollection.creatures[0]).to.have.property('levelsDom').which.is.an('array').of.length(8);
      expect(result.CreatureCollection.creatures[0].levelsDom[0]).to.be.a('number');
      expect(result.CreatureCollection.creatures[0]).to.have.property('colors').which.is.an('array').of.length(6);
      expect(result.CreatureCollection.creatures[0].colors[0]).to.be.a('number');
      expect(result.CreatureCollection.creatures[0]).to.have.property('tags').which.is.an('array').of.length(2);
      expect(result.CreatureCollection.creatures[0].tags[0]).to.be.a('string');
      expect(result.CreatureCollection.creatures[0].tamingEff).to.be.a('number');
      expect(result.CreatureCollection.creatures[0].generation).to.be.a('number');
      expect(result.CreatureCollection.creatures[0].neutered).to.be.a('boolean');
      expect(result.CreatureCollection.creatures[0].mutationCounter).to.be.a('number');
   });

});

describe('creature output conversion', () => {
   let result: any;

   beforeAll(() => {
      // Read the test library
      const buffer = readFileSync('tests/unit/test-asb-library.xml');
      const content = decodeBuffer(buffer);
      const parser = new LowLevelParser();
      parser.acceptData(content);
      result = parser.finish();
   });

   // Check time stamps
   describe('Steve the Spino', () => {
      it('should have general properties', () => {
         const creature = convertCreature(result.CreatureCollection.creatures[1]);

         expect(creature).to.have.property('name').which.is.a('string').and.equals('Steve');
         expect(creature).to.have.property('isFemale').which.is.a('boolean').and.equals(false);
         expect(creature).to.have.property('species').which.is.a('string').and.equals('Spino');
         expect(creature).to.have.property('speciesBP').which.equals('/Game/PrimalEarth/Dinos/Spino/Spino_Character_BP.Spino_Character_BP');
      });
      it('should have specific properties', () => {
         const creature = convertCreature(result.CreatureCollection.creatures[1]);

         expect(creature).to.have.property('level').which.is.a('number').and.equals(236);

         expect(creature).to.have.property('tags').which.is.an('object');
         expect(creature.tags).to.have.property('user:Deadly').which.equals(true);
         expect(creature.tags).not.to.have.property('Available');

         expect(creature).to.have.property('times').which.is.an('object');
         expect(creature.times).to.have.property('addedToLibrary').and.not.equal('null');
         expect(creature.times).to.have.property('domesticated').and.not.equal('null');
         expect(creature.times).not.to.have.property('cooldownUntil');
         expect(creature.times).not.to.have.property('growingUntil');
      });
   });

});

describe('library output conversion', () => {
   let result: any;

   beforeAll(() => {
      // Read the test library
      const buffer = readFileSync('tests/unit/test-asb-library.xml');
      const content = decodeBuffer(buffer);
      const parser = new LowLevelParser();
      parser.acceptData(content);
      result = parser.finish();
   });

   describe('the server', () => {
      it('should have the correct contents', () => {
         const server = convertServer(result.CreatureCollection);

         expect(server).to.have.property('name').which.is.a('string');
         expect(server).to.have.property('IBM').which.is.a('number').and.equals(1.5);
         expect(server).to.have.property('singlePlayer').which.is.a('boolean').and.is.true;

         expect(server).to.have.property('multipliers').which.is.an('object');
         expect(server.multipliers).to.have.property('0').which.is.an('object');
      });
   });

});


// tslint:disable-next-line:no-sparse-arrays
const multsColdinoSP_Input = [, [2, , 2], , , [10, , 10], [0.2, , 0.22], [3, , 3]];
const multsColdinoSP_Output = { 0: {}, 1: { 0: 2, 2: 2 }, 2: {}, 3: {}, 4: { 0: 10, 2: 10 }, 5: { 0: 0.2, 2: 0.22 }, 6: { 0: 3, 2: 3 }, 7: {} };

describe('multiplierArrayToObjectValues', () => {
   it('should handle empty inputs', () => {
      const output = multiplierArrayToObjectValues([]);
      expect(output).to.be.an('object').and.not.an('array');
   });

   it('should always produce 8 outputs', () => {
      checkForAllEightKeys(multiplierArrayToObjectValues([]));
      checkForAllEightKeys(multiplierArrayToObjectValues([[]]));
      checkForAllEightKeys(multiplierArrayToObjectValues([[], []]));
      checkForAllEightKeys(multiplierArrayToObjectValues(
         [[, 1], [], undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, [1]]));
   });

   it('should produce the right output for Coldino SP mults', () => {
      const output = multiplierArrayToObjectValues(multsColdinoSP_Input);

      checkForAllEightKeys(output);
      expect(output).to.deep.eq(multsColdinoSP_Output);
   });
});

function checkForAllEightKeys(object: any) {
   for (let i = 0; i < 8; i++) {
      expect(object).to.have.property('' + i);
   }
}
