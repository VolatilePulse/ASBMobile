import { parseGameIni } from '@/ark/import/game_ini';
import { Server } from '@/data/firestore/objects';
import { PerformPerfTest, PerformTest, TestDefinition, TestResult } from '@/testing';
import { expect } from 'chai';
import path from 'path';
import now from 'performance-now';
import { loadFile } from '../common/decoding';
import { initForExtraction } from '../common/init';

// tslint:disable:no-unused-expression


const BASEPATH = 'testdata';
const PERF_TEST_DURATION = 5000;

const STRESS_GIGA: TestDefinition = {
   description: 'Coldino Giga',
   creature: {
      species: 'Giganotosaurus', level: 781, imprintingBonus: 0, isTamed: true, inputSource: 'asbm_user_input',
      values: [21214.0, 538.9, 207.6, 5557.8, 1960.0, 673.5, 101.9, 454600.0],
      currentServer: 'test:Coldino SP',
   },
   criteria: [
      { test: 'has_an_option' },
   ],
};


let server: Server;

beforeAll(async () => {
   await initForExtraction();

   const serverFile = path.join(BASEPATH, 'coldino', 'sp', 'Game.ini');
   const serverContent = await loadFile(serverFile);
   server = parseGameIni(serverContent) as Server;
});

describe('performance', () => {
   it('should extract Stress Giga in under 250ms (first run)', () => {
      expect(server).to.exist;

      let result: TestResult;
      result = PerformTest(STRESS_GIGA, server, now);
      expect(result).to.be.a('object');
      expect(result.result).to.equal('pass');
      expect(result.duration, 'is duration less than 250').to.be.a('number').and.lt(250);
      console.log(`      duration (first run) : ${Number(result.duration).toFixed(2)} ms`);
   }, 1000);

   it('should extract Stress Giga in under 250ms (repeated)', () => {
      expect(server).to.exist;

      let result: TestResult;
      result = PerformPerfTest(STRESS_GIGA, server, now, PERF_TEST_DURATION, false);
      expect(result).to.be.a('object');
      expect(result.duration, 'is duration less than 250').to.be.a('number').and.lt(250);
      console.log(`      duration (repeated) : ${Number(result.duration).toFixed(2)} ms`);
   }, PERF_TEST_DURATION * 2);
});
