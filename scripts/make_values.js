const fs = require('fs');
const https = require("https");
const cloneDeep = require('lodash.clonedeep');


const URL = "https://raw.githubusercontent.com/cadon/ARKStatsExtractor/master/ARKBreedingStats/json/values.json";
const OUTPUT = "public/data/data.json";

const SPECIES_FIELDS = {
   'statsRaw': 'stats',
   'NoImprintingForSpeed': 'noImprint',
   'TamedBaseHealthMultiplier': 'TBHM',
   'doesNotUseOxygen': 'noOxygen',
};

const SETTINGS_FIELDS = {
   'ver': 'version',
   'imprintingMultiplier': 'imprintingMultiplier',
   'statMultipliers': 'officialMultipliers',
   'statMultipliersSP': 'officialMultipliersSP',
};


console.log("Fetching values.json from GitHub...");
https.get(URL, res => {
   res.setEncoding("utf8");
   let body = "";
   res.on("data", data => {
      body += data;
   });
   res.on("end", () => {
      let json = JSON.parse(body);
      let valuesSize = body.length;
      console.log("Loaded version: " + json.ver);

      console.log("Converting...");
      var output = {
         species: {},
         settings: {},
      };

      // Convert species
      let speciesCount = 0;
      for (let speciesData of json.species) {
         speciesCount += 1;

         let result = output.species[speciesData.name] = {};

         // Copy over mapped fields
         for (let field in SPECIES_FIELDS) {
            // Falsey values don't need to be present
            if (!speciesData[field]) continue;

            let newName = SPECIES_FIELDS[field];
            result[newName] = cloneDeep(speciesData[field]);
         }

         // TODO: Alter the stats in any way you want here...
         // ...use `result.stats`
      }

      console.log("Species: " + speciesCount);

      // Copy over mapped settings fields
      for (let field in SETTINGS_FIELDS) {
         // Falsey values don't need to be present
         if (!json[field]) continue;

         let newName = SETTINGS_FIELDS[field];
         output.settings[newName] = json[field];
      }

      console.log("Writing output to: " + OUTPUT);
      var data = JSON.stringify(output);
      fs.writeFileSync(OUTPUT, data);

      console.log("Completed.");
      console.log("");

      var outputSize = fileSize(OUTPUT);
      var pct = Math.round((outputSize / valuesSize) * 10000) / 100;
      console.log(valuesSize + " bytes => " + outputSize + " bytes = " + pct + "%");
   });
});


function fileSize(path) {
   const stats = fs.statSync(path);
   return stats.size;
}
