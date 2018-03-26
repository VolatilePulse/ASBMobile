import { Vue, Component } from 'vue-property-decorator';
import Common from '@/ui/behaviour/Common';
import { SettingsManager, LibraryManager } from '@/data';


@Component
export default class extends Common {
   settings = SettingsManager.current;
   newLibraryName = '';
   renameLibraryName = '';
   renameLibraryId = '';
   deleteLibraryId = '';


   get renameLibraryNameValidity() { return this.renameLibraryName ? null : false; }

   $refs: Vue['$refs'] & {
      deleteLibraryModal: any;
      renameLibraryModal: any;
   };


   markDirty() { SettingsManager.notifyChanged(); }
   createLibrary() { LibraryManager.createNewLibrary(this.newLibraryName); this.newLibraryName = ''; }
   selectLibrary(id: string) { LibraryManager.selectLibrary(id); }
   deleteLibrary(id: string) { this.deleteLibraryId = id; this.$refs.deleteLibraryModal.show(); }
   deleteLibraryConfirmed() { LibraryManager.deleteLibrary(this.deleteLibraryId); this.$refs.deleteLibraryModal.hide(); }

   renameLibrary(id: string) {
      this.renameLibraryId = id;
      this.renameLibraryName = SettingsManager.current.libraryNames[id];
      this.$refs.renameLibraryModal.show();
   }

   renameLibrarySubmit() {
      if (this.renameLibraryNameValidity !== false) {
         LibraryManager.renameLibrary(this.renameLibraryId, this.renameLibraryName);
         this.$refs.renameLibraryModal.hide();
      }
   }
}
