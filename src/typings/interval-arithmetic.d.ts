declare module 'interval-arithmetic' {
   export = IntervalArithmeticConst;
}

declare const IntervalArithmeticConst: IntervalArithmeticStatic;

declare interface IntervalArithmeticStatic {
   (): Interval;
   (value: number): Interval;
   (lo: number, hi: number): Interval;

   isEmpty(range: Interval): boolean;
   isWhole(range: Interval): boolean;
   hasValue(range: number | Interval, value: number): boolean;
   hasInterval(a: Interval, b: number | Interval): boolean;

   intersection(a: Interval, b: number | Interval): Interval;

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
