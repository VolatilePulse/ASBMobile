import { isEqual } from 'lodash';


type Change = {
   operation: 'add' | 'update';
   value: any;
} | {
   operation: 'delete',
};

export interface MergeChange {
   operation: 'merge';
   ourChange: Change;
   theirChange: Change;
}

interface Changes {
   [path: string]: Change;
}

export interface MergeChanges {
   [path: string]: MergeChange;
}


function getType(obj: any) {
   return typeof obj;
}

export function findDiff(ob1: any, ob2: any, path?: string, result?: Changes): Changes {
   let val1, val2, newpath, key;
   const type1 = getType(ob1);
   const type2 = getType(ob2);

   // initialize
   if (path == null || typeof path !== 'string') {
      path = ''; // root path
   }
   if (result == null || typeof result !== 'object') {
      result = {};
   }

   // diff
   if (ob1 == null || ob2 == null) {
      if (ob1 !== ob2) {
         if (type1 === 'undefined') {
            result[path] = { operation: 'add', value: ob2 };
         }
         else if (type2 === 'undefined') {
            result[path] = { operation: 'delete' };
         }
         else {
            result[path] = { operation: 'update', value: ob2 };
         }
      }
   }
   else if (type1 !== type2 || type1 !== 'object' || type2 !== 'object') {
      if (ob1 !== ob2) {
         result[path] = { operation: 'update', value: ob2 };
      }
   }
   else {
      for (key in ob1) {
         newpath = path + '.' + key;
         val1 = ob1[key];
         val2 = ob2[key];

         if (val1 == null || val2 == null) {
            if (val1 !== val2) {
               if (typeof val1 === 'undefined') {
                  result[newpath] = { operation: 'add', value: val2 };
               }
               else if (typeof val2 === 'undefined') {
                  result[newpath] = { operation: 'delete' };
               }
               else {
                  result[newpath] = { operation: 'update', value: val2 };
               }
            }
         }
         else {
            if (getType(val1) !== getType(val2)) {
               result[newpath] = { operation: 'update', value: val2 };
            }
            else {
               if (typeof val1 === 'object') {
                  findDiff(val1, val2, newpath, result);
               }
               else {
                  if (val1 !== val2) {
                     result[newpath] = { operation: 'update', value: val2 };
                  }
               }
            }
         }
      }
      for (key in ob2) {
         newpath = path + '.' + key;
         val1 = ob1[key];
         val2 = ob2[key];
         if (val1 !== val2) {
            if (typeof val1 === 'undefined') {
               result[newpath] = { operation: 'add', value: val2 };
            }
         }
      }
   }
   return result;
}

export function applyDiff(target: any, diffs: Changes, deletedValue?: any): any {
   let path: string, diffOb: Change;

   if (diffs == null) {
      throw new Error('No diff object is provided, Nothing to apply');
   }

   for (const key in diffs) {
      path = key;
      diffOb = diffs[key];
      if (diffOb.operation === 'add' || diffOb.operation === 'update') {
         if (path === '') {
            target = diffOb.value;
            break;
         }
         setValueByPath(target, path, diffOb.value);
      }
      else if (diffOb.operation === 'delete') {
         if (path === '.') {
            target = null;
            break;
         }
         if (deletedValue != null)
            setValueByPath(target, path, deletedValue);
         else
            deleteValueByPath(target, path);
      }
      else {
         throw new Error('malformed diff object');
      }
   }
   return target;
}

export function resolveAllConflicts(target: any, conflicts: MergeChanges, oursNotTheirs: boolean, deletedValue?: any) {
   for (const [path, conflict] of Object.entries(conflicts)) {
      resolveConflict(target, path, conflict, oursNotTheirs, deletedValue);
   }
}

export function resolveConflict(target: any, path: string, change: MergeChange, oursNotTheirs: boolean, deletedValue?: any) {
   if (change.operation !== 'merge') throw new Error('Change must be from a conflict');
   if (oursNotTheirs !== true && oursNotTheirs !== false) throw new Error('oursNotTheirs must be explicitly set');

   const source = oursNotTheirs ? change.ourChange : change.theirChange;
   applyDiff(target, { [path]: source }, deletedValue);
}

interface MergeResult {
   target: any;
   conflicts: MergeChanges;
}

export function mergeDiffs(target: any, ourChanges: Changes, theirChanges: Changes, deletedValue?: any): MergeResult {
   const result: MergeResult = {
      target,
      conflicts: {},
   };

   // scan our changes, saving as either conflicting or safe
   const safeChanges: Changes = {};
   Object.entries(ourChanges).forEach(([ourPath, ourChange]) => {
      const overlap = Object.keys(theirChanges).some(theirPath => ourPath === theirPath && !isEqual(theirChanges[theirPath], ourChange));
      if (overlap) {
         result.conflicts[ourPath] = { operation: 'merge', ourChange, theirChange: theirChanges[ourPath] };
      }
      else {
         safeChanges[ourPath] = ourChange;
      }
   });

   // pick up the remaining changes from their side that are safe
   Object.entries(theirChanges).forEach(([theirPath, theirChange]) => {
      const overlap = Object.keys(ourChanges).some(ourPath => theirPath.startsWith(ourPath));
      if (!overlap) safeChanges[theirPath] = theirChange;
   });

   // apply safe changes to the target
   applyDiff(target, safeChanges, deletedValue);

   return result;
}

function setValueByPath(ob: any, path: string, value: any) {
   const keys = path.split('.');
   keys.shift();
   let val = ob;
   const length = keys.length;
   for (let i = 0; i < length; i++) {
      if (val == null || keys[i].length < 1) {
         throw new Error('Invalid data');
      }
      if (i !== length - 1) {
         val = val[keys[i]];
      }
      else {
         val[keys[i]] = value;
      }
   }
   return ob;
}

function deleteValueByPath(ob: any, path: string) {
   const keys = path.split('.');
   keys.shift(); // removing initial blank element ''
   let val = ob;
   const length = keys.length;
   for (let i = 0; i < length; i++) {
      if (i !== length - 1) {
         if (val[keys[i]] == null) {
            throw new Error('invalid data');
         }
         val = val[keys[i]];
      }
      else {
         delete val[keys[i]];
      }
   }
   return ob;
}
