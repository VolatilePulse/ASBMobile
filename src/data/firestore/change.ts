import { applyDiff, Changes, findDiff, MergeChange, MergeChanges } from '@/data/firestore/diff';
import { AssertionError } from 'assert';
import { cloneDeep, intersection } from 'lodash';
import Vue from 'vue';


export class ChangeHandler<T extends object> {
   public isActive: boolean = false;
   public user: T = null;
   public network: T = null;
   public conflicts: any = {};

   constructor(initialData?: T) {
      initialData = initialData || {} as any;
      this.network = cloneDeep(initialData);
      this.user = cloneDeep(initialData);
   }

   public get hasConflicts() {
      return Object.keys(this.conflicts).length > 0;
   }

   /**
    * Accept new data for this document.
    * Non-conflicting changes are merged into the data immediately.
    * Records remaining conflicts.
    * @param newData New data that has arrived for the document
    */
   public acceptNewData(newData: T, dbg: boolean = false) {
      if (!this.isActive) this.isActive = true;

      newData = cloneDeep(newData);
      const prevNetwork = this.network;

      if (dbg) console.log('New data...');

      // Calculate current user diff (old network -> user)
      const userDiff = findDiff(prevNetwork, this.user);
      if (dbg) console.log('User diff:', applyDiff({}, userDiff, '<deleted>'));

      // Calculate the network's changes (old network -> new network)
      const networkDiff = findDiff(prevNetwork, newData);
      if (dbg) console.log('Network diff:', applyDiff({}, networkDiff, '<deleted>'));

      // Update conflicts
      updateConflicts(this.conflicts, userDiff, networkDiff);
      if (dbg) console.log('Conflicts:', this.conflicts);

      // Merge non-conflicting network changes into user data
      const cleanNetworkDiff = separateCleanDiffs(this.conflicts, networkDiff);
      applyDiff(this.user, cleanNetworkDiff);

      // Replace network data
      this.network = newData;

      if (dbg) console.log('Updated user data:', this.user);
      if (dbg) console.log('Updated network data:', this.network);
   }

   public notifyUserDirty() {
      // do nothing
   }
}

function updateConflicts(conflicts: MergeChanges, ourDiff: Changes, theirDiff: Changes) {
   // Remove conflicts where network data now matches user
   for (const [path, conflict] of Object.entries(conflicts)) {
      if (path in theirDiff && conflict.ourChange.operation === theirDiff[path].operation) {
         Vue.delete(conflicts, path);
      }
   }

   // Add new conflicts where data differs
   for (const path of intersection(Object.keys(ourDiff), Object.keys(theirDiff))) {
      if (path in conflicts) throw new AssertionError({ message: 'Unexpected error: path already conflicting' });
      if (ourDiff[path].operation === theirDiff[path].operation) {
         if (ourDiff[path].operation === 'delete') continue;
         // tslint:disable-next-line:triple-equals
         if ((ourDiff[path] as any).value == (theirDiff[path] as any).value) continue;
      }

      const conflict: MergeChange = {
         operation: 'merge',
         ourChange: ourDiff[path],
         theirChange: theirDiff[path],
      };
      Vue.set(conflicts, path, conflict);
   }
}

function separateCleanDiffs(conflicts: MergeChanges, changes: Changes) {
   const cleanDiff: Changes = {};

   for (const [path, change] of Object.entries(changes)) {
      if (path in conflicts) continue;
      cleanDiff[path] = change;
   }

   return cleanDiff;
}
