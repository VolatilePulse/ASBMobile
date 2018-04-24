import { Extractor } from '@/ark/extractor';
import { Creature, Server } from '@/data/objects';
import { expect } from 'chai';
// import { shallow } from '@vue/test-utils';

describe('alwaysPass', () => {
   it('true should be true', () => {
      const extractor = new Extractor(new Creature(), new Server([]));
      extractor.extract();

      expect(() => true).equals(true);
   });
});
