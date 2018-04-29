declare module 'interval-arithmetic-eval' {
   export = IntervalArithmeticEvalConst;
}

declare const IntervalArithmeticEvalConst: IntervalArithmeticEvalStatic;

declare type IntervalArithmeticEvalStatic = (equ: string) => CompiledEquation;

declare class CompiledEquation {
   eval(variables: { [name: string]: number | Interval }): Interval;
}
