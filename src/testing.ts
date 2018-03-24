import * as Ark from './ark';
import * as Utils from './utils';
import { Extractor } from './ark/extractor';
import { VueCreature } from './ark/creature';
import { isNumber, isString, isFunction, isObject, isArray } from 'util';


interface TestResult {
   pass: boolean | undefined;
   stats: Stat[][];
   options: Stat[][];
   dbg?: any;
   extra: { [key: string]: any };
   exception?: any;
   failReason?: string;
   duration?: number;
}

export function PerformTest(testData) {
   const testCreature = new VueCreature();

   // Set the properties to prepare for extraction
   testCreature.wild = (testData.mode === 'Wild');
   testCreature.tamed = (testData.mode === 'Tamed');
   testCreature.bred = (testData.mode === 'Bred');
   testCreature.IB = testData.imprint / 100;
   testCreature.values = testData.values.map(Ark.ConvertValue);
   testCreature.serverName = testData.serverName;
   testCreature.level = testData.level;
   testCreature.species = testData.species;

   const extractObject = new Extractor(testCreature);

   const dbg: any = {
      totalRecursion: 0,
      numberRemoved: 0,
   };

   let t1: number, t2: number;
   let exception: Error;

   try {
      t1 = performance.now();
      extractObject.extract(dbg);
      t2 = performance.now();
   }
   catch (ex) {
      exception = ex;
   }

   const result: TestResult = {
      pass: false,
      stats: testCreature['stats'],
      options: extractObject['options'],
      dbg: dbg,
      extra: {},
   };
   if (testCreature.bred) result.extra.IB = testCreature.IB * 100;

   if (exception) {
      result.exception = exception;
      result.dbg = dbg;
   }
   else if (dbg['failReason']) {
      result.failReason = dbg.failReason;
   }
   else {
      result.pass = IsPass(testData['results'], testCreature.stats);
      result.duration = t2 - t1;
   }

   return result;
}

/**
 *
 * @param {*} testData
 * @param {number} duration Total test duration, in milliseconds
 * @returns {{duration?:number,runs?:number,error?:string}}
 */
export function PerformPerfTest(testData, duration = 5000) {
   let runs = 0;
   let t1, t2;
   const cutoffTime = Date.now() + duration;

   try {
      t1 = performance.now();

      do {
         const testCreature = new VueCreature();

         // Set the properties to prepare for extraction
         testCreature.wild = (testData.mode === 'Wild');
         testCreature.tamed = (testData.mode === 'Tamed');
         testCreature.bred = (testData.mode === 'Bred');
         testCreature.IB = testData.imprint / 100;
         testCreature.values = testData.values.map(Ark.ConvertValue);
         testCreature.serverName = testData.serverName;
         testCreature.level = testData.level;
         testCreature.species = testData.species;

         const extractObject = new Extractor(testCreature);

         extractObject.extract();
         runs += 1;
      }
      while (Date.now() < cutoffTime);

      t2 = performance.now();

      duration = (t2 - t1) / runs;
   }
   catch (_) {
      return { error: '-' };
   }

   return { duration, runs };
}

/**
 * Recursive comparison, allowing for minor float variances.
 * @param {any} result The test result
 * @param {any} expected The expected result
 */
function IsPass(result, expected) {
   if (isNumber(result))
      return isNumber(expected) && Utils.CompareFloat(result, expected);

   if (isString(result))
      return isString(expected) && expected === result;

   if (isFunction(result))
      return false;

   if (isArray(result) && isArray(expected) && result.length !== expected.length)
      return false;

   if (isObject(result) || isArray(result)) {
      for (const key in result) {
         if (key.startsWith('_')) continue;
         if (!IsPass(result[key], expected[key])) return false;
      }
   }

   return true;
}
