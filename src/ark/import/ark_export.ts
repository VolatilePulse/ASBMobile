import { speciesFromClass } from '@/ark/import/species';
import { ParseIni } from '@/utils';

/** @fileOverview Handle importing data from ARK Export files */


export const INI_STAT_INDEXES = [0, 1, 3, 4, 7, 8, 9, 2];

/**
 * Import a file exported directly from ARK.
 * Due to ARK localising the content of the file this is done using line positions and may be fragile.
 */
export function parseExportedCreature(iniText: string): any {
   const ini = ParseIni(iniText).byIndex;
   const species = speciesFromClass(ini[0][2]);
   const level = parseInt(ini[0][12], 10);
   const imprint = parseFloat(ini[0][13]) * 100;
   const notGrown = parseFloat(ini[0][11]) < 1;
   const hasMutations = (parseFloat(ini[0][9]) > 0) || (parseFloat(ini[0][10]) > 0);
   const hasAncestors = parseFloat(ini[3][0]) > 0;
   const output = {
      tag: '', // TODO: Get name?
      species: species,
      level: level,
      imprint: imprint,
      source: 'ark_export',
      mode: (notGrown || hasAncestors || hasMutations || imprint > 0) ? 'Bred' : 'Tamed',
      values: INI_STAT_INDEXES.map(i => parseFloat(ini[2][i])),
   };
   output.values[5] = (output.values[5] + 1) * 100;
   output.values[6] = (output.values[6] + 1) * 100;
   return output;
}
