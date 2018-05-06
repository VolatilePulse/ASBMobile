import { ParseDatabase } from '@/ark/data';
import { parseExportedCreature } from '@/ark/import/ark_export';
import { parseGameIni } from '@/ark/import/game_ini';
import { Server } from '@/data/objects';
import * as Servers from '@/servers';
import { PerformTest } from '@/testing';
import { expect } from 'chai';
import { readFile, readFileSync } from 'fs';
import glob from 'glob';
import { basename, dirname } from 'path';
import util from 'util';

// tslint:disable:no-unused-expression

const globAsync = util.promisify(glob);
const readFileAsync = util.promisify(readFile);


// TODO: Implement directory crawler in 'testdata'.
//   Load Game.ini and use it as the Server definition, or accept blank files called Official or OfficialSP
//   Load each dino .ini and run it through the extractor.


// let parseOutput: Server;
let gameIniList: string[];

before('init', async () => {
   // Initialise required subsystems
   await Servers.initialise();
   const valuesJson = readFileSync('public/data/data.json').toString();
   ParseDatabase(JSON.parse(valuesJson));

   // Find all Game.ini files
   gameIniList = await globAsync('testdata/**/Game.ini');
   gameIniList.forEach(gameIni => {
      const folder = dirname(gameIni);
      let gameIniContent: string;
      let server: Server;

      // Add a test for each Game.ini
      describe(folder, () => {
         before('load Game.ini', async () => {
            // Load Game.ini
            gameIniContent = readFileSync('testdata/coldino/sp/Game.ini').toString();
            server = parseGameIni(gameIniContent);

            // Find all dinos for this server
            let dinoFileList: string[] = await globAsync(`${folder}/**/*.ini`);
            dinoFileList = dinoFileList.filter(f => !f.endsWith('game.ini') && !f.endsWith('Game.ini'));

            // Load all dino files async
            const dinoFiles = await Promise.all(dinoFileList.map(f => readFileAsync(f).then(blob => ({ filename: f, contents: blob.toString() }))));

            // Add a check for each dino ini
            dinoFiles.forEach(input => {
               const name = basename(input.filename, '.ini');
               console.log(name);
               it(`${name} should extract`, () => {
                  // Parse dino ini
                  const creature: any = parseExportedCreature(input.contents);
                  creature.tag = '';

                  // Perform test
                  const result = PerformTest(creature);

                  // Expect at least one option
                  expect(result).to.exist;
                  expect(result.options).to.exist;
                  expect(result.options).to.not.be.empty;
               });
            });
         });
         it('has valid Game.ini', () => expect(server).to.exist);
      });
   });
});


it('dummy', () => expect(true).to.be.true);
