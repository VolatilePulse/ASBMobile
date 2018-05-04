
const speciesRe = /\/(\w+)\/\w+_Character_BP(?:_(Aberrant))?/;

export function speciesFromClass(cls: string): string {
   const result = speciesRe.exec(cls);
   if (!result) throw new Error('Creature species could not be calculated');
   if (result[2])
      return result[2] + ' ' + result[1];

   return result[1];
}
