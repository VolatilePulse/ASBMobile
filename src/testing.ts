import { Stat, TestData } from '@/ark/types';
import { Creature } from '@/data/objects';
import { getServerById } from '@/servers';
import { isArray, isFunction, isNumber, isObject, isString } from 'util';
import * as Ark from './ark';
import { Extractor, TEProps } from './ark/extractor';
import * as Utils from './utils';


export interface TestResult {
   pass?: boolean;
   stats?: Stat[][];
   options?: Stat[][];
   mapTE?: Map<Stat, TEProps>;
   dbg?: any;
   extra?: { [key: string]: any };
   exception?: any;
   failReason?: string;
   duration?: number | string;
   runs?: number;
}

export function PerformTest(testData: TestData): TestResult {
   const testCreature = new Creature();

   // Set the properties to prepare for extraction
   testCreature.wild = (testData.mode === 'Wild');
   testCreature.tamed = (testData.mode === 'Tamed');
   testCreature.bred = (testData.mode === 'Bred');
   testCreature.IB = testData.imprint / 100;
   testCreature.values = testData.values.map(Ark.ConvertValue);
   testCreature.serverId = testData.serverId;
   testCreature.level = testData.level;
   testCreature.species = testData.species;

   const server = getServerById(testCreature.serverId);
   if (!server) return { pass: false, exception: 'Unable to locate server' };
   const extractObject = new Extractor(testCreature, server);

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
      mapTE: extractObject['statTEMap'],
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

      const server = getServerById(testData.serverId);
      if (!server) return { exception: 'Unable to locate server' };

      do {
         const testCreature = new Creature();

         // Set the properties to prepare for extraction
         testCreature.wild = (testData.mode === 'Wild');
         testCreature.tamed = (testData.mode === 'Tamed');
         testCreature.bred = (testData.mode === 'Bred');
         testCreature.IB = testData.imprint / 100;
         testCreature.values = testData.values.map(Ark.ConvertValue);
         testCreature.serverId = testData.serverId;
         testCreature.level = testData.level;
         testCreature.species = testData.species;

         const extractObject = new Extractor(testCreature, server);

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
