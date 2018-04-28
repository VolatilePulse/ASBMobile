import { expect } from 'chai';
import { range } from 'lodash';


describe('system checks', () => {
   it('true should be true', () => {
      expect(true).equals(true);
   });

   it('lodash can be used', () => {
      expect(range(10)).to.have.length(10);
   });
});
