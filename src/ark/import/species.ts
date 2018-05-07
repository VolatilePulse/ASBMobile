import theStore from '@/ui/store';


export function speciesFromClass(cls: string): string {
   let clsLower = cls.toLowerCase();
   if (clsLower.endsWith('_c')) clsLower = clsLower.substring(0, clsLower.length - 2);
   const resultPair = Object.entries(theStore.speciesMultipliers).find(kv => clsLower === kv[1].blueprint.toLowerCase());
   if (resultPair) return resultPair[0];
   // const guessed = guessFromClass(cls);
   // if (guessed) return guessed;
   throw new Error(`Unknown species class '${cls}'`);
}
