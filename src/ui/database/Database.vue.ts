import Vue from 'vue';
import Component from 'vue-class-component';

import WithRender from './Database.html?style=./Database.css';

// import PouchDB from 'pouchdb-browser';
import YANG from 'yet-another-name-generator';

import theStore from '@/ui/store';


@WithRender
@Component({
   name: 'database',
})
export default class SettingsComponent extends Vue {
   store = theStore;

   $pouch: any; // placeholder for pouch-vue's access methods, until we get better typings

   species: string = 'Mosasaurus';

   pouch = {
      creatures() {
         // @ts-ignore
         if (!!this.species) {
            // @ts-ignore
            return { species: this.species };
         }
         else {
            return { species: { $ne: '' } };
         }
      },
   };

   newRow = {
      species: '',
      name: '',
   };

   // Field definitons for the live table
   fields = [
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
   ];

   get speciesNames() { return theStore.speciesNames; }

   resetNewRow() {
      this.newRow = {
         species: '',
         name: '',
      };
   }

   remove(item) {
      this.$pouch.remove('creatures', item._id, item._rev);
   }

   destroyAll() {
      this.$pouch.destroy('creatures');
   }

   createMany() {
      const objs: any[] = [];
      for (let i = 100; i >= 0; i--) {
         const obj = {
            name: YANG.generate({ titleize: true }),
            species: theStore.speciesNames[Math.floor(Math.random() * theStore.speciesNames.length)],
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

      this.$pouch.bulkDocs('creatures', objs);
   }

   async initDatabase() {
      // let db = new PouchDB('creatures');

      try {
         // These do nothing if the index already exists
         // await db.createIndex({ index: { fields: ['species'] } });
         // await db.createIndex({ index: { fields: ['name'] } });
      }
      catch (err) {
         console.error(err);
      }
   }

   async created() {
      await this.initDatabase();
      // this.$pouch.sync('creatures', '...remote host...');
   }
}
