import { Stat, TestData } from '@/ark/types';
import { Server } from '@/data/firestore/objects';
// import { getServerById } from '@/servers';
import { CompareFloat } from '@/utils';
import { isArray, isFunction, isNumber, isObject, isString } from 'util';
import { TEProps } from './ark/extractor';


/** Flexible object to hold test results */
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

/**
 * Perform a single test, timing it and checking the results if applicable.
 * Fields set in the output vary based on the result.
 * @example PerformTest(test_data, performance.now.bind(performance));
 */
// @ts-ignore
export function PerformTest(testData: TestData, timingFn?: () => number, overrideServer?: Server): TestResult {
   throw new Error('TRANSITION');
   // const server = overrideServer || getServerById(testData.serverId);
   // if (!server) return { pass: false, exception: 'Unable to locate server' };

   // // Set the properties to prepare for extraction
   // const source = testData.source || 'ui';
   // const inputs: ExtractorInput = {
   //    wild: (testData.mode === 'Wild'),
   //    tamed: (testData.mode === 'Tamed'),
   //    bred: (testData.mode === 'Bred'),
   //    IB: Ark.ConvertValue(testData.imprint, PRE_IB, source),
   //    level: testData.level,
   //    values: testData.values.map((v, i) => Ark.ConvertValue(v, i, source)),
   //    server: server,
   //    species: testData.species,
   // };

   // const extractObject = new Extractor(inputs);

   // const dbg: any = {
   //    totalIterations: 0,
   //    numberRemoved: 0,
   // };

   // let t1: number, t2: number;
   // let exception: Error;
   // let output: { stats: Stat[][], options: Stat[][], TEs: Map<Stat, TEProps>, IB: Interval };

   // try {
   //    if (timingFn) t1 = timingFn();
   //    output = extractObject.extract(dbg);
   //    if (timingFn) t2 = timingFn();
   // }
   // catch (ex) {
   //    exception = ex;
   // }

   // if (output && output.IB) dbg.IB = output.IB;

   // const result: TestResult = {
   //    pass: false,
   //    stats: output ? output.stats : undefined,
   //    options: output ? output.options : undefined,
   //    mapTE: output ? output.TEs : undefined,
   //    dbg: dbg,
   //    extra: {},
   // };

   // if (exception) {
   //    result.exception = exception;
   //    result.dbg = dbg;
   // }
   // else if (dbg['failReason']) {
   //    result.failReason = dbg.failReason;
   // }
   // else {
   //    result.pass = IsPass(testData['results'], output.stats);
   //    result.duration = t2 - t1;
   // }

   // return result;
}

/**
 * Run a test in performance mode, repeating it until `duration` is up and reporting on the average run time.
 */
// @ts-ignore
export function PerformPerfTest(testData: TestData, timingFn: () => number, duration = 5000, generateProfiler = false, overrideServer?: Server): TestResult {
   throw new Error('TRANSITION');
   // let runs = 0;
   // let t1, t2;
   // const cutoffTime = Date.now() + duration;

   // try {
   //    if (generateProfiler && window.console && window.console.profile)
   //       console.profile(testData.tag);
   //    t1 = timingFn();

   //    const server = overrideServer || getServerById(testData.serverId);
   //    if (!server) return { exception: 'Unable to locate server' };

   //    do {
   //       // Set the properties to prepare for extraction
   //       const source = testData.source || 'ui';
   //       const inputs: ExtractorInput = {
   //          wild: (testData.mode === 'Wild'),
   //          tamed: (testData.mode === 'Tamed'),
   //          bred: (testData.mode === 'Bred'),
   //          IB: Ark.ConvertValue(testData.imprint, PRE_IB, source),
   //          level: testData.level,
   //          values: testData.values.map((v, i) => Ark.ConvertValue(v, i, source)),
   //          server: server,
   //          species: testData.species,
   //       };

   //       const extractObject = new Extractor(inputs);
   //       extractObject.extract();
   //       runs += 1;
   //    }
   //    while (Date.now() < cutoffTime);

   //    t2 = timingFn();
   //    if (generateProfiler && window.console && window.console.profile)
   //       console.profileEnd();

   //    duration = (t2 - t1) / runs;
   // }
   // catch (_) {
   //    return { exception: '-' };
   // }

   // return { duration, runs };
}

/**
 * Recursive comparison, allowing for minor float variances.
 * @param {any} result The test result
 * @param {any} expected The expected result
 */
export function IsPass(result: any, expected: any): boolean {
   if (isNumber(result))
      return isNumber(expected) && CompareFloat(result, expected);

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
