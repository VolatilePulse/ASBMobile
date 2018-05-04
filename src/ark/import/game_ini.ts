import { INI_STAT_INDEXES } from '@/ark/import/ark_export';
import { HEALTH, SERVER_IDM, SERVER_IWM, SERVER_TAM, SERVER_TMM, TORPOR } from '@/consts';
import { Server } from '@/data/objects';
import theStore from '@/ui/store';
import { CompareFloat, FilledArray, ParseIni } from '@/utils';

/** @fileOverview Handle importing server settings from game.ini */


const BLOCK_SHOOTERGAMEMODE = '/Script/ShooterGame.ShooterGameMode';


export function parseGameIni(iniText: string) {
   const ini = ParseIni(iniText).byName;
   const main = ini[BLOCK_SHOOTERGAMEMODE];

   let ibm: number;
   const ibmValue = main['BabyImprintingStatScaleMultiplier'];
   if (ibmValue !== undefined)
      ibm = parseFloat(ibmValue);

   let singlePlayer: boolean = false;
   const singlePlayerValue = main['bUseSingleplayerSettings'];
   if (singlePlayerValue !== undefined && singlePlayerValue.toLowerCase() === 'true')
      singlePlayer = true;

   // Set all multipliers straight from the given values
   const mults: number[][] = FilledArray(8, () => []);
   INI_STAT_INDEXES.forEach((iniIndex, statIndex) => {
      mults[statIndex][SERVER_TMM] = parseFloat(main[`PerLevelStatsMultiplier_DinoTamed_Affinity[${iniIndex}]`]);
      mults[statIndex][SERVER_TAM] = parseFloat(main[`PerLevelStatsMultiplier_DinoTamed_Add[${iniIndex}]`]);
      mults[statIndex][SERVER_IWM] = parseFloat(main[`PerLevelStatsMultiplier_DinoWild[${iniIndex}]`]);
      mults[statIndex][SERVER_IDM] = parseFloat(main[`PerLevelStatsMultiplier_DinoTamed[${iniIndex}]`]);
   });

   // Remove entries that match Official
   const officialMults = theStore.officialServer.multipliers;
   for (let statIndex = HEALTH; statIndex <= TORPOR; statIndex++) {
      for (let paramIndex = 0; paramIndex < 4; paramIndex++) {
         if (CompareFloat(mults[statIndex][paramIndex], officialMults[statIndex][paramIndex]))
            delete mults[statIndex][paramIndex];
      }
   }

   const server = new Server(mults, ibm, singlePlayer);
   return server;
}
