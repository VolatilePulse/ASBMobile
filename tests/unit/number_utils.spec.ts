import { intFromRange, intFromRangeReverse } from '@/number_utils';
import { expect } from 'chai';
import * as IA from 'interval-arithmetic';

// tslint:disable:no-unused-expression


describe('intFromRange', () => {
   it('[1, 0] should contain []', () => {
      expect(intFromRange(IA(1, 0))).to.be.empty;
   });

   it('[0,0] should be contain only [0]', () => {
      expect(intFromRange(IA(0, 0))).to.deep.equal([0]);
   });

   it('[0,1] should contain [0,1]', () => {
      expect(intFromRange(IA(0, 1))).to.deep.equal([0, 1]);
   });

   it('[0,1.5] should contain [0,1]', () => {
      expect(intFromRange(IA(0, 1.5))).to.deep.equal([0, 1]);
   });

   it('[0.5,1.5] should contain [1]', () => {
      expect(intFromRange(IA(0.5, 1.5))).to.deep.equal([1]);
   });

   it('[-0.5,1.5] should contain [0,1]', () => {
      expect(intFromRange(IA(-0.5, 1.5))).to.deep.equal([0, 1]);
   });

   it('[-0.5,4.5] should contain [0,1,2,3,4]', () => {
      expect(intFromRange(IA(-0.5, 4.5))).to.deep.equal([0, 1, 2, 3, 4]);
   });
});


describe('intFromRangeReverse', () => {
   it('[1, 0] should contain []', () => {
      expect(intFromRangeReverse(IA(1, 0))).to.be.empty;
   });

   it('[0,0] should be contain only [0]', () => {
      expect(intFromRangeReverse(IA(0, 0))).to.deep.equal([0]);
   });

   it('[0,1] should contain [1,0]', () => {
      expect(intFromRangeReverse(IA(0, 1))).to.deep.equal([1, 0]);
   });

   it('[0,1.5] should contain [1,0]', () => {
      expect(intFromRangeReverse(IA(0, 1.5))).to.deep.equal([1, 0]);
   });

   it('[0.5,1.5] should contain [1]', () => {
      expect(intFromRangeReverse(IA(0.5, 1.5))).to.deep.equal([1]);
   });

   it('[-0.5,1.5] should contain [1,0]', () => {
      expect(intFromRangeReverse(IA(-0.5, 1.5))).to.deep.equal([1, 0]);
   });

   it('[-0.5,4.5] should contain [4,3,2,1,0]', () => {
      expect(intFromRangeReverse(IA(-0.5, 4.5))).to.deep.equal([4, 3, 2, 1, 0]);
   });
});
