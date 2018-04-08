import Enumerable from 'linq';
import * as fs from 'fs';

const DATA = "public/data/data.json";
const STAT_B = 0, STAT_IW = 1, STAT_ID = 2, STAT_TA = 3, STAT_TM = 4;
const statNames = ['Health', 'Stamina', 'Oxygen', 'Food', 'Weight', 'Melee', 'Speed', 'Torpor'];

/** @returns {{species:{[name:string]:{stats:number[][]}}}} */
function readData() {
   console.log("Loading data.json...");
   let fileData = fs.readFileSync(DATA, 'utf8');
   console.log("Parsing...");
   var values = JSON.parse(fileData);
   return values;
}

/**
 * Your filter logic here...
 * You're passed the species stat values.
 * Return true if you want to include this species in the results.
 * @param {number[][]} stats
 * @returns {boolean} True if this species should be selected.
 */
function myFilter(stats) {
   return Enumerable.from(stats).any(values => Enumerable.from(values.slice(STAT_TM)).all(v => v < 0));
}

let values = readData();

let matchingSpecies = Enumerable.from(values.species).
   where(kvp => myFilter(kvp.value.stats)).
   select(kvp => Object.assign({}, kvp.value, { species: kvp.key })).
   toArray();

for (var data of matchingSpecies) {
   console.log(`${data.species}...`);
   console.dir(data.stats);
}
