import { speciesFromClass } from '@/ark/import/species';
import { expect } from 'chai';
import { initForExtraction } from '../common/init';


const testData = [
   ['Aberrant Spino', '/Game/PrimalEarth/Dinos/Spino/Spino_Character_BP_Aberrant.Spino_Character_BP_Aberrant_C'],
   ['Allosaurus', '/Game/PrimalEarth/Dinos/Allosaurus/Allo_Character_BP.Allo_Character_BP_C'],
   ['Baryonyx', '/Game/PrimalEarth/Dinos/Baryonyx/Baryonyx_Character_BP.Baryonyx_Character_BP_C'],
   ['Argentavis', '/Game/PrimalEarth/Dinos/Argentavis/Argent_Character_BP.Argent_Character_BP_C'],
];


beforeAll(async () => {
   await initForExtraction();
});

describe('speciesFromClass', () => {
   testData.forEach(pair => {
      const [name, cls] = pair;
      it('handles ' + name, () => {
         const species = speciesFromClass(cls);
         expect(species).to.equal(name);
      });
   });
});

