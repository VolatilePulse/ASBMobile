import { parseExportedCreature } from '@/ark/import/ark_export';
import { TestData } from '@/ark/types';
import { expect } from 'chai';
import { readFileSync } from 'fs';
import { decodeBuffer } from '../common/decoding';
import { initForExtraction } from '../common/init';

// tslint:disable:no-unused-expression


beforeAll(async () => {
   await initForExtraction();
});

describe('importing UTF8 export from Coldino', async () => {
   let creature: TestData;

   beforeAll(async () => {
      const buffer = readFileSync('testdata/coldino/sp/DinoExport_98039615458863017.ini');
      const content = decodeBuffer(buffer);
      creature = parseExportedCreature(content) as TestData;
   });

   it('should parse', () => { expect(creature).to.exist; });
   it('should have correct species', () => { expect(creature.species).to.equal('Allosaurus'); });
});

describe('importing UTF16-LE export from Davis', async () => {
   let creature: TestData;

   beforeAll(async () => {
      const buffer = readFileSync('testdata/Davis/OfficialPVP/DinoExport_375799389266114837.ini');
      const content = decodeBuffer(buffer);
      creature = parseExportedCreature(content) as TestData;
   });

   it('should parse', () => { expect(creature).to.exist; });
   it('should have correct species', () => { expect(creature.species).to.equal('Quetzal'); });
});

