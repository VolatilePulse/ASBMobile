import _ from 'lodash';
import { isString } from 'util';

/** @fileOverview Miscellaneous functions used throughout the app */


const EPSILON = 1E-10;

/**
 * Async JSON file read
 * @async
 */
export function AsyncFileRead(filePath: string): Promise<string> {
   return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.overrideMimeType('application/json');
      xhr.open('GET', filePath);
      xhr.onload = () => resolve(xhr.responseText);
      xhr.onerror = () => reject(xhr.statusText);
      // xhr.onerror = () => resolve(null);
      xhr.send();
   });
}

const formattersCache: Map<{ places: number, fixed: boolean }, Intl.NumberFormat> = new Map();

/**
 * Format a number neatly for presentation to the user.
 * This method uses a cached Intl.NumberFormat object for each combination of places and fixed.
 * @param {number} value The value to format
 * @param {number} places Number of decimal places, at most, to show
 * @param {boolean} fixed True to always show digits after the decimal place when they are zero
 */
export function FormatNumber(value: number, places: number = 1, fixed: boolean = false) {
   let formatter = formattersCache.get({ places, fixed });
   if (!formatter) {
      // @ts-ignore
      const locale: string = navigator['language'] || (navigator['languages'] && navigator.languages[0]) || (navigator['browserLanguage'] as string) || 'en';
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
   return FilledArray(length, (_value, i) => i);
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
   return new Promise((resolve, _reject) => setTimeout(() => resolve(), duration));
}

/**
 * Return a function that can be used directly in a .then which delays 'duration' milliseconds, passing received arguments through.
 * @param {number} duration Number of milliseconds to delay for.
 */
export function DelayFunction(duration: number) {
   // tslint:disable-next-line:only-arrow-functions
   return function (...args: any[]) {
      return new Promise((resolve, _reject) => setTimeout(() => resolve(...args), duration));
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
export function CompareFloat(a: number, b: number, epsilon: number = EPSILON) {
   if (!Number.isFinite(a) || !Number.isFinite(b)) return undefined;

   const diff = Math.abs(a - b);
   return diff < epsilon;
}

/**
 * Rounds a number to a set decimal place for comparison
 * @param {number} num Value that needs rounded
 * @param {number} places Number of decimals to be rounded to
 * @returns {number} Decimal rounded to the specified precision
 */
export function RoundTo(num: number, places: number = 0): number {
   return +Number(num + EPSILON).toFixed(places);
}

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function IsObject(item: any) {
   return (item && typeof item === 'object' && !Array.isArray(item));
}

export function IsFunction(item: any) {
   return (item && typeof item === 'function');
}

export function DeepCopy<T>(obj: T): T {
   return _.cloneDeepWith(obj, CloneCustomizer);
}

function CloneCustomizer<T>(_value: T, key: string | number): any | null {
   if (!key) return undefined;
   if (isString(key) && key.startsWith('__')) return null;
}

/**
 * Deep merge two objects.
 * @param {object} target
 * @param {object[]} sources
 */
export function DeepMerge<T extends Bag>(target: T, ...sources: Bag[]): T {
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

interface Bag {
   [key: string]: any;
   [key: number]: any;
}

/**
 * Deep merge two objects, except don't overwrite a value with 'undefined' and don't touch anything starting with '_'.
 * @param {object} target
 * @param {object[]} sources
 */
export function DeepMergeSoft<T extends Bag>(target: T, ...sources: Bag[]): T {
   if (!sources.length)
      return target;

   const source = sources.shift();

   if (IsObject(target) && IsObject(source)) {
      for (const key in source) {
         if (typeof key === 'string' && key.startsWith('_')) continue;
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

/**
 * Decorator used to log method calls.
 * @example
 * class Thing {
 *    @dbgLog
 *    myMethod(arg1, arg2) {
 *       // do stuff & things
 *    }
 * }
 */
export function dbgLog(_target: any, propertyKey: string, descriptor: PropertyDescriptor): any {
   const oldValue = descriptor.value;

   // tslint:disable-next-line:only-arrow-functions - required to use the correct `this`
   descriptor.value = function () {
      console.group(propertyKey, arguments);
      const value = oldValue.apply(this, arguments);
      console.groupEnd();
      return value;
   };

   return descriptor;
}

/** Load text from a drag-and-dropped file blob */
export function ReadDroppedBlob(blob: Blob): Promise<string> {
   return new Promise<string>((resolve, reject) => {
      const fr = new FileReader();
      fr.addEventListener('loadend', () => resolve(fr.result));
      fr.addEventListener('error', () => reject(fr.error));
      fr.readAsText(blob);
   });
}

/** Generator that returns regex matches from the supplied string */
export function* GenerateRegexMatches(re: RegExp, str: string) {
   let m;
   // tslint:disable-next-line:no-conditional-assignment
   while ((m = re.exec(str)) !== null) {
      if (m.index === re.lastIndex) re.lastIndex++;
      yield m;
   }
}

const blockRe = /^\[(.*)\][\r\n]+(?:[ \w]+(?:\[\d+\])?=.*[\r\n]+)+/mg;
const lineRe = /^([ \w]+(?:\[\d+\])?)=(.*)[\r\n]+/gm;

/**
 * Parse an ini file.
 * Note that all block and field names are converted to lower-case.
 */
export function ParseIni(content: string) {
   const byIndex = [];
   const byName: { [name: string]: { [name: string]: string } } = {};

   for (const [block, name] of GenerateRegexMatches(blockRe, content)) {
      if (!name) continue;

      const blockByName: { [name: string]: string } = {};
      const blockByIndex: string[] = [];
      (blockByIndex as any).label = name;

      for (const [, label, value] of GenerateRegexMatches(lineRe, block)) {
         blockByIndex.push(value);
         blockByName[label.toLowerCase()] = value;
      }

      byIndex.push(blockByIndex);
      byName[name.toLowerCase()] = blockByName;
   }
   return { byIndex, byName };
}
