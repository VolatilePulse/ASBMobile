import { inputValueToInterval } from '@/ark';
import { Stat } from '@/ark/types';
import { NUM_STATS, PRE_IB } from '@/consts';
import { Server } from '@/data/firestore/objects';
import { CreatureDataSource, ServerId } from '@/data/firestore/types';
import { CompareFloat, Range } from '@/utils';
import { isArray, isFunction, isNumber, isObject, isString } from 'util';
import { Extractor, ExtractorInput, ExtractorOutput, TEProps } from './ark/extractor';


export interface CreatureTestData {
   species: string;
   speciesBP?: string;
   currentServer: ServerId;
   isWild?: boolean;
   isTamed?: boolean;
   isBred?: boolean;
   imprintingBonus: number;
   inputSource: CreatureDataSource;
   level: number;
   values: { [stat_index: number]: number };
}

export type TestCriteria = HasAnOptionTestCriteria | HasOptionTestCriteria | HasOptionCountTestCriteria;

export interface HasAnOptionTestCriteria {
   test: 'has_an_option';
}

export interface HasOptionTestCriteria {
   test: 'has_option';
   levelsWild: number[];
   levelsDom: number[];
}

export interface HasOptionCountTestCriteria {
   test: 'has_option_count';
   count: number;
}

export interface TestDefinition {
   description: string;
   creature: CreatureTestData;
   criteria: TestCriteria[];
}


/** Flexible object to hold test results */
export interface TestResult {
   result: 'error' | 'pass' | 'fail' | 'partial';
   output?: ExtractorOutput;
   dbg?: any;
   exception?: any;
   duration?: number;
   runs?: number;
   criteriaResults?: boolean[];
}

/**
 * Perform a single test, timing it and checking the results if applicable.
 * Fields set in the output vary based on the result.
 * @example PerformTest(test_data, server, performance.now.bind(performance));
 */
export function PerformTest(testData: TestDefinition, server: Server, timingFn?: () => number): TestResult {
   if (!server) return { result: 'error', exception: 'Server definition is required' };
   if (!testData.creature) return { result: 'error', exception: 'Creature definition is required' };
   if (!testData.creature.inputSource) return { result: 'error', exception: 'Creature input source is required' };

   // Set the properties to prepare for extraction
   const inputs: ExtractorInput = {
      wild: testData.creature.isWild,
      tamed: testData.creature.isTamed,
      bred: testData.creature.isBred,
      IB: inputValueToInterval(testData.creature.imprintingBonus, PRE_IB, testData.creature.inputSource),
      level: testData.creature.level,
      values: Range(NUM_STATS).map(i => inputValueToInterval(testData.creature.values[i], i, testData.creature.inputSource)),
      server: server,
      species: testData.creature.species,
   };

   const extractObject = new Extractor(inputs);

   const dbg: any = {
      totalIterations: 0,
      numberRemoved: 0,
   };

   let t1: number, t2: number;
   let exception: Error;
   let output: { stats: Stat[][], options: Stat[][], TEs: Map<Stat, TEProps>, IB: Interval };

   try {
      if (timingFn) t1 = timingFn();
      output = extractObject.extract(dbg);
      if (timingFn) t2 = timingFn();
   }
   catch (ex) {
      exception = ex;
   }

   if (output && output.IB) dbg.IB = output.IB;

   const result: TestResult = {
      result: 'fail',
      output: output,
      dbg: dbg,
   };

   if (exception) {
      result.result = 'error';
      result.exception = exception;
   }
   else {
      result.duration = t2 - t1;
      evaluateCriteria(testData, result);
   }

   return result;
}

/**
 * Run a test in performance mode, repeating it until `duration` is up and reporting on the average run time.
 */
export function PerformPerfTest(testData: TestDefinition, server: Server, timingFn: () => number, duration = 5000, generateProfiler = false): TestResult {
   let runs = 0;
   let t1, t2;
   const cutoffTime = Date.now() + duration;

   if (!server) return { result: 'error', exception: 'Unable to locate server' };


   try {
      if (generateProfiler && window.console && window.console.profile) {
         console.profile(testData.description);
      }

      t1 = timingFn();

      do {
         // Set the properties to prepare for extraction
         const inputs: ExtractorInput = {
            wild: testData.creature.isWild,
            tamed: testData.creature.isTamed,
            bred: testData.creature.isBred,
            IB: inputValueToInterval(testData.creature.imprintingBonus, PRE_IB, testData.creature.inputSource),
            level: testData.creature.level,
            values: Range(NUM_STATS).map(i => inputValueToInterval(testData.creature.values[i], i, testData.creature.inputSource)),
            server: server,
            species: testData.creature.species,
         };

         const extractObject = new Extractor(inputs);
         extractObject.extract();
         runs += 1;
      }
      while (Date.now() < cutoffTime);

      t2 = timingFn();
      if (generateProfiler && window.console && window.console.profile)
         console.profileEnd();

      duration = (t2 - t1) / runs;
   }
   catch (_) {
      return { result: 'error', exception: '-' };
   }

   return { result: 'pass', duration, runs };
}

/**
 * Recursive comparison, allowing for minor float variances.
 * TODO: Remove me?
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


function evaluateCriteria(test: TestDefinition, result: TestResult) {
   result.criteriaResults = test.criteria.map(criteria => {
      const evaluator = criteriaEvaluators[criteria.test];
      if (!evaluator) throw new Error(`Unexpected criteria '${criteria.test}'`);
      return evaluator(result.output, criteria);
   });
   const passes = result.criteriaResults.reduce((agg, pass) => pass ? agg + 1 : agg, 0);
   const total = test.criteria.length;
   if (total === 0) result.result = 'partial';
   else if (passes === 0) result.result = 'fail';
   else if (passes < total) result.result = 'partial';
   else result.result = 'pass';
}


type CriteriaEvaluator = (output: ExtractorOutput, criteria: TestCriteria) => boolean;

// A map of functions that check the different pass criteria
const criteriaEvaluators: { [name: string]: CriteriaEvaluator } = {
   has_an_option(output: ExtractorOutput, _criteria: TestCriteria) {
      return output.options && output.options.length > 0;
   },
   has_option_count(output: ExtractorOutput, criteria: TestCriteria) {
      const count = (criteria as HasOptionCountTestCriteria).count;
      return output.options && output.options.length >= count;
   },
   has_option(output: ExtractorOutput, criteria: TestCriteria) {
      const { levelsDom, levelsWild } = criteria as HasOptionTestCriteria;
      return output.options.some(option => option.every((stat, i) => levelsWild[i] === stat.Lw && levelsDom[i] === stat.Ld));
   }
};
