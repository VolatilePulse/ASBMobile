"use strict";

var Ark = {
   /**
    * @description Returns the precision to match the displayed in game values.
    * @param {number} index Number corresponding with the index of a stat
    * @returns {number} The number of decimal places the stat must meet
    * @name Precision
    * @see RoundTo
    */
   Precision(index) {
      if (index == TORPOR || index == SPEED)
         return 3;
      return 1;
   }
}