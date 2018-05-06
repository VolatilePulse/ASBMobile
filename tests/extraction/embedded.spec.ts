import testData from '@/ark/test_data';
import { PerformTest } from '@/testing';
import { expect } from 'chai';
import { initForExtraction } from '../common/init';


before('load values', async () => {
   await initForExtraction();
});

describe('verify extractor using embedded test data', () => {
   testData.forEach((data, i) =>
      it(`should extract L${data.level} ${data.mode.toLowerCase()} ${data.species} [index ${i}]`, () => {
         const result = PerformTest(data);
         // expect(result, 'contains .pass').to.have.property('pass').which.equals(true);
         expect(result.options, 'has at least one option').to.have.length.gt(0);
      }));
});
