// @ts-ignore
import withRender from './Settings.html?style=./Settings.css';

import * as app from '../../app';

export default withRender({
   name: 'settings',

   data: () => ({
      settings: app.settings.current,
      newLibraryName: '',
      renameLibraryName: '',
      renameLibraryId: '',
      deleteLibraryId: '',
   }),

   computed: {
      renameLibraryNameValidity() { return this.renameLibraryName ? null : false; },
   },

   methods: {
      markDirty() { app.settings.notifyChanged(); },
      createLibrary() { app.libraries.createNewLibrary(this.newLibraryName); this.newLibraryName = ''; },
      selectLibrary(id) { app.libraries.selectLibrary(id); },
      deleteLibrary(id) { this.deleteLibraryId = id; this.$refs.deleteLibraryModal.show(); },
      deleteLibraryConfirmed() { app.libraries.deleteLibrary(this.deleteLibraryId); this.$refs.deleteLibraryModal.hide(); },

      renameLibrary(id) {
         this.renameLibraryId = id;
         this.renameLibraryName = app.settings.current.libraryNames[id];
         this.$refs.renameLibraryModal.show();
      },

      renameLibrarySubmit() {
         if (this.renameLibraryNameValidity != false) {
            app.libraries.renameLibrary(this.renameLibraryId, this.renameLibraryName);
            this.$refs.renameLibraryModal.hide();
         }
      },
   },
});
