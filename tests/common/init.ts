import { ParseDatabase } from '@/systems/ark_data';
import { readFileSync } from 'fs';


/** Initialise enough subsystems to get the Extractor working */
export async function initForExtraction() {
   const valuesJson = readFileSync('public/data/data.json').toString();
   ParseDatabase(JSON.parse(valuesJson));
}
