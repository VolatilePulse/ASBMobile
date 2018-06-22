import { parseExportedCreature } from '@/ark/import/ark_export';
import { parseGameIni } from '@/ark/import/game_ini';
import { TestData } from '@/ark/types';
import { Server } from '@/data/firestore/objects';
import { PerformTest } from '@/testing';
import theStore from '@/ui/store';
import { expect } from 'chai';
import glob from 'glob';
import path from 'path';
import { loadFile } from '../common/decoding';
import { initForExtraction } from '../common/init';

/**
 * @fileOverview Test suite for all archived test data in the `testdata` directory.
 * For each directory:
 *   Load Game.ini and use it as the Server definition, or assume Official.
 *   Load each dino .ini and run it through the extractor.
 *   Check at least one set of valid options is found.
 */


// tslint:disable:no-unused-expression

const BASEPATH = 'testdata';

interface Node {
   name: string;
   path: string;
   subdirs?: Node[];
   server?: string;
   creatures?: string[];
}

/** Build a tree of representing found tests */
function discoverTestNodes(pathSegments: string[] = []): Node {
   const name = pathSegments.length ? pathSegments[pathSegments.length - 1] : 'archive test data';
   const pathname = path.join(BASEPATH, ...pathSegments);
   const subdirs = glob.sync('*/', { cwd: pathname }).map(dirname => dirname.substring(0, dirname.length - 1));
   const gameIni = glob.sync('game.ini', { cwd: pathname, nocase: true });
   const creatureInis = glob.sync('*.ini', { cwd: pathname, nocase: true, ignore: '[Gg]ame.ini' });
   return {
      name: name,
      path: pathname,
      server: gameIni.length ? path.join(pathname, gameIni[0]) : undefined,
      subdirs: subdirs.map(subdir => discoverTestNodes(pathSegments.concat(subdir))),
      creatures: creatureInis.map(filename => path.join(pathname, filename)),
   };
}

/** Load and parse a Game.ini */
async function loadGameIni(filename: string): Promise<Server> {
   const content = await loadFile(filename);
   const server = parseGameIni(content) as Server;
   return server;
}

/** Load and parse an exported creature */
async function loadCreature(filename: string): Promise<TestData> {
   const content = await loadFile(filename);
   const input: any = parseExportedCreature(content);
   return input;
}

/** Generate the the entire hierarchy of tests */
function generateTests(node: Node) {
   describe(node.name, () => {
      let serverDef: Server;

      // If there's a game.ini load and parse it, else assume Official
      beforeAll(async () => {
         if (node.server) {
            serverDef = await loadGameIni(node.server);
         }

         if (!serverDef) {
            serverDef = theStore.officialServer;
         }
      });

      // If there are creatures, generate a test per file which loads the creature and runs the extractor
      (node.creatures || []).forEach(creatureFile => {
         it(path.basename(creatureFile, '.ini'), async () => {
            expect(serverDef).to.exist;
            const input = await loadCreature(creatureFile);
            expect(input).to.exist;
            const results = PerformTest(input, undefined, serverDef);
            const detailsReport = ` [Lvl ${input.level} ${input.mode.toLowerCase()} ${input.species} at ${creatureFile}]`;
            expect(results).to.exist;
            expect(results.options, 'no options' + detailsReport).to.be.instanceof(Array).and.not.be.empty;
         });
      });

      // If there are subdirectories, recurse
      if (node.subdirs) {
         node.subdirs.forEach(subNode => generateTests(subNode));
      }
   });
}


// Actual runtime begins here
const testTree = discoverTestNodes();
generateTests(testTree);


beforeAll(async () => {
   await initForExtraction();
});
