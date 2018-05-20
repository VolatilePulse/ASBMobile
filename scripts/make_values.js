const fs = require('fs');
const https = require("https");
const cloneDeep = require('lodash/clonedeep');
const merge = require('lodash/merge');


const URL = "https://raw.githubusercontent.com/cadon/ARKStatsExtractor/master/ARKBreedingStats/json/values.json";
const OUTPUT = "public/data/data.json";

const SPECIES_FIELDS = {
   'blueprintPath': 'bp',
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

const OVERRIDES = {
   settings: {
      // More accurate SP multipliers
      officialMultipliersSP: {
         0: {
            0: 25 / 7, // 0.5 / 0.14,
            1: 25 / 11, // 1.0 / 0.44,
         },
         5: {
            0: 25 / 7, // 0.5 / 0.14,
            1: 25 / 11, // 1.0 / 0.44,
            2: 40 / 17,
         },
      }
   },
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

      // Copy over mapped settings fields
      for (let field in SETTINGS_FIELDS) {
         // Falsey values don't need to be present
         if (!json[field]) continue;

         let newName = SETTINGS_FIELDS[field];
         output.settings[newName] = json[field];
      }

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
      }

      console.log("Species: " + speciesCount);

      // Apply overrides
      console.log("Applying overrides...");
      output = merge(output, OVERRIDES);

      console.log("Saving old data...");
      var oldData = JSON.parse(fs.readFileSync(OUTPUT).toString());

      console.log("Writing output to: " + OUTPUT);
      fs.writeFileSync(OUTPUT, JSON.stringify(output));
      fs.writeFileSync('new-data.json.tmp', nicelyStringify(output));
      fs.writeFileSync('old-data.json.tmp', nicelyStringify(oldData));

      console.log("Completed.");
      console.log("");

      var outputSize = fileSize(OUTPUT);
      var pct = Math.round((outputSize / valuesSize) * 10000) / 100;
      console.log(valuesSize + " bytes => " + outputSize + " bytes = " + pct + "%");

      if (process.argv.findIndex(v => v === '--no-diff') == -1) {
         var execFileSync = require('child_process').execFileSync;

         for (let [exe, args] of DIFF_TOOLS) {
            if (fs.existsSync(exe)) {
               args = args.concat('old-data.json.tmp', 'new-data.json.tmp');
               try {
                  console.log(`Diff: ${exe} ${args.join(' ')}`);
                  execFileSync(exe, args, { stdio: ['ignore', 'inherit', 'inherit', 'pipe'] });
               }
               catch (_) { }
               return;
            }
         }

         console.warn("Diff command not found (this does not affect the generated files)");
      }
   });
});


const COMPRESS_ARRAYS_RE = /\[[ \t\r\n]+([ \t\r\n]+[-.0-9]+,)*([ \t\r\n]+[.0-9]+)[ \t\r\n]+\]/gm;

const DIFF_TOOLS = [
   ['C:\\Program Files\\Microsoft VS Code\\bin\\code.cmd', ['--diff']],
   ['C:\\Program Files (x86)\\Microsoft VS Code\\bin\\code.cmd', ['--diff']],
   ['C:\\Program Files (x86)\\WinMerge\\WinMergeU.exe', ['/e', '/x', '/u', '/wl', '/wr']],
   ['C:\\Program Files\\Git\\usr\\bin\\diff.exe', ['-aBdub', '-F', '\": \"', '--color']],
];


function fileSize(path) {
   const stats = fs.statSync(path);
   return stats.size;
}

function nicelyStringify(data) {
   var output = JSON.stringify(data, undefined, 2);
   // compress numeric arrays down to one line
   output = output.replace(COMPRESS_ARRAYS_RE, match => match.replace(/\s*\r?\n\s*/g, ' '));
   return output;
}
