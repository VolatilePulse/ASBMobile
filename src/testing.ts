import * as Ark from './ark';
import * as Utils from './utils';
import { Extractor, TEProps } from './ark/extractor';
import { VueCreature, Stat } from './ark/creature';
import { isNumber, isString, isFunction, isObject, isArray } from 'util';
import { TestData } from '@/ark/types';


export interface TestResult {
   pass?: boolean;
   stats?: Stat[][];
   options?: Stat[][];
   mapTE?: Array<Map<Stat, TEProps>>;
   dbg?: any;
   extra?: { [key: string]: any };
   exception?: any;
   failReason?: string;
   duration?: number | string;
   runs?: number;
}

export function PerformTest(testData: TestData): TestResult {
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
      totalIterations: 0,
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
      mapTE: extractObject['statTEmaps'],
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
 * Run a test in performance mode, repeating it until `duration` is up and reporting on the average run time.
 */
export function PerformPerfTest(testData: TestData, duration = 5000, generateProfiler = false): TestResult {
   let runs = 0;
   let t1, t2;
   const cutoffTime = Date.now() + duration;

   try {
      if (generateProfiler && window.console && window.console.profile)
         console.profile(testData.tag);
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
      if (generateProfiler && window.console && window.console.profile)
         console.profileEnd();

      duration = (t2 - t1) / runs;
   }
   catch (_) {
      return { exception: '-' };
   }

   return { duration, runs };
}

/**
 * Recursive comparison, allowing for minor float variances.
 * @param {any} result The test result
 * @param {any} expected The expected result
 */
function IsPass(result: any, expected: any): boolean {
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
