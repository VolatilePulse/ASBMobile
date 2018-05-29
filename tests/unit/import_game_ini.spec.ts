import { parseGameIni } from '@/ark/import/game_ini';
import { DAMAGE, FOOD, HEALTH, OXYGEN, SERVER_IDM, SERVER_IWM, SERVER_TAM, SERVER_TMM, SPEED, STAMINA, TORPOR, WEIGHT } from '@/consts';
import { Server } from '@/data/objects';
import { expect } from 'chai';
import { readFileSync } from 'fs';
import { initForExtraction } from '../common/init';

// tslint:disable:no-unused-expression


beforeAll(async () => {
   await initForExtraction();
});

describe('importing game.ini from coldino', async () => {
   let server: Server;

   beforeAll(async () => {
      const content = readFileSync('tests/unit/coldino-sp-game.ini').toString();
      server = parseGameIni(content);
   });

   it('should parse', () => { expect(server).to.exist.and.be.instanceof(Server); });

   it('should have correct IBM', () => { expect(server.IBM).to.equal(1.5); });
   it('should have singlePlayer set', () => { expect(server.singlePlayer).to.be.true; });

   it('should have overridden stamina TaM', () => { expect(server.multipliers[STAMINA][SERVER_TAM]).to.equal(2); });
   it('should have overridden stamina IdM', () => { expect(server.multipliers[STAMINA][SERVER_IDM]).to.equal(2); });
   it('should have overridden weight TaM', () => { expect(server.multipliers[WEIGHT][SERVER_TAM]).to.equal(10); });
   it('should have overridden weight IdM', () => { expect(server.multipliers[WEIGHT][SERVER_IDM]).to.equal(10); });
   it('should have overridden speed TaM', () => { expect(server.multipliers[SPEED][SERVER_TAM]).to.equal(3); });
   it('should have overridden speed IdM', () => { expect(server.multipliers[SPEED][SERVER_IDM]).to.equal(3); });
});

describe('importing game.ini from Dusty.P', async () => {
   let server: Server;

   beforeAll(async () => {
      const content = readFileSync('tests/unit/dusty-game.ini').toString();
      server = parseGameIni(content);
   });

   it('should parse', () => { expect(server).to.exist.and.be.instanceof(Server); });

   it('should have correct IBM', () => { expect(server.IBM).to.equal(1); });
   it('should not have singlePlayer set', () => { expect(server.singlePlayer).to.be.false; });

   it('should have all official TmM', () => {
      for (let statI = HEALTH; statI <= TORPOR; statI++)
         expect(server.multipliers[statI][SERVER_TMM]).to.be.undefined;
   });

   it('should have all official TaM', () => {
      for (let statI = HEALTH; statI <= TORPOR; statI++)
         expect(server.multipliers[statI][SERVER_TAM]).to.be.undefined;
   });

   it('should have overridden health IwM', () => { expect(server.multipliers[HEALTH][SERVER_IWM]).to.equal(1); });
   it('should have overridden health IdM', () => { expect(server.multipliers[HEALTH][SERVER_IDM]).to.equal(0.2); });

   it('should have overridden stamina IwM', () => { expect(server.multipliers[STAMINA][SERVER_IWM]).to.equal(1); });
   it('should have overridden stamina IdM', () => { expect(server.multipliers[STAMINA][SERVER_IDM]).to.equal(1); });

   it('should have overridden oxygen IwM', () => { expect(server.multipliers[OXYGEN][SERVER_IWM]).to.equal(1); });
   it('should have overridden oxygen IdM', () => { expect(server.multipliers[OXYGEN][SERVER_IDM]).to.equal(1); });

   it('should have overridden food IwM', () => { expect(server.multipliers[FOOD][SERVER_IWM]).to.equal(1); });
   it('should have overridden food IdM', () => { expect(server.multipliers[FOOD][SERVER_IDM]).to.equal(1); });

   it('should have overridden weight IwM', () => { expect(server.multipliers[WEIGHT][SERVER_IWM]).to.equal(1); });
   it('should have overridden weight IdM', () => { expect(server.multipliers[WEIGHT][SERVER_IDM]).to.equal(2); });

   it('should have overridden damage IwM', () => { expect(server.multipliers[DAMAGE][SERVER_IWM]).to.equal(1); });
   it('should have overridden damage IdM', () => { expect(server.multipliers[DAMAGE][SERVER_IDM]).to.equal(0.17); });

   it('should have overridden speed IwM', () => { expect(server.multipliers[SPEED][SERVER_IWM]).to.equal(1); });
   it('should have overridden speed IdM', () => { expect(server.multipliers[SPEED][SERVER_IDM]).to.equal(1.2); });

   it('should have overridden torpor IwM', () => { expect(server.multipliers[TORPOR][SERVER_IWM]).to.equal(1); });
   it('should have overridden torpor IdM', () => { expect(server.multipliers[TORPOR][SERVER_IDM]).to.equal(1); });
});
