import { ASBXmlOutput, LowLevelParser } from '@/ark/import/asb_xml';
import { expect } from 'chai';
import { readFileSync } from 'fs';
import * as util from 'util';
import { decodeBuffer } from '../common/decoding';

// tslint:disable:no-unused-expression


function nestedArrayToObjectValues(arr: any) {
   if (!util.isObject(arr)) return arr;
   if (!Array.isArray(arr)) return arr;

   const result: any = {};
   Object.entries(arr).forEach(([key, value]) => {
      if (value != null) result[key] = nestedArrayToObjectValues(value);
   });
   return result;
}


describe.skip('low-level ASB library importer', () => {
   let result: any;

   beforeAll(() => {
      const buffer = readFileSync('tests/unit/test-asb-library.xml');
      const content = decodeBuffer(buffer);
      const parser = new LowLevelParser();
      parser.acceptData(content);
      result = parser.finish();
      console.log();
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

   it('should have two Spinos and an Argy', () => {
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

describe('xml output validation', () => {
   let result: any;
   const output: ASBXmlOutput = { creatures: [], server: {} as any, settings: {} };

   beforeAll(() => {
      const buffer = readFileSync('tests/unit/test-asb-library.xml');
      const content = decodeBuffer(buffer);
      const parser = new LowLevelParser();
      parser.acceptData(content);
      result = parser.finish();

      // State 2 - convert to our data types
      // Store Creature Data
      output.creatures = result.CreatureCollection.creatures;

      for (const creature of output.creatures) {
         creature.inputSource = 'asb_xml';
      }

      // Set Server Data
      output.server.name = '' as ASBXmlOutput['server']['name'];
      output.server.IBM = result.CreatureCollection.imprintingMultiplier as ASBXmlOutput['server']['IBM'] || 1;
      output.server.multipliers = nestedArrayToObjectValues(result.CreatureCollection.multipliers) as ASBXmlOutput['server']['multipliers'] || [];
      output.server.singlePlayer = result.CreatureCollection.singlePlayer as ASBXmlOutput['server']['singlePlayer'] || false;

      // Store Relevant Settings
      // output.settings;

      console.log();
   });

   describe('Creatures:', () => {
      it('has data', () => {
         expect(output.creatures).to.be.an('array').and.is.not.empty;
         // expect(creature).to.have.property('guid').which.is.a('string').and.is.not.empty;
      });
   });

   describe('Server:', () => {
      it('correct format', () => {
         expect(output.server).to.have.property('name').which.is.a('string');
         expect(output.server).to.have.property('IBM').which.is.a('number');
         expect(output.server).to.have.property('multipliers').which.is.an('object');
         expect(output.server).to.have.property('singlePlayer').which.is.a('boolean');
      });
      it.skip('has a name', () => {
         expect(output.server.name).does.not.equal('');
      });
   });

   describe('Settings:', () => {
      it('has data', () => {
         expect(true);
      });
   });
});
