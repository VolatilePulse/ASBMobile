"use strict";

var ASBM = ASBM || {};
ASBM.UI = ASBM.UI || {};

ASBM.UI.Extractor = {
   Create() {
      return Vue.component("extractor", {
         props: [],
         template: "#extractor-template",

         data: () => ({
            testData: testData,

            species: "Rex",
            mode: "Tamed",
            imprint: 0,
            level: "",
            exactly: false,
            stats: new Array(8),

            extractor: {},
         }),

         computed: {
            speciesNames: () => app.speciesNames,
            statImages: () => app.statImages,
         },
         
         methods: {
            extract: () => ASBM.UI.Extractor.PerformExtraction(app.$refs.extractor),
            insertTestData: InsertTestData,
            formatFloat: (n, decimalPlaces = 2) => new Intl.NumberFormat({ maximumFractionDigits: decimalPlaces, useGrouping: false }).format(n),
            formatRound: n => new Intl.NumberFormat({ maximumFractionDigits: 0, useGrouping: false }).format(n),
            debugShowOptions: options => options.map(stat => `(${stat.Lw}+${stat.Ld})`).join(','),
            debugStatValue: (i, extractor) => extractor.stats[i][0].calculateValue(Ark.GetMultipliers(extractor.server, extractor.species)[i], !extractor.wild, extractor.TE, extractor.IB),
         },
      });
   },

   // TODO: Prevent user from crashing the app by entering bad data
   PerformExtraction(ui) {
      // Read values from the UI
      var species = ui.species;
      var level = ui.level;
      var isWild = (ui.mode == "Wild");
      var isTamed = (ui.mode == "Tamed");
      var isBred = (ui.mode == "Bred");
      var imprintBonus = ui.imprint / 100;
      var exactly = !!ui.exactly;
      var singlePlayer = !!ui.singlePlayer;

      // Prepare the input values for use with the extractor
      var values = ui.stats.map(Ark.ConvertValue);

      let multipliers = Ark.GetMultipliers(app.currentServer, ui.species);

      // Set the vueCreature properties to prepare for extraction
      app.vueCreature.wild = (ui.mode == "Wild");
      app.vueCreature.tamed = (ui.mode == "Tamed");
      app.vueCreature.bred = (ui.mode == "Bred");
      app.vueCreature.IB = ui.imprint / 100;
      app.vueCreature.exactly = !!ui.exactly;
      app.vueCreature.values = ui.stats.map(Ark.ConvertValue);
      app.vueCreature.server = new ASBM.Server(null, 1, !!ui.singlePlayer);
      app.vueCreature.level = ui.level;
      app.vueCreature.species = ui.species;

      let extractObject = new ASBM.Extractor(app.vueCreature);
      extractObject.extract();

      // Copy into `app` so they will be displayed
      ui.results = app.vueCreature.stats;
      ui.extractor = app.vueCreature;
   },
};
