// @ts-ignore
import withRender from './Database.html?style=./Database.css';

//import Vue from 'vue';
//import PouchDB from 'pouchdb-browser';
import YANG from 'yet-another-name-generator';

import * as app from '../../app';

export default withRender({
   name: "Tester",

   pouch: {
      creatures() {
         if (!!this.species) {
            return { species: this.species };
         }
         else {
            return { species: { $ne: '' } };
         }
      },
   },

   data: () => ({
      newRow: {
         species: '',
         name: '',
      },

      fields: [
         'index',
         { key: 'species', sortable: true, },
         { key: 'name', sortable: true, },
         { key: 's0', label: '1', sortable: true },
         { key: 's1', label: '2', sortable: true },
         { key: 's2', label: '3', sortable: true },
         { key: 's3', label: '4', sortable: true },
         { key: 's4', label: '5', sortable: true },
         { key: 's5', label: '6', sortable: true },
         { key: 's6', label: '7', sortable: true },
         { key: 'controls', label: '&nbsp;' },
      ],

      species: 'Mosasaurus',
   }),

   computed: {
      speciesNames() { return app.data.speciesNames; },
   },

   methods: {
      resetNewRow() {
         this.newRow = {
            species: '',
            name: '',
         };
      },

      remove(item) {
         this.$pouch.remove('creatures', item._id, item._rev);
      },

      destroyAll() {
         this.$pouch.destroy("creatures");
      },

      createMany() {
         var objs = [];
         for (let i = 100; i >= 0; i--) {
            var obj = {
               name: YANG.generate({ titleize: true }),
               species: app.data.speciesNames[Math.floor(Math.random() * app.data.speciesNames.length)],
               s0: Math.floor(Math.random() * 100),
               s1: Math.floor(Math.random() * 100),
               s2: Math.floor(Math.random() * 100),
               s3: Math.floor(Math.random() * 100),
               s4: Math.floor(Math.random() * 100),
               s5: Math.floor(Math.random() * 100),
               s6: Math.floor(Math.random() * 100),
            };
            objs.push(obj);
         }

         this.$pouch.bulkDocs("creatures", objs);
      },

      async initDatabase() {
         //let db = new PouchDB('creatures');

         try {
            // These do nothing if the index already exists
            //await db.createIndex({ index: { fields: ['species'] } });
            //await db.createIndex({ index: { fields: ['name'] } });
         }
         catch (err) {
            console.error(err);
         }
      },
   },

   created: async function () {
      await this.initDatabase();
      //this.$pouch.sync('creatures', '...remote host...');
   },
});
