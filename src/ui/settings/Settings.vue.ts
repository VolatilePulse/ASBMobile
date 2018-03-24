import Vue from 'vue';
import Component from 'vue-class-component';

import WithRender from './Settings.html?style=./Settings.css';

import * as app from '@/app';
import theStore from '@/ui/store';


@WithRender
@Component({
   name: 'settings',
})
export default class SettingsComponent extends Vue {
   store = theStore;

   settings = app.settings.current;
   newLibraryName = '';
   renameLibraryName = '';
   renameLibraryId = '';
   deleteLibraryId = '';


   get renameLibraryNameValidity() { return this.renameLibraryName ? null : false; }

   $refs: Vue['$refs'] & {
      deleteLibraryModal: any;
      renameLibraryModal: any;
   };


   markDirty() { app.settings.notifyChanged(); }
   createLibrary() { app.libraries.createNewLibrary(this.newLibraryName); this.newLibraryName = ''; }
   selectLibrary(id: string) { app.libraries.selectLibrary(id); }
   deleteLibrary(id: string) { this.deleteLibraryId = id; this.$refs.deleteLibraryModal.show(); }
   deleteLibraryConfirmed() { app.libraries.deleteLibrary(this.deleteLibraryId); this.$refs.deleteLibraryModal.hide(); }

   renameLibrary(id: string) {
      this.renameLibraryId = id;
      this.renameLibraryName = app.settings.current.libraryNames[id];
      this.$refs.renameLibraryModal.show();
   }

   renameLibrarySubmit() {
      if (this.renameLibraryNameValidity !== false) {
         app.libraries.renameLibrary(this.renameLibraryId, this.renameLibraryName);
         this.$refs.renameLibraryModal.hide();
      }
   }
}
