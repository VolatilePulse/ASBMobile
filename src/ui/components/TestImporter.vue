<template>
   <section>
      <!-- file import -->
      <div class="dropbox mt-3">
         <input type="file" multiple class="input-file" @change="dropFilesChange($event.target.files)">
         <ol class="py-4 pr-3">
            <li>Choose the correct server in Servers.</li>
            <li>Drag one or more exported creature's
               <span class="text-warning">.ini</span> files to this box, or click to browse.
            </li>
            <li>Copy the generated tests to
               <span class="text-warning">test_data.ts</span>.
            </li>
         </ol>
      </div>
      <pre v-if="exportedTestInfo" class="gen-text p-2 small" style="overflow-x:auto">{{exportedTestInfo}}</pre>
   </section>
</template>


<style lang="scss" scoped>
.dropbox {
  outline: 2px dashed grey;
  outline-offset: -10px;
  background: #334;
  position: relative;
  cursor: pointer;
}

.dropbox .input-file {
  opacity: 0;
  width: 100%;
  height: 100%;
  position: absolute;
  cursor: pointer;
}

.dropbox:hover {
  background: #445;
}

.gen-text {
  background: rgb(51, 68, 51);
}
</style>


<script lang="ts">
import { Component } from 'vue-property-decorator';
import Common, { catchAsyncErrors } from '@/ui/behaviour/Common';
import { parseExportedCreature } from '@/ark/import/ark_export';
import { ReadDroppedBlob } from '@/utils';


@Component({ name: 'TestImporter' })
export default class Testimporter extends Common {
   exportedTestInfo: string = null;

   /** Handle changes to the file-drop target */
   @catchAsyncErrors
   async dropFilesChange(files: FileList) {
      this.exportedTestInfo = '';
      const filesArray = Array.from(files);

      // Get the Blobs out of the file list
      const blobs = filesArray.map(data => data.slice());

      // Start a FileReader for each Blob
      const loadPromises = blobs.map(ReadDroppedBlob);

      // Wait for all the FileReaders to complete
      const fileData = await Promise.all(loadPromises);

      // Convert to a test and output
      this.exportedTestInfo = fileData.map(ini => generateTestFromExport(ini, this.store.server._id)).join('\n');

      // Scroll down once the DOM is updated
      await this.$nextTick();
      window.scrollTo(undefined, 1E6);
   }
}


function generateTestFromExport(ini: string, serverId: string): string {
   const data = parseExportedCreature(ini);
   return `{
   tag: '',
   species: '${data.species}', level: ${data.level}, imprint: ${data.imprint || 0}, mode: '${data.mode}',
   values: [${data.values.join(', ')}],
   serverId: '${serverId}',
   results: [],
},`;
}
</script>
