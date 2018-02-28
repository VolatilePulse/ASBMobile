/**
 * @fileOverview Miscellaneous functions used throughout the app
 */

/**
 * Async JSON file read
 * @async
 * @function AsyncFileRead
 * @param {string} filePath to the file
 * @return {Promise<string>} The content of the file as JSON text
 */
export function AsyncFileRead(filePath) {
   return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.overrideMimeType("application/json");
      xhr.open("GET", filePath);
      xhr.onload = () => resolve(xhr.responseText);
      xhr.onerror = () => reject(xhr.statusText);
      //xhr.onerror = () => resolve(null);
      xhr.send();
   });
}

/**
 * Create an array containing numbers from zero to 'number'-1.
 * @param {number} length Length of the array
 */
export function Range(length) {
   return FilledArray(length, (_, i) => i);
}

/**
 * Create an array pre-filled with data supplied by the given function. Example FilledArray(4, () => []) creates [[],[],[],[]].
 * @param {number} length The length of the array
 * @param {function} fn A function to call to get the contents of an element, passed (undefined, index)
 */
export function FilledArray(length, fn) {
   return Array.apply(null, Array(length)).map(fn);
}

/**
 * Return a promise that will be resolved after 'duration' milliseconds, passing received arguments through.
 * @param {number} duration Number of milliseconds to delay for.
 */
export function Delay(duration) {
   return new Promise(function (resolve, _) {
      setTimeout(() => resolve(), duration);
   });
}

/**
 * Return a function that can be used directly in a .then which delays 'duration' milliseconds, passing received arguments through.
 * @param {number} duration Number of milliseconds to delay for.
 */
export function DelayFunction(duration) {
   return function (...args) {
      return new Promise(function (resolve, _) {
         setTimeout(() => resolve(...args), duration);
      });
   };
}

/**
 * Rounds a number to a set decimal place for comparison
 * @param {number} num Value that needs rounded
 * @param {number} [n] Number of decimals to be rounded to
 * @returns {number} Decimal rounded to the specified precision
 */
export function RoundTo(num, n = 0) {
   return +Number(num + 1E-10).toFixed(n);
}

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function IsObject(item) {
   return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Deep merge two objects.
 * @param {object} target
 * @param {object[]} sources
 */
export function DeepMerge(target, ...sources) {
   if (!sources.length)
      return target;

   const source = sources.shift();

   if (IsObject(target) && IsObject(source)) {
      for (const key in source) {
         if (IsObject(source[key])) {
            if (!target[key])
               Object.assign(target, { [key]: {} });
            DeepMerge(target[key], source[key]);
         }
         else
            Object.assign(target, { [key]: source[key] });
      }
   }

   return DeepMerge(target, ...sources);
}
