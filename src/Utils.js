/**
 * @fileOverview Miscellaneous functions used throughout the app
 */

"use strict";

var Utils = {
   /**
    * @description Async JSON file read
    * @param {string} file Path to the file
    * @param {function} callback On success, function to call with returned data
    * @namespace Utils
    */
   AsyncFileRead(filePath) {
      return new Promise((resolve, reject) => {
         const xhr = new XMLHttpRequest();
         xhr.overrideMimeType("application/json");
         xhr.open("GET", filePath);
         xhr.onload = () => resolve(xhr.responseText);
         xhr.onerror = () => reject(xhr.statusText);
         xhr.send();
      });
   },
   
   /**
    * @description Rounds a number to a set decimal place for comparison
    * @param {number} num Value that needs rounded
    * @param {number} n Number of decimals to be rounded to
    * @returns {float} Decimal rounded to the specified precision
    * @name RoundTo
    * @see Precision
    */
   RoundTo(num, n = 0) {
      return +Number(num + 1E-10).toFixed(n);
   },

   /**
    * @description Simple object check.
    * @namespace Utils
    * @param item
    * @returns {boolean}
    */
   IsObject(item) {
      return (item && typeof item === 'object' && !Array.isArray(item));
   },

   /**
    * @description Deep merge two objects.
    * @namespace Utils
    * @param target
    * @param ...sources
    */
   DeepMerge(target, ...sources) {
      if (!sources.length)
         return target;

      const source = sources.shift();

      if (Utils.IsObject(target) && Utils.IsObject(source)) {
         for (const key in source) {
            if (Utils.IsObject(source[key])) {
               if (!target[key])
                  Object.assign(target, {[key]: {}});
               Utils.DeepMerge(target[key], source[key]);
            }
            else
               Object.assign(target, {[key]: source[key]});
         }
      }

      return Utils.DeepMerge(target, ...sources);
   }
}
