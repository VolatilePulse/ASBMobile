const linq = require('linq');
const fs = require('fs');

// https://ark-data.seen-von-ragan.de/data/ark-tools/ark_data.json
// https://ark-data.seen-von-ragan.de/data/ark-tools/ark_data_de.json

const en = JSON.parse(fs.readFileSync('ark-data-en.json').toString());
const de = JSON.parse(fs.readFileSync('ark-data-de.json').toString());

const en_names = new Map(linq.from(en.creatures).select(c => [c.blueprint, c.name]).toArray());
const de_names = new Map(linq.from(de.creatures).select(c => [c.blueprint, c.name]).toArray());

var diffs = linq.from(Array.from(en_names.keys())).select(bp => [en_names.get(bp), de_names.get(bp)]).where(p => p[0] !== p[1]).toArray();

console.log(diffs);
