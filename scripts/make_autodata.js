const fs = require('fs');
const https = require("https");
const linq = require("linq");
const cloneDeep = require('lodash/clonedeep');
const merge = require('lodash/merge');


const URL = "https://raw.githubusercontent.com/cadon/ARKStatsExtractor/master/ARKBreedingStats/json/values.json";
const OUTPUT = "C:\\Work\\gms\\AutoArk\\AutoArk\\data.json";

const SPECIES_FIELDS = {
   'blueprintPath': 'bp',
   'NoImprintingForSpeed': 'noImprint',
   'doesNotUseOxygen': 'noOxygen',
};

const SETTINGS_FIELDS = {
   'ver': 'version',
   'statMultipliers': 'officialMultipliers',
};

/** @type {{[height:number]:string}} */
const HEIGHTS = {
   25: `
   Aberrant Achatina
   Aberrant Arthropluera
   Aberrant Dimetrodon
   Aberrant Diplocaulus
   Aberrant Dung Beetle
   Aberrant Otter
   Aberrant Titanoboa
   Achatina
   Arthropluera
   Compy
   Dimetrodon
   Diplocaulus
   Dung Beetle
   Glowtail
   Otter
   Titanoboa
   `,
   45: `
   Aberrant Araneo
   Aberrant Beelzebufo
   Aberrant Dodo
   Aberrant Lystrosaurus
   Araneo
   Archaeopteryx
   Beelzebufo
   Bulbdog
   Dilophosaur
   Dodo
   Lystrosaurus
   Troodon
   `,
   75: `
   Aberrant Doedicurus
   Aberrant Megalania
   Direwolf
   Doedicurus
   Hyaenodon
   Megalania
   Shinehorn
   `,
   100: `
   Aberrant Ankylosaurus
   Aberrant Baryonyx
   Aberrant Dire Bear
   Aberrant Equus
   Aberrant Gigantopithecus
   Aberrant Moschops
   Aberrant Ovis
   Aberrant Parasaur
   Ankylosaurus
   Baryonyx
   Castoroides
   Direbear
   Equus
   Gigantopithecus
   Moschops
   Ovis
   Parasaur
   `,
   150: `
   Aberrant Iguanodon
   Aberrant Raptor
   Aberrant Triceratops
   Iguanodon
   Raptor
   Triceratops
   `,
   200: `
   Aberrant Carnotaurus
   Aberrant Sarco
   Argentavis
   Carnotaurus
   Sarco
   `,
   300: `
   Aberrant Stegosaurus
   Allosaurus
   Stegosaurus
   `,
   500: `
   Aberrant Diplodocus
   Aberrant Paraceratherium
   Aberrant Spino
   Brontosaurus
   Diplodocus
   Paracer
   Spino
   `,
   1000: `
   Giganotosaurus
   `,
   1500: `
   Dragon
   `
}

const WATER = `
   Aberrant Electrophorus
   Aberrant Anglerfish
   Aberrant Manta
   Basilosaurus
   Dunkleosteus
   Electrophorus
   Anglerfish
   Manta
`;

const OVERRIDES = {
   species: {
      'Aberrant Megalosaurus': { optionsAngle: 315 },
      'Aberrant Moschops': { optionsAngle: 270 },
      'Megalosaurus': { optionsAngle: 315 },
      'Moschops': { optionsAngle: 270 },
      'Griffin': { optionsAngle: 270 },
      'Bulbdog': { optionsAngle: 315 },
      'Featherlight': { optionsAngle: 315 },
      'Glowtail': { optionsAngle: 315 },
      'Shinehorn': { optionsAngle: 315 },
   },
};

const DISBALED = `
   Aberrant Baryonyx  // forcetame - look up
   Aberrant Beelzebufo  // forcetame - look down
   Aberrant Carnotaurus // forcetame - ?
   Aberrant Dimorphodon  // flyer with ramdom spawn behaviour
   Aberrant Pulmonoscorpius // forcetame - move backwards
   Aberrant Purlovia  // spawns in buried form sometimes
   Dragon  // can't be exported
   Baryonyx  // forcetame - look up
   Beelzebufo  // forcetame - look down
   Carnotaurus // forcetame - ?
   Dimorphodon  // flyer with ramdom spawn behaviour
   Featherlight  // flyer with random spawn behaviour
   Gallimimus  // forcetame - move backwards
   Hesperornis  // forcetame - spawns to the side
   Pulmonoscorpius // forcetame - move backwards
   Purlovia  // spawns in buried form sometimes
`;


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

      // Apply heights
      console.log("Recording spawn heights...");
      for (var [height, block] of Object.entries(HEIGHTS)) {
         var names = linq.from(block.split('\n')).where(s => s && s.trim()).select(s => s.trim()).toArray();
         for (var name of names) {
            try {
               output.species[name].spawnHeight = height;
            }
            catch (ex) {
               console.error("Not found: " + name);
               throw ex;
            }
         }
      }

      // Mark water-only creatures
      console.log("Marking water-only species...");
      var waterNames = linq.from(WATER.split('\n')).where(s => s && s.trim()).select(s => s.trim()).toArray();
      for (var name of waterNames) {
         output.species[name].waterOnly = true;
      }

      // Mark disabled creatures
      console.log("Marking disabled species...");
      var waterNames = linq.from(DISBALED.split('\n')).where(s => s && s.trim()).select(s => s.split('//')[0].trim()).toArray();
      for (var name of waterNames) {
         output.species[name].disabled = true;
      }

      // Apply overrides
      console.log("Applying overrides...");
      output = merge(output, OVERRIDES);

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
