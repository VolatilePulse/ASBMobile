import IA from 'interval-arithmetic';

/** @fileOverview Number and Interval arithmetic helper functions */


/**
 * Create an interval from a number, accounting for variations beyond the specified number of decimal places.
 * @example intervalFromDecimal(0.1, 1) == Interval().halfOpenRight(0.05, 0.15)
 */
export function intervalFromDecimal(value: number, places: number): Interval {
   const offset = 5 * 10 ** -(places + 1);
   return IA().halfOpenRight(value - offset, value + offset);
}

/** Return the average of an Interval */
export function intervalAverage(range: Interval): number {
   return (range.lo + range.hi) / 2;
}

/*
// Generator that yields the inner int range from the interval
export function* intFromRange(interval: Interval, fn?: (value: number) => number) {
   interval = IA.intersection(IA(0, Infinity), interval);
   const min = fn ? fn(interval.lo) : Math.ceil(interval.lo);
   const max = fn ? fn(interval.hi) : Math.floor(interval.hi);
   for (let i = min; i <= max; i++) yield i;
}
*/
/** Return the integers that are contained within the range, as an array */
export function intFromRange(interval: Interval, fn?: (value: number) => number) {
   const min = fn ? fn(interval.lo) : Math.ceil(interval.lo);
   const max = fn ? fn(interval.hi) : Math.floor(interval.hi);

   const len = Math.max(0, max - min + 1);
   const output = new Array(len);
   for (let i = 0; i < len; i++)
      output[i] = min + i;

   return output;
}

/*
// Generator that yields the inner int range from the interval
export function* intFromRangeReverse(interval: Interval, fn?: (value: number) => number) {
   interval = IA.intersection(IA(0, Infinity), interval);
   const min = fn ? fn(interval.lo) : Math.ceil(interval.lo);
   const max = fn ? fn(interval.hi) : Math.floor(interval.hi);
   for (let i = max; i >= min; i--) yield i;
}
*/
/** Return the integers that are contained within the range, in reverse order, as an array */
export function intFromRangeReverse(interval: Interval, fn?: (value: number) => number) {
   const min = fn ? fn(interval.lo) : Math.ceil(interval.lo);
   const max = fn ? fn(interval.hi) : Math.floor(interval.hi);

   const len = Math.max(0, max - min + 1);
   const output = new Array(len);
   for (let i = 0; i < len; i++)
      output[len - i - 1] = min + i;

   return output;
}
