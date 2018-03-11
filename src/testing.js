
import * as Ark from './ark';
import * as Utils from './utils';
import { Extractor } from './ark/extractor';
import { VueCreature } from './ark/creature';
import { isNumber, isString, isFunction, isObject, isArray } from 'util';


export function PerformTest(testData) {
   let testCreature = new VueCreature();

   // Set the properties to prepare for extraction
   testCreature.wild = (testData.mode == "Wild");
   testCreature.tamed = (testData.mode == "Tamed");
   testCreature.bred = (testData.mode == "Bred");
   testCreature.IB = testData.imprint / 100;
   testCreature.exactly = !!testData.exactly;
   testCreature.values = testData.values.map(Ark.ConvertValue);
   testCreature.serverName = testData.serverName;
   testCreature.level = testData.level;
   testCreature.species = testData.species;

   let extractObject = new Extractor(testCreature);

   let dbg = {
      totalRecursion: 0,
      numberRemoved: 0,
   };

   /** @type {number} */
   let t1, t2;
   /** @type {object} */
   let exception;

   try {
      t1 = performance.now();
      extractObject.extract(dbg);
      t2 = performance.now();
   }
   catch (ex) {
      exception = ex;
   }

   let result = {};
   result.pass = false;
   result.stats = testCreature['stats'];
   result.options = extractObject['options'];
   result.dbg = dbg;

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
 * Recursive comparison, allowing for minor float variances.
 * @param {any} result The test result
 * @param {any} expected The expected result
 */
function IsPass(result, expected) {
   if (isNumber(result))
      return isNumber(expected) && Utils.CompareFloat(result, expected);

   if (isString(result))
      return isString(expected) && expected == result;

   if (isFunction(result))
      return false;

   if (isArray(result) && isArray(expected) && result.length != expected.length)
      return false;

   if (isObject(result) || isArray(result)) {
      for (let key in result) {
         if (key.startsWith("_")) continue;
         if (!IsPass(result[key], expected[key])) return false;
      }
   }

   return true;
}
