import { INI_STAT_INDEXES } from '@/ark/import/ark_export';
import { SERVER_IDM, SERVER_IWM, SERVER_TAM, SERVER_TMM } from '@/consts';
import { Server } from '@/data/objects';
import { FilledArray, ParseIni } from '@/utils';

/** @fileOverview Handle importing server settings from game.ini */


const BLOCK_SHOOTERGAMEMODE = '/Script/ShooterGame.ShooterGameMode'.toLowerCase();
const FIELD_IBM = 'BabyImprintingStatScaleMultiplier'.toLowerCase();
const FIELD_SINGLE_PLAYER = 'bUseSingleplayerSettings'.toLowerCase();
const FIELD_MULTS: string[] = [];
FIELD_MULTS[SERVER_TMM] = 'PerLevelStatsMultiplier_DinoTamed_Affinity'.toLowerCase();
FIELD_MULTS[SERVER_TAM] = 'PerLevelStatsMultiplier_DinoTamed_Add'.toLowerCase();
FIELD_MULTS[SERVER_IWM] = 'PerLevelStatsMultiplier_DinoWild'.toLowerCase();
FIELD_MULTS[SERVER_IDM] = 'PerLevelStatsMultiplier_DinoTamed'.toLowerCase();


function parseAndStoreField(main: { [name: string]: string }, mults: number[][], iniI: number, statI: number, multI: number) {
   const value = main[`${FIELD_MULTS[multI]}[${iniI}]`];
   if (value !== undefined) mults[statI][multI] = parseFloat(value);
}

export function parseGameIni(iniText: string) {
   const ini = ParseIni(iniText).byName;
   const main = ini[BLOCK_SHOOTERGAMEMODE];

   let ibm: number;
   const ibmValue = main[FIELD_IBM];
   if (ibmValue !== undefined)
      ibm = parseFloat(ibmValue);

   let singlePlayer: boolean = false;
   const singlePlayerValue = main[FIELD_SINGLE_PLAYER];
   if (singlePlayerValue !== undefined && singlePlayerValue.toLowerCase() === 'true')
      singlePlayer = true;

   // Set all multipliers straight from the given values
   const mults: number[][] = FilledArray(8, () => []);
   INI_STAT_INDEXES.forEach((iniI, statI) => {
      parseAndStoreField(main, mults, iniI, statI, SERVER_TMM);
      parseAndStoreField(main, mults, iniI, statI, SERVER_TAM);
      parseAndStoreField(main, mults, iniI, statI, SERVER_IWM);
      parseAndStoreField(main, mults, iniI, statI, SERVER_IDM);
   });

   // Remove entries that match Official
   // TODO: Decide if this is the right thing to do.
   // const officialMults = theStore.officialServer.multipliers;
   // for (let statIndex = HEALTH; statIndex <= TORPOR; statIndex++) {
   //    for (let paramIndex = 0; paramIndex < 4; paramIndex++) {
   //       if (CompareFloat(mults[statIndex][paramIndex], officialMults[statIndex][paramIndex]))
   //          delete mults[statIndex][paramIndex];
   //    }
   // }

   const server = new Server(mults, ibm, singlePlayer);
   return server;
}
