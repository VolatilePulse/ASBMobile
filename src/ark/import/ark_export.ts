import { speciesFromClass } from '@/ark/import/species';
import { CreatureTestData } from '@/testing';
import { ParseIni } from '@/utils';

/** @fileOverview Handle importing data from ARK Export files */


export const INI_STAT_INDEXES = [0, 1, 3, 4, 7, 8, 9, 2];

/**
 * Import a file exported directly from ARK.
 * Due to ARK localising the content of the file this is done using line positions and may be fragile.
 */
export function parseExportedCreature(iniText: string): Partial<CreatureTestData> {
   const ini = ParseIni(iniText).byIndex;
   const species = speciesFromClass(ini[0][2]);
   // TODO: grab species blueprint and use that
   const level = parseInt(ini[0][12], 10);
   const imprint = parseFloat(ini[0][13]) * 100;
   const notGrown = parseFloat(ini[0][11]) < 1;
   const hasMutations = (parseFloat(ini[0][9]) > 0) || (parseFloat(ini[0][10]) > 0);
   const hasAncestors = parseFloat(ini[3][0]) > 0;
   const isBred = notGrown || hasAncestors || hasMutations || imprint > 0;
   const output: Partial<CreatureTestData> = {
      species: species,
      level: level,
      imprintingBonus: imprint,
      inputSource: 'ark_export',
      isBred: isBred,
      isTamed: !isBred,
      values: INI_STAT_INDEXES.map(i => parseFloat(ini[2][i])),
   };
   output.values[5] = (output.values[5] + 1) * 100;
   output.values[6] = (output.values[6] + 1) * 100;
   return output;
}
