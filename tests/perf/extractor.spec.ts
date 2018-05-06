import { TestData } from '@/ark/types';
import { PerformPerfTest, PerformTest, TestResult } from '@/testing';
import { expect } from 'chai';
import now from 'performance-now';
import { initForExtraction } from '../common/init';


const PERF_TEST_DURATION = 5000;


const STRESS_GIGA: TestData = {
   tag: '',
   species: 'Giganotosaurus', level: 781, imprint: 0, mode: 'Tamed',
   values: [21214.0, 538.9, 207.6, 5557.8, 1960.0, 673.5, 101.9, 454600.0],
   serverId: 'test:Coldino SP',
   // tslint:disable-next-line:max-line-length
   results: [[{ Lw: 104, Ld: 3 }], [{ Lw: 173, Ld: 12 }, { Lw: 105, Ld: 14 }, { Lw: 11, Ld: 17 }], [{ Lw: 140, Ld: 1 }, { Lw: 115, Ld: 3 }, { Lw: 92, Ld: 5 }, { Lw: 52, Ld: 9 }, { Lw: 10, Ld: 14 }], [{ Lw: 117, Ld: 3 }, { Lw: 73, Ld: 7 }], [{ Lw: 180, Ld: 0 }, { Lw: 100, Ld: 4 }, { Lw: 75, Ld: 6 }, { Lw: 40, Ld: 10 }, { Lw: 12, Ld: 15 }], [{ Lw: 121, Ld: 3 }, { Lw: 103, Ld: 10 }], [{ Lw: 221, Ld: 2 }, { Lw: 217, Ld: 2 }, { Lw: 208, Ld: 2 }, { Lw: 104, Ld: 2 }, { Lw: 97, Ld: 2 }, { Lw: 74, Ld: 2 }, { Lw: 61, Ld: 2 }, { Lw: 54, Ld: 2 }, { Lw: 52, Ld: 2 }, { Lw: 48, Ld: 2 }, { Lw: 16, Ld: 2 }, { Lw: 12, Ld: 2 }], [{ Lw: 741, Ld: 0 }]],
};


before('load values', async () => {
   await initForExtraction();
});

describe('performance', () => {
   it('should extract Stress Giga in under 250ms (first run)', () => {
      let result: TestResult;
      result = PerformTest(STRESS_GIGA, now);
      expect(result).to.be.a('object');
      expect(result.pass).to.equal(true);
      expect(result.duration, 'is duration less than 250').to.be.a('number').and.lt(250);
      console.log(`      duration (first run) : ${Number(result.duration).toFixed(2)} ms`);
   });

   it('should extract Stress Giga in under 250ms (repeated)', () => {
      let result: TestResult;
      result = PerformPerfTest(STRESS_GIGA, now, PERF_TEST_DURATION, false);
      expect(result).to.be.a('object');
      expect(result.duration, 'is duration less than 250').to.be.a('number').and.lt(250);
      console.log(`      duration (repeated) : ${Number(result.duration).toFixed(2)} ms`);
   }).timeout(PERF_TEST_DURATION * 2);
});
