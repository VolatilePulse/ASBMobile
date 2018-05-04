import { speciesFromClass } from '@/ark/import/species';
import { ParseIni } from '@/utils';

/** @fileOverview Handle importing data from ARK Export files */


export const INI_STAT_INDEXES = [0, 1, 3, 4, 7, 8, 9, 2];

export function parseExportedCreature(iniText: string) {
   const ini = ParseIni(iniText).byIndex;
   const output = {
      species: speciesFromClass(ini[0][2]),
      level: ini[0][12],
      imprint: parseFloat(ini[0][13]) * 100,
      mode: parseFloat(ini[0][13]) > 0 ? 'Bred' : 'Tamed',
      values: INI_STAT_INDEXES.map(i => parseFloat(ini[2][i])),
   };
   output.values[5] = (output.values[5] + 1) * 100;
   output.values[6] = (output.values[6] + 1) * 100;
   return output;
}
