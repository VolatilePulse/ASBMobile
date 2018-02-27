/**
 * @fileOverview Miscellaneous functions used throughout the app
 */

"use strict";
/** @namespace */
var Utils = {
   /**
    * @description Async JSON file read
    * @param {string} file Path to the file
    * @param {function} callback On success, function to call with returned data
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
    * Create an array containing numbers from zero to 'number'-1.
    * @param {number} length Length of the array
    */
   Range(length) {
      return Utils.FilledArray(length, (_,i) => i);
   },

   /**
    * Create an array pre-filled with data supplied by the given function. Example FilledArray(4, () => []) creates [[],[],[],[]].
    * @param {number} length The length of the array
    * @param {function} fn A function to call to get the contents of an element, passed (undefined, index)
    */
   FilledArray(length, fn) {
      return Array.apply(null, Array(length)).map(fn);
   },

   /**
    * @description Return a promise that will be resolved after 'duration' milliseconds, passing received arguments through.
    * @param {number} duration Number of milliseconds to delay for. 
    */
   Delay(duration) {
         return new Promise(function (resolve, reject) {
            setTimeout(() => resolve(), duration);
         });
   },

   /**
    * @description Return a function that can be used directly in a .then which delays 'duration' milliseconds, passing received arguments through.
    * @param {number} duration Number of milliseconds to delay for. 
    */
   DelayFunction(duration) {
      return function (...args) {
         return new Promise(function (resolve, reject) {
            setTimeout(() => resolve(...args), duration);
         });
      };
   },

   /**
    * Rounds a number to a set decimal place for comparison
    * @param {number} num Value that needs rounded
    * @param {number} [n] Number of decimals to be rounded to
    * @returns {float} Decimal rounded to the specified precision
    */
   RoundTo(num, n = 0) {
      return +Number(num + 1E-10).toFixed(n);
   },

   /**
    * Simple object check.
    * @param item
    * @returns {boolean}
    */
   IsObject(item) {
      return (item && typeof item === 'object' && !Array.isArray(item));
   },

   /**
    * Deep merge two objects.
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
