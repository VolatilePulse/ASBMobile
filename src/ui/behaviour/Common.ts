import { NUM_STATS, statNames } from '@/consts';
import theStore from '@/ui/store';
import { FormatNumber, Range } from '@/utils';
import { isString } from 'util';
import { Component, Vue } from 'vue-property-decorator';

/** @fileOverview Vue component that all pages inherit from, containing common data and functionality. */


/**
 * Decorator to wrap async functions, catching their exceptions and passing them to `this.globalError`.
 * Note that JSDoc can't handle the example below and there's no workaround.
 * @example
 * @catchAsyncErrors
 * async myMethod() {
 *   // exceptions in here will be caught
 * }
 */
export function catchAsyncErrors(_target: any, _propertyName: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>) {
   const method = descriptor.value;

   // tslint:disable-next-line:only-arrow-functions
   descriptor.value = function () {
      // Call the method
      const results = method.apply(this, arguments);

      // Hook a catch handler in if the return was a Promise
      if (results && Promise.resolve(results) === results) results.catch((ex: any) => {
         // Gather what info we can about where it happened
         let targetName = '<unknown>';
         if (_target && _target.constructor && _target.constructor.name) targetName = _target.constructor.name;
         const prepend = `[async catch from: ${targetName}.${_propertyName}] `;

         // Add it to the error
         if (ex && ex.message)
            ex.message = prepend + ex.message;
         else if (isString(ex))
            ex = prepend + ex;

         // Report it to the global error handler
         (this as any).globalError(ex);
      });

      // Return the original method's result
      return results;
   };
}

@Component
export default class UICommon extends Vue {
   statIndices = Range(NUM_STATS);
   statNames = statNames;

   store = theStore;


   formatFloat(n: number) { return FormatNumber(n, 2); }
   formatRound(n: number) { return FormatNumber(n, 0); }

   range(n: number): number[] {
      return Range(n);
   }

   globalError(ex: any) {
      console.error('Uncaught exception handler:');
      if (!ex) {
         console.error('<undefined exception>');
      }
      else {
         if (ex.stack) console.error(ex.stack);
      }

      if (theStore && theStore.devMode)
         // tslint:disable-next-line:no-debugger
         debugger; // There was an uncaught exception in an async function. Check the console for more information.
      else
         alert('ASBM encountered an unexpected error:\n' + ex);
   }
}
