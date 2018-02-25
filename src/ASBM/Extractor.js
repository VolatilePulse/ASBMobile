/**
 * @fileOverview Contains the ASBM.Extraction Object
 */

"use strict";

var ASBM = ASBM || {};

ASBM.Extraction = class {
   constructor(multipliers, values, level, isWild = true, isTamed = false, isBred = false, imprintBonus = 0, exactly = false) {
      this.m = multipliers;
      this.values = values;
      this.level = level;
      this.wild = isWild;
      this.tamed = isTamed;
      this.bred = isBred;
      this.imprintingBonus = imprintBonus;
      this.exactly = exactly;
      
      this.TE = 0;
      this.IB = 0;
      
      this.results = [[],[],[],[],[],[],[],[]];

      // determines how many levels are missing to equal creature level
      this.wildFreeMax = 0;
      this.domFreeMin = 0;
      this.domFreeMax = 0; // unassigned levels
      this.levelBeforeDom = 0;
      
      // Change variables based on wild, tamed, bred
      if (this.wild) {
            this.TE = 0;
            this.imprintingBonus = 0;
            this.IB = 0;
      }
      
      else if(this.tamed) {
            this.imprintingBonus = 0;
            this.IB = 0;
      }
      
      else
      this.TE = 1;
   }
   
   // FIXME: Creatures that don't use Oxygen aren't extracted properly
   extractLevels() {
      // If tame isn't bred (ignore wild level steps) and setting is enabled, consider wild steps (as set in settings)
      // TODO: Add consider wild levels
      // considerWildLevelSteps = considerWildLevelSteps && !bred;
      
      var tempStat = new ASBM.Stat();
      var torporStat = new ASBM.Stat();
      
      // Calculate the torpor stat since it doesn't accept dom levels
      torporStat.calculateWildLevel(this.m[TORPOR], this.values[TORPOR], (!this.wild), this.TE, this.imprintingBonus);
      this.results[TORPOR].push(torporStat);
      
      // Calculate the max number of levels based on level and torpor
      this.wildFreeMax = this.levelBeforeDom = torporStat.Lw;
      this.domFreeMax = Math.max(0, this.level - this.wildFreeMax - 1);
      
      // If it's bred, we need to do some magic with the IB
      if (this.bred) {
         if (this.exactly)
            this.IB = this.imprintingBonus;

         else {
            // One of the most precise ways to get the exact torpor
            this.IB = torporStat.calculateIB(this.m[TORPOR], this.values[TORPOR]);
            // IB *must* be lower than this
            var maxIB = Math.min(torporStat.calculateIB(this.m[7], this.values[7] + (0.5 / Math.pow(10, Utils.Precision(TORPOR)))), this.imprintingBonus + (5 /10E3));
            // IB can be equal or greater than this
            var minIB = Math.max(torporStat.calculateIB(this.m[7], this.values[7] - (0.5 / Math.pow(10, Utils.Precision(TORPOR)))), this.imprintingBonus - (5 / 10E3));
            
            // Check the food stat for the IB as well (Only works if food is unleveled)
            var tempHealthStat = new ASBM.Stat();
            tempHealthStat.calculateWildLevel(this.m[FOOD], this.values[FOOD], !this.wild, this.TE, this.imprintingBonus);
            var imprintingBonusFromFood = tempHealthStat.calculateIB(this.m[FOOD], this.values[FOOD]);
            
            // Check to see if the new IB still allows torpor to extract correctly
            if (this.values[TORPOR] == Utils.RoundTo(tempStat.calculateValue(this.m[TORPOR], !this.wild, this.TE, imprintingBonusFromFood), Utils.Precision(TORPOR)))
               this.IB = imprintingBonusFromFood;
            
            // If IB > 99.9% it is likely 100% or a whole number higher than 100%
            if (this.IB > 0.999)
               this.IB = Utils.RoundTo(this.IB, 2);
            
            // IB can't be lower than 0
            if (this.IB < 0)
               this.IB = 0;
         }
      }
      
      // Loop all stats except for torpor
      for (var i = 0; i < 7; i ++) {
         tempStat = new ASBM.Stat;

         // IF a stat isn't used, we need to set the Value to it's Base so it can still calculate
         if (this.m[i].notUsed) {
            this.values[i] = Utils.RoundTo(tempStat.calculateValue(this.m[i], !this.wild, this.TE, this.IB), Ark.Precision(i));
         }
         
         // If the stat can't be calculated, set it to 0, 0 so it has atleast 1 result
         if (this.m[i].B <= 0)
            this.results[i].push(new ASBM.Stat);
         
         // Since wilds don't level torpor, it makes it easy to calculate
         else if (this.wild) {
            tempStat.calculateWildLevel(this.m[i], this.values[i]);
            // Make sure it is valid
            if (this.values[i] == Utils.RoundTo(tempStat.calculateValue(this.m[i]), Ark.Precision(i)))
               this.results[i].push(new ASBM.Stat(tempStat));
         }
         
         // Otherwise, we need to do some extra work
         else {
            // Calculate the highest Lw could be
            var maxLw = tempStat.calculateWildLevel(this.m[i], this.values[i], !this.wild, 0, this.IB);
            
            if (maxLw > this.levelBeforeDom || (maxLw == 0 && this.m[i].Iw == 0))
               maxLw = this.levelBeforeDom;
            
            // Reset Lw to find max possible Ld
            tempStat.Lw = 0;
            
            // Calculate the highest Ld could be
            var maxLd = tempStat.calculateDomLevel(this.m[i], this.values[i], !this.wild, 0, this.IB);
            
            // Adjust Ld to max/min
            if (maxLd > this.domFreeMax)
               maxLd = this.domFreeMax;
            
            // Loop all possible Lws
            for (tempStat.Lw = 0; tempStat.Lw <= maxLw; tempStat.Lw ++) {
               // We don't need to calculate TE to extract the levels
               if (this.bred || this.m[i].Tm == 0) {
                  if (tempStat.calculateDomLevel(this.m[i], this.values[i], !this.wild, this.TE, this.IB) > maxLd)
                     continue;
                  
                  if (Utils.RoundTo(this.values[i], Ark.Precision(i)) == Utils.RoundTo(tempStat.calculateValue(this.m[i], !this.wild, this.TE, this.IB), Ark.Precision(i)))
                     this.results[i].push(new ASBM.Stat(tempStat));
                  
                  // If it doesn't calculate properly, it may have used a different IB
                  else if (this.bred) {
                     if (Utils.RoundTo(tempStat.calculateIB(this.m[i], this.values[i]), 2) == this.imprintingBonus) {
                        var maxTempIB = tempStat.calculateIB(this.m[i], this.values[i] + (0.5 / Math.pow(10, Ark.Precision(i))));
                        var minTempIB = tempStat.calculateIB(this.m[i], this.values[i] - (0.5 / Math.pow(10, Ark.Precision(i))));
                        
                        if (maxTempIB < maxIB && maxTempIB >= minIB) {
                           this.IB = maxIB = maxTempIB;
                           this.results[i].push(new ASBM.Stat(tempStat));
                        }
                        else if (minIB < minTempIB && minTempIB < maxIB) {
                           this.IB = minIB = minTempIB;
                           this.results[i].push(new ASBM.Stat(tempStat));
                        }
                     }
                  }
               }
               
               // If this stat has a Tm and is tamed, we need to manually loop through the Ld
               else {
                  for (tempStat.Ld = 0; tempStat.Ld <= maxLd; tempStat.Ld ++) {

                     // Attempts to calculate the TE
                     var tamingEffectiveness = tempStat.calculateTE(this.m[i], this.values[i]);
                     if (tamingEffectiveness >= 0 && tamingEffectiveness <= 1) {
                        
                        // If the TE allows the stat to calculate properly, add it as a possible result
                        if (Utils.RoundTo(this.values[i], Ark.Precision(i)) == Utils.RoundTo(tempStat.calculateValue(this.m[i], !this.wild, tamingEffectiveness, this.IB), Ark.Precision(i))) {
                           // Create a new ASBM.Stat to hold all of the information
                           var TEStat = new ASBM.Stat(tempStat);
                           TEStat.wildLevel = Utils.RoundTo(this.levelBeforeDom / (1 + 0.5 * tamingEffectiveness), 0);
                           TEStat.TE = tamingEffectiveness;
                           this.results[i].push(TEStat);
                        }
                     }
                     
                     // The TE would only get smaller so break the loop
                     else if (tamingEffectiveness <= 0)
                        break;
                  }
               }
            }
         }
      }
      this.filterResults();
   }

   filterResults() {
      do {
         var removed = false;
         for (var i = 0; i < 7; i ++) {
            // One stat possibility is good
            if (!this.results[i].checked && this.results[i].length == 1) {
               this.wildFreeMax -= this.results[i][0].Lw;
               this.domFreeMin -= this.results[i][0].Ld;
               this.domFreeMax -= this.results[i][0].Ld;
               this.results[i].checked = true;
               removed = true;
            }
            else if (this.results[i].length > 1) {
               for (var j = 0; j < this.results[i].length; j ++) {
                  // Simple stat removal followed by a recursive stat removal
                  if (this.results[i][j].Lw > this.wildFreeMax || this.results[i][j].Ld > this.domFreeMax || !this.matchingStatLevels(i, this.results[i][j])) {
                     this.results[i].splice(j, 1);
                     j --;
                     removed = true;
                  }
               }
            }
         }
      } while (removed);
   }
   
   // Recursively remove values that don't have a matching set in the remaining stats
   matchingStatLevels(index, stat) {
      var self = this;
      var indices = [index];
      var runningWildLevel = stat.Lw;
      var runningDomLevel = stat.Ld;
      function _matchingStatLevels(indices) {
         for (var i = 0; i < 7; i ++) {
            if (!indices.includes(i) && self.results[i].checked)
               indices.push(i);
            // This only has one stat in it and is deemed good, or we are already using this index
            if (indices.includes(i))
               continue;

            // This stat hasn't been checked yet
            for (var j = 0; j < self.results[i].length; j ++) {
               runningWildLevel += self.results[i][j].Lw;
               runningDomLevel += self.results[i][j].Ld;
               indices.push(i);

               // Revert the changes we made
               // TODO: Add Checking for same TE
               if (!(_matchingStatLevels(indices))) {
                  runningWildLevel -= self.results[i][j].Lw;
                  runningDomLevel -= self.results[i][j].Ld;
                  indices.pop();
               }
            }
         }

         // We have looped all of the stats and there is a combination of other stats
         if ((runningWildLevel == self.wildFreeMax) && (runningDomLevel == self.domFreeMax) && indices.length == 7)
            return true;

         return false;
      }
      return _matchingStatLevels(indices);
   }
}
