declare module 'interval-arithmetic-eval' {
   export = IntervalArithmeticEvalConst;
}

declare const IntervalArithmeticEvalConst: IntervalArithmeticEvalStatic;

declare interface IntervalArithmeticEvalStatic {
   (equ: string): CompiledEquation;
}

declare class CompiledEquation {
   eval(variables: { [name: string]: number | Interval }): Interval;
}
