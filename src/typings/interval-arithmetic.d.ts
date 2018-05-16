declare module 'interval-arithmetic' {
   export = IntervalArithmeticConst;
}

declare const IntervalArithmeticConst: IntervalArithmeticStatic;

declare interface IntervalArithmeticStatic {
   round: {
      enable(): void,
      disable(): void,
   };

   (): Interval;
   (value: number): Interval;
   (lo: number, hi: number): Interval;

   isEmpty(range: Interval): boolean;
   isWhole(range: Interval): boolean;
   isInterval(range: Interval): boolean;
   isSingleton(range: Interval): boolean;
   hasValue(range: Interval, value: number): boolean;
   hasInterval(a: Interval, b: Interval): boolean;
   intervalsOverlap(a: Interval, b: Interval): boolean;

   intersection(a: Interval, b: Interval): Interval;
   mul(a: Interval, b: Interval): Interval;
   div(a: Interval, b: Interval): Interval;
   add(a: Interval, b: Interval): Interval;
   sub(a: Interval, b: Interval): Interval;

   equal(a: Interval, b: Interval): boolean;
   gt(a: Interval, b: Interval): boolean;
   geq(a: Interval, b: Interval): boolean;
   lt(a: Interval, b: Interval): boolean;
   leq(a: Interval, b: Interval): boolean;
   notEqual(a: Interval, b: Interval): boolean;

   ONE: Interval;
   ZERO: Interval;
   WHOLE: Interval;
   EMPTY: Interval;
}

declare class Interval {
   readonly lo: number;
   readonly hi: number;

   bounded(range: Interval): Interval;
   bounded(lo: number, hi: number): Interval;
   boundedSingleton(value: number): Interval;

   open(lo: number, hi: number): Interval;
   halfOpenRight(lo: number, hi: number): Interval;
   halfOpenLeft(lo: number, hi: number): Interval;
}
