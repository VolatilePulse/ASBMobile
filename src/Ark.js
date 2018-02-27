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
      // Displays Damage and Speed as 153.5(%)
      if (index == DAMAGE || index == SPEED)
         return 3;
      // Displays TE as 98.34(%)
      if (index == PRE_TE)
         return 4;
      // Displays IB as 38.8810(%)
      if (index == PRE_IB)
         return 6;
      // Displays other stats as 18362.4
      return 1;
   },

   // Returns a value (from ASBM) for comparison or displying in the UI
   DisplayValue(value, index) {
      let returnValue = value;

      if (index == DAMAGE || index == SPEED || index == PRE_TE || index == PRE_IB)
         returnValue *= 100;

      // We want to convert it to Display in ASBM
      returnValue = Utils.RoundTo(returnValue, Ark.Precision(index));
      
      return returnValue;
   },

   // Converts a value (from the UI) to a working value for ASBM
   ConvertValue(value, index) {
      let returnValue = value;

      if (index == DAMAGE || index == SPEED || index == PRE_TE || index == PRE_IB)
         returnValue /= 100;

      // We want to convert it to Use in ASBM
      returnValue = Utils.RoundTo(returnValue, Ark.Precision(index));
      
      return returnValue;
   },

   // Generate a multipliers object for the Extractor
   GetMultipliers(server, creature) {
      // The Server object tells us everything we need to know about the multipliers
      let multipliers = Utils.DeepMerge({}, app.officialServerSettings, server);

      // Single Player multiplies the official/override multipliers
      if (server.singlePlayer)
         for (var stat in app.officialSPSettings)
            for (var multiplier in app.officialSPSettings[stat])
               multipliers[stat][multiplier] = Utils.RoundTo(multipliers[stat][multiplier] * app.officialSPSettings, 3);
      
      multipliers = Utils.DeepMerge({}, multipliers, app.creatures[creature]);
      
      return multipliers;
   }
}