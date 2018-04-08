declare module 'interval-arithmetic' {
   export = IntervalArithmeticConst;
}

declare const IntervalArithmeticConst: IntervalArithmeticStatic;

declare interface IntervalArithmeticStatic {
   (): Interval;
   (lo: number, hi: number): Interval;

   isEmpty(range: Interval): boolean;
   isWhole(range: Interval): boolean;
   hasValue(range: Interval, value: number): boolean;
   hasInterval(a: Interval, b: Interval): boolean;

   intersection(a: Interval, b: Interval): Interval;

   round: {
      enable(): void,
      disable(): void,
   }
}

declare class Interval {
   lo: number;
   hi: number;

   open(lo: number, hi: number): Interval;
   halfOpenRight(lo: number, hi: number): Interval;
   halfOpenLeft(lo: number, hi: number): Interval;
}
