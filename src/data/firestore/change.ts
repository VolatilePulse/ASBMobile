import { findDiff, mergeDiffs, resolveAllConflicts } from '@/data/firestore/diff';
import { cloneDeep } from 'lodash';


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

   /**
    * Accept new data for this document.
    * Non-conflicting changes are merged into the data immediately.
    * Records remaining conflicts.
    * @param newData New data that has arrived for the document
    */
   public acceptNewData(newData: T, dbg: boolean = false) {
      if (!this.isActive) this.isActive = true;

      if (dbg) console.log('New data...');
      const prevNetwork = this.network;

      // Calculate current user diff (old network -> user)
      const userDiff = findDiff(prevNetwork, this.user);
      if (dbg) console.log('User diff:', userDiff);

      // Calculate the network's changes (old network -> new network
      const networkDiff = findDiff(prevNetwork, newData);
      if (dbg) console.log('Network diff:', networkDiff);

      // Merge changes into user object, recording conflicts
      const mergeResult = mergeDiffs(prevNetwork, userDiff, networkDiff);

      // Make the conflicts available
      this.conflicts = mergeResult.conflicts;
      if (dbg) console.log('Conflicts:', this.conflicts);

      // Apply user-side of all conflicts to user object
      this.user = cloneDeep(mergeResult.target);
      resolveAllConflicts(this.user, this.conflicts, true);
      if (dbg) console.log('Updated user data:', this.user);
   }
}
