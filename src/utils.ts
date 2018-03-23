/**
 * @fileOverview Miscellaneous functions used throughout the app
 */

import cloneDeepWith from 'lodash.clonedeepwith';
import isEqual from 'lodash.isequal';
import isEqualWith from 'lodash.isequalwith';

/**
 * Async JSON file read
 * @async
 */
export function AsyncFileRead(filePath: string): Promise<string> {
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

const formattersCache: Map<{ places: number, fixed: boolean }, Intl.NumberFormat> = new Map();

/**
 * Format a number neatly for presentation to the user.
 * @param {number} value The value to format
 * @param {number} places Number of decimal places, at most, to show
 * @param {boolean} fixed True to always show digits after the decimal place when they are zero
 */
export function FormatNumber(value: number, places = 1, fixed = false) {
   let formatter = formattersCache.get({ places, fixed });
   if (!formatter) {
      var locale = navigator['language'] || (navigator['languages'] && navigator.languages[0]) || navigator['browserLanguage'] || 'en';
      if (fixed)
         formatter = new Intl.NumberFormat(locale, { maximumFractionDigits: places, minimumFractionDigits: places, useGrouping: false });
      else
         formatter = new Intl.NumberFormat(locale, { maximumFractionDigits: places, useGrouping: false });
      formattersCache.set({ places, fixed }, formatter);
   }
   return formatter.format(value);
}

/**
 * Create an array containing numbers from zero to 'number'-1.
 * @param {number} length Length of the array
 */
export function Range(length: number) {
   return FilledArray(length, (_, i) => i);
}

/**
 * Create an array pre-filled with data supplied by the given function. Example FilledArray(4, () => []) creates [[],[],[],[]].
 * @param {number} length The length of the array
 * @param {function} fn A function to call to get the contents of an element, passed (undefined, index)
 */
export function FilledArray<T>(length: number, fn: (_: null, i: number) => T): T[] {
   return Array.apply(null, Array(length)).map(fn);
}

/**
 * Return a promise that will be resolved after 'duration' milliseconds, passing received arguments through.
 * @param {number} duration Number of milliseconds to delay for.
 */
export function Delay(duration: number) {
   return new Promise(function (resolve, _) {
      setTimeout(() => resolve(), duration);
   });
}

/**
 * Return a function that can be used directly in a .then which delays 'duration' milliseconds, passing received arguments through.
 * @param {number} duration Number of milliseconds to delay for.
 */
export function DelayFunction(duration: number) {
   return function (...args) {
      return new Promise(function (resolve, _) {
         setTimeout(() => resolve(...args), duration);
      });
   };
}

/**
 * Returns true if two numbers are closer then the given difference.
 * Return false otherwise.
 * Return undefined if either argument is not a number or not finite.
 * @param {number} a A
 * @param {number} b B
 * @param {number} epsilon Difference limit
 */
export function CompareFloat(a: number, b: number, epsilon = 1E-10) {
   if (!Number.isFinite(a) || !Number.isFinite(b)) return undefined;

   var diff = Math.abs(a - b);
   return diff < epsilon;
}

/**
 * Rounds a number to a set decimal place for comparison
 * @param {number} num Value that needs rounded
 * @param {number} places Number of decimals to be rounded to
 * @returns {number} Decimal rounded to the specified precision
 */
export function RoundTo(num: number, places = 0) {
   return +Number(num + 1E-10).toFixed(places);
}

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function IsObject(item) {
   return (item && typeof item === 'object' && !Array.isArray(item));
}

export function IsFunction(item) {
   return (item && typeof item === 'function');
}

export function DeepCompare(a, b, fn) {
   if (fn) return isEqualWith(a, b, fn);
   return isEqual(a, b);
}

export function DeepCopy<T>(obj: T): T {
   return cloneDeepWith(obj, CloneCustomizer);
}

function CloneCustomizer(value, key) {
   if (!key) return value;
   if (key.startsWith('_')) return null;
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

/**
 * Deep merge two objects, except don't overwrite a value with 'undefined' and don't touch anything starting with '_'.
 * @param {object} target
 * @param {object[]} sources
 */
export function DeepMergeSoft(target, ...sources) {
   if (!sources.length)
      return target;

   const source = sources.shift();

   if (IsObject(target) && IsObject(source)) {
      for (const key in source) {
         if (key.startsWith('_')) continue;
         if (IsObject(source[key])) {
            if (!target[key])
               Object.assign(target, { [key]: {} });
            DeepMergeSoft(target[key], source[key]);
         }
         else if (source[key] !== undefined)
            Object.assign(target, { [key]: source[key] });
      }
   }

   return DeepMergeSoft(target, ...sources);
}
