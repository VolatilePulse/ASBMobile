
import { ParseDatabase } from '@/ark/data';
import * as Servers from '@/servers';
import { readFileSync } from 'fs';

/** Initialise enough subsystems to get the Extractor working */
export async function initForExtraction() {
   await Servers.initialise();
   const valuesJson = readFileSync('public/data/data.json').toString();
   ParseDatabase(JSON.parse(valuesJson));
}
