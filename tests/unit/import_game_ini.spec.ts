import { ParseDatabase } from '@/ark/data';
import { parseGameIni } from '@/ark/import/game_ini';
import { FOOD, HEALTH, OXYGEN, SERVER_IDM, SERVER_IWM, SERVER_TAM, SERVER_TMM, SPEED, STAMINA, TORPOR, WEIGHT } from '@/consts';
import { Server } from '@/data/objects';
import * as Servers from '@/servers';
import { expect } from 'chai';
import { readFileSync } from 'fs';

// tslint:disable:no-unused-expression


let parseOutput: Server;

before('initialise servers', async () => {
   await Servers.initialise();
   const valuesJson = readFileSync('public/data/data.json').toString();
   ParseDatabase(JSON.parse(valuesJson));

   const content = readFileSync('testdata/coldino/sp/Game.ini').toString();
   parseOutput = parseGameIni(content);
});

const EMPTY_SERVER_PARAMS = new Array(4);

describe('importing game.ini from coldino', async () => {
   it('should have correct IBM', () => expect(parseOutput.IBM).to.equal(1.5));
   it('should have singlePlayer set', () => expect(parseOutput.singlePlayer).to.be.true);

   it('should use official health', () => expect(parseOutput.multipliers[HEALTH]).to.deep.equal(EMPTY_SERVER_PARAMS));
   it('should use official oxygen', () => expect(parseOutput.multipliers[OXYGEN]).to.deep.equal(EMPTY_SERVER_PARAMS));
   it('should use official food', () => expect(parseOutput.multipliers[FOOD]).to.deep.equal(EMPTY_SERVER_PARAMS));
   it('should use official torpor', () => expect(parseOutput.multipliers[TORPOR]).to.deep.equal(EMPTY_SERVER_PARAMS));

   it('should use official stamina TmM', () => expect(parseOutput.multipliers[STAMINA][SERVER_TMM]).to.be.undefined);
   it('should use official stamina IwM', () => expect(parseOutput.multipliers[STAMINA][SERVER_IWM]).to.be.undefined);
   it('should use official weight TmM', () => expect(parseOutput.multipliers[WEIGHT][SERVER_TMM]).to.be.undefined);
   it('should use official weight IwM', () => expect(parseOutput.multipliers[WEIGHT][SERVER_IWM]).to.be.undefined);
   it('should use official speed TmM', () => expect(parseOutput.multipliers[SPEED][SERVER_TMM]).to.be.undefined);
   it('should use official speed IwM', () => expect(parseOutput.multipliers[SPEED][SERVER_IWM]).to.be.undefined);

   it('should have overridden stamina TaM', () => expect(parseOutput.multipliers[STAMINA][SERVER_TAM]).to.equal(2));
   it('should have overridden stamina IdM', () => expect(parseOutput.multipliers[STAMINA][SERVER_IDM]).to.equal(2));
   it('should have overridden weight TaM', () => expect(parseOutput.multipliers[WEIGHT][SERVER_TAM]).to.equal(10));
   it('should have overridden weight IdM', () => expect(parseOutput.multipliers[WEIGHT][SERVER_IDM]).to.equal(10));
   it('should have overridden speed TaM', () => expect(parseOutput.multipliers[SPEED][SERVER_TAM]).to.equal(3));
   it('should have overridden speed IdM', () => expect(parseOutput.multipliers[SPEED][SERVER_IDM]).to.equal(3));
});
