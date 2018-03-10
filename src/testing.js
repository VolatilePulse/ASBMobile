
import * as Ark from './ark';
import * as Utils from './utils';
import { Extractor } from './ark/extractor';
import { VueCreature } from './ark/creature';
import { isNumber, isString, isFunction, isObject, isArray } from 'util';


export function PerformTest(data) {
   let testCreature = new VueCreature();

   // Set the properties to prepare for extraction
   testCreature.wild = (data.mode == "Wild");
   testCreature.tamed = (data.mode == "Tamed");
   testCreature.bred = (data.mode == "Bred");
   testCreature.IB = data.imprint / 100;
   testCreature.exactly = !!data.exactly;
   testCreature.values = data.values.map(Ark.ConvertValue);
   testCreature.serverName = data.serverName;
   testCreature.level = data.level;
   testCreature.species = data.species;

   let extractObject = new Extractor(testCreature);

   let dbg = {};

   let t1 = performance.now();
   extractObject.extract(dbg);
   let t2 = performance.now();

   let pass = IsPass(data['results'], testCreature.stats);

   console.log("\n" + (pass ? "PASS: " : "FAIL: ") + data['tag']);
   console.log(Utils.FormatNumber(t2 - t1, 2) + "ms");
   if (dbg.failReason) console.log("Fail reason: " + dbg.failReason);
   if (!pass) {
      if (dbg.preFilterStats) {
         console.log("\nPre-filter stats:");
         console.log(Ark.FormatAllOptions(dbg.preFilterStats));
         delete dbg.preFilterStats;
      }
      // To copy the results into test_data Results
      // console.log(JSON.stringify(testCreature.stats));
      console.log("\nExpected:");
      console.log(Ark.FormatAllOptions(data['results']));
      console.log("\nResults:");
      console.log(Ark.FormatAllOptions(testCreature.stats));
      console.log("\DBG:");
      console.log(JSON.stringify(dbg, null, 2));
   }

   return { pass: pass, duration: (t2 - t1), results: testCreature.stats };
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
