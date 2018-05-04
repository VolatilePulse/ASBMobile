import { ParseDatabase } from '@/ark/data';
import { parseGameIni } from '@/ark/import/game_ini';
import { Server } from '@/data/objects';
import * as Servers from '@/servers';
import { expect } from 'chai';
import { readFileSync } from 'fs';

// tslint:disable:no-unused-expression

// TODO: Implement directory crawler in 'testdata'.
// Load Game.ini and use it as the Server definition, or accept blank files called Official or OfficialSP
// Load each dino .ini and run it through the extractor.


let parseOutput: Server;

before('initialise servers', async () => {
   await Servers.initialise();
   const valuesJson = readFileSync('public/data/data.json').toString();
   ParseDatabase(JSON.parse(valuesJson));

   const content = readFileSync('testdata/coldino/sp/Game.ini').toString();
   parseOutput = parseGameIni(content);
});

describe('verify extractor using archive test data', async () => {
   it('input data exists', () => expect(parseOutput).to.not.be.undefined);
});
