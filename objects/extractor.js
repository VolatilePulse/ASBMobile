class extraction {
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
      // Hold the exact imprinting bonus
      this.IB = 0;
      
      this.results = [8];
      // stores the possible results of all stats as array (wildlevel, domlevel, tamingEff)
      for (var i = 0; i < 8; i ++)
         this.results[i] = new Array();
      // holds the selection of multiple stat level options (multiple TE's or magical numbers)
      this.chosenResults = [8];
      // If there is only one possible result, should be true.
      this.fixedResults = [8];
         
      this.lowerBoundWilds = [8];
      this.lowerBoundDoms = [8];
      this.upperBoundDoms = [8];
      // Verifies that all results are valid
      this.validResults = false;
      // determines how many levels are missing to equal creature level
      this.wildFreeMax = 0, this.domFreeMin = 0, this.domFreeMax = 0; // unassigned levels

      this.lastTEUnique = false;
      
      // imprint value hasn't changed yet (false)
      this.imprintingChanged = false;
      
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
      
      this.levelBeforeDom = 0;
   }
   
   roundTo(num, n = 0) {
      var number = num * Math.pow(10, n);
      number = Math.round(number);
      return number / Math.pow(10, n);
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
               if (!(_matchingStatLevels(indices))){
                  runningWildLevel -= self.results[i][j].Lw;
                  runningDomLevel -= self.results[i][j].Ld;
                  indices.pop();
                  continue;
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
   
   extractLevels() {
      // If tame isn't bred (ignore wild level steps) and setting is enabled, consider wild steps (as set in settings)
      // TODO: Add consider wild levels
      // considerWildLevelSteps = considerWildLevelSteps && !bred;
      
      var tempStat = new stat();
      var torporStat = new stat();
      
      // Calculate the torpor stat since it doesn't accept dom levels
      torporStat.calculateWildLevel(this.m[7], this.values[7], (!this.wild), this.TE, this.imprintingBonus);
      this.results[7].push(torporStat);
      
      // Calculate the max number of levels based on level and torpor
      this.wildFreeMax = this.levelBeforeDom = torporStat.Lw;
      this.domFreeMax = Math.max(0, this.level - this.wildFreeMax - 1);
      
      // If it's bred, we need to do some magic with the IB
      if (this.bred) {
         if (this.exactly)
            this.IB = this.imprintingBonus;

         else {
            // One of the most precise ways to get the exact torpor
            this.IB = torporStat.calculateIB(this.m[7], this.values[7]);
            // IB *must* be lower than this
            var maxIB = Math.min(torporStat.calculateIB(this.m[7], this.values[7] + (5 / Math.pow(10, this.m[7].precision + 1))),
                                 this.imprintingBonus + (5 / Math.pow(10, 3)));
            // IB can be equal or greater than this
            var minIB = Math.max(torporStat.calculateIB(this.m[7], this.values[7] - (5 / Math.pow(10, this.m[7].precision + 1))),
                                 this.imprintingBonus - (5 / Math.pow(10, 3)));
            
            // Check the food stat for the IB as well (Only works if food is unleveled)
            var tempHealthStat = new stat();
            tempHealthStat.calculateWildLevel(this.m[3], this.values[3], !this.wild, this.TE, this.imprintingBonus);
            var imprintingBonusFromFood = tempHealthStat.calculateIB(this.m[3], this.values[3]);
            
            // Check to see if the new IB still allows torpor to extract correctly
            if (this.values[7] == this.roundTo(tempStat.calculateValue(this.m[7], !this.wild, this.TE, imprintingBonusFromFood), this.m[7].precision))
               this.IB = imprintingBonusFromFood;
            
            // If IB > 99.9% it is likely 100% or a whole number higher than 100%
            if (this.IB > 0.999)
               this.IB = this.roundTo(this.IB, 2);
            
            // IB can't be lower than 0
            if (this.IB < 0)
               this.IB = 0;
            
            // Check to see if we changed the IB
            if (Math.abs(this.IB - this.imprintingBonus) > 0)
               this.imprintingChanged = true;
         }
      }
      
      // Loop all stats except for torpor
      for (var i = 0; i < 7; i ++) {
         tempStat = new stat;
         
         // If the stat can't be calculated, set it to 0, 0 so it has atleast 1 result
         if (this.m[i].B <= 0 || !this.m[i].active)
            this.results[i].push(new stat);
         
         // Since wilds don't level torpor, it makes it easy to calculate
         else if (this.wild) {
            tempStat.calculateWildLevel(this.m[i], this.values[i]);
            // Make sure it is valid
            if (this.values[i] == this.roundTo(tempStat.calculateValue(this.m[i]), this.m[i].precision))
               this.results[i].push(new stat(tempStat));
         }
         
         // Otherwise, we need to do some extra work
         else {
            var maxLw = 0;
            var maxLd = 0;
            var tamingEffectiveness = -1;
            
            // Calculate the highest Lw could be
            maxLw = tempStat.calculateWildLevel(this.m[i], this.values[i], !this.wild, 0, this.IB);
            
            if (maxLw > this.levelBeforeDom || (maxLw == 0 && this.m[i].Iw == 0))
               maxLw = this.levelBeforeDom;
            
            // Reset Lw to find max possible Ld
            tempStat.Lw = 0;
            
            // Calculate the highest Ld could be
            maxLd = tempStat.calculateDomLevel(this.m[i], this.values[i], !this.wild, 0, this.IB);
            
            // Adjust Ld to max/min
            if (maxLd > this.domFreeMax)
               maxLd = this.domFreeMax;
            
            if (maxLd < 0)
               maxLd = 0;
            
            // Loop all possible Lws
            for (tempStat.Lw = 0; tempStat.Lw <= maxLw; tempStat.Lw ++) {
               // We don't need to calculate TE to extract the levels
               if (this.bred || this.m[i].Tm == 0) {
                  if (tempStat.calculateDomLevel(this.m[i], this.values[i], !this.wild, this.TE, this.IB) > maxLd)
                     continue;
                  
                  if (this.roundTo(this.values[i], this.m[i].precision) == this.roundTo(tempStat.calculateValue(this.m[i], !this.wild, this.TE, this.IB), this.m[i].precision))
                     this.results[i].push(new stat(tempStat));
                  
                  // If it doesn't calculate properly, it may have used a different IB
                  else if (this.bred) {
                     if (this.roundTo(tempStat.calculateIB(this.m[i], this.values[i]), 2) == this.imprintingBonus) {
                        var maxTempIB = tempStat.calculateIB(this.m[i], this.values[i] + (5 / Math.pow(10, this.m[i].precision + 1)));
                        var minTempIB = tempStat.calculateIB(this.m[i], this.values[i] - (5 / Math.pow(10, this.m[i].precision + 1)));
                        
                        if (maxTempIB < maxIB && maxTempIB >= minIB) {
                           this.IB = maxIB = maxTempIB;
                           this.results[i].push(new stat(tempStat));
                        }
                        else if (minIB < minTempIB && minTempIB < maxIB) {
                           this.IB = minIB = minTempIB;
                           this.results[i].push(new stat(tempStat));
                        }
                     }
                  }
               }
               
               // If this stat has a Tm and is tamed, we need to manually loop through the Ld
               else {
                  for (tempStat.Ld = 0; tempStat.Ld <= maxLd; tempStat.Ld ++) {

                     // Attempts to calculate the TE
                     tamingEffectiveness = tempStat.calculateTE(this.m[i], this.values[i]);
                     if (tamingEffectiveness >= 0 && tamingEffectiveness <= 1) {
                        
                        // If the TE allows the stat to calculate properly, add it as a possible result
                        if (this.roundTo(this.values[i], this.m[i].precision) == this.roundTo(tempStat.calculateValue(this.m[i], !this.wild, tamingEffectiveness, this.IB), this.m[i].precision)) {
                           // Create a new stat to hold all of the information
                           var TEStat = new stat(tempStat);
                           TEStat.wildLevel = Math.round(this.levelBeforeDom / (1 + 0.5 * tamingEffectiveness));
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
/*      for (s = 0; s < 7; s++) {
          if (results[s].Count == 1) {
              // result is uniquely solved
              wildFreeMax -= results[s][0].levelWild;
              domFreeMin -= results[s][0].levelDom;
              domFreeMax -= results[s][0].levelDom;
              upperBoundDoms[s] = results[s][0].levelDom;
          }
          else if (results[s].Count > 1) {
              // get the smallest and larges value
              var minW = results[s][0].levelWild, minD = results[s][0].levelDom, maxD = results[s][0].levelDom;
              for (r = 1; r < results[s].Count; r++) {
                  if (results[i][j].levelWild < minW) {
                     minW = results[i][j].levelWild;
                  }
                  if (results[i][j].levelDom < minD) {
                     minD = results[i][j].levelDom;
                  }
                  if (results[i][j].levelDom > maxD) {
                     maxD = results[i][j].levelDom;
                  }
              }
              // save min/max-possible value
              lowerBoundWilds[s] = minW;
              lowerBoundDoms[s] = minD;
              upperBoundDoms[s] = maxD;
          }
      }
      if (wildFreeMax < lowerBoundWilds.Sum() || domFreeMax < lowerBoundDoms.Sum())
      {
          this.Clear();
          validResults = false;
      }
      return validResults;
   }

   filterResultsByFixed(dontFix = -1) {
      var lowBoundWs = lowerBoundWilds;
      var lowBoundDs = lowerBoundDoms;
      var uppBoundDs = upperBoundDoms;
      var wildMax = wildFreeMax, domMin = domFreeMin, domMax = domFreeMax;

      // set all results to non-valid that are in a fixed stat and not the chosen one
      for (var i = 0; i < 7; i ++) {
         for (var j = 0; j < results[i].length; j ++)
            results[i][j].currentlyNotValid = (fixedResults[i] && dontFix != i && j != chosenResults[i]);
         
         // subtract fixed stat-levels, but not from the current stat
         if (fixedResults[i] && dontFix != i) {
            wildMax -= results[i][chosenResults[i]].levelWild;
            domMin -= results[i][chosenResults[i]].levelDom;
            domMax -= results[i][chosenResults[i]].levelDom;
            lowBoundWs[i] = 0;
            lowBoundDs[i] = 0;
            uppBoundDs[i] = 0;
         }
      }

      // mark all results as invalid that are not possible with the current fixed chosen results
      // loop as many times as necessary to remove results that depends on the invalidation of results in a later stat
      var loopAgain = true;
      var validResultsNr, uniqueR;
      while (loopAgain) {
         loopAgain = false;
         for (var i = 0; i < 7; i ++) {
            validResultsNr = 0;
            uniqueR = -1;
            for (var j = 0; j < results[i].length; j ++) {
               if (!results[i][j].currentlyNotValid) {
                  validResultsNr ++;
               }
            }
            if (validResultsNr > 1) {
               for (var j = 0; j < results[s].length; j ++) {
                  if (!results[i][j].currentlyNotValid && 
                      (results[i][j].levelWild > wildMax - lowBoundWs.Sum() + lowBoundWs[s] ||
                       results[i][j].levelDom > domMax - lowBoundDs.Sum() + lowBoundDs[s] ||
                       results[i][j].levelDom < domMin - uppBoundDs.Sum() + uppBoundDs[s])) {
                     results[i][j].currentlyNotValid = true;
                     validResultsNr--;
                     // if result gets unique due to this, check if remaining result doesn't violate for max level
                     if (validResultsNr == 1) {
                        // find unique valid result
                        for (var k = 0; k < results[i].length; k ++)
                           if (!results[i][k].currentlyNotValid) {
                              uniqueR = k;
                              break;
                           }
                        
                        loopAgain = true;
                        wildMax -= results[s][uniqueR].levelWild;
                        domMin -= results[s][uniqueR].levelDom;
                        domMax -= results[s][uniqueR].levelDom;
                        lowBoundWs[i] = 0;
                        lowBoundDs[i] = 0;
                        uppBoundDs[i] = 0;
                        if (wildMax < 0 || domMax < 0)
                           return i;
                        break;
                     }
                  }
               }
            }
         }
      }
      return -1; // -1 is good for this function. A value >=0 means the stat with that index is faulty
   }
   
   /// <summary>
   /// removes all results that violate the stat-level-bounds
   /// </summary>
   /// <returns>-1 on success, else index of stat with error</returns>
   removeOutOfBoundsResults()
   {
      // remove all results that violate restrictions
      // loop as many times as necessary to remove results that depends on the removal of results in a later stat
      var loopAgain = true;
      while (loopAgain) {
         loopAgain = false;
         for (s = 0; s < 7; s++) {
            for (r = 0; r < results[s].Count; r++) {
               if (results[s].Count > 1 && 
                   (results[i][j].levelWild > wildFreeMax - lowerBoundWilds.Sum() + lowerBoundWilds[s] || 
                    results[i][j].levelDom > domFreeMax - lowerBoundDoms.Sum() + lowerBoundDoms[s] ||
                    results[i][j].levelDom < domFreeMin - upperBoundDoms.Sum() + upperBoundDoms[s])) {
                  results[s].RemoveAt(r--);
                  // if result gets unique due to this, check if remaining result doesn't violate for max level
                  if (results[s].Count == 1) {
                     loopAgain = true;
                     wildFreeMax -= results[s][0].levelWild;
                     domFreeMin -= results[s][0].levelDom;
                     domFreeMax -= results[s][0].levelDom;
                     lowerBoundWilds[s] = 0;
                     lowerBoundDoms[s] = 0;
                     upperBoundDoms[s] = 0;
                     if (wildFreeMax < 0 || domFreeMax < 0) {
                        results[s].Clear();
                        validResults = false;
                        return s; // this stat has an issue (no valid results)
                     }
                  }
               }
            }
         }
      }
      // if more than one parameter is affected by tamingEffectiveness filter all numbers that occure only in one
      // if creature is bred, all TE is 1 anyway, no need to filter then
      if (!bred && statsWithEff.Count > 1) {
         for (es = 0; es < statsWithEff.Count; es++) {
            for (et = es + 1; et < statsWithEff.Count; et++) {
               var equalEffs1 = [];
               var equalEffs2 = [];
               for (ere = 0; ere < results[statsWithEff[es]].Count; ere++) {
                  for (erf = 0; erf < results[statsWithEff[et]].Count; erf++) {
                     // effectiveness-calculation can be a bit off due to rounding-ingame, use the TE-ranges
                     if (results[statsWithEff[es]][ere].TEMin <= results[statsWithEff[et]][erf].TEMax &&
                         results[statsWithEff[es]][ere].TEMax >= results[statsWithEff[et]][erf].TEMin) {
                        // if entry is not yet in whitelist, add it
                        if (equalEffs1.IndexOf(ere) == -1) {
                           equalEffs1.push(ere);
                        }
                        if (equalEffs2.IndexOf(erf) == -1) {
                           equalEffs2.push(erf);
                        }
                     }
                  }
               }
               // copy all results that have an effectiveness that occurs more than once and replace the others
               var validResults1 = [];
               for (ev = 0; ev < equalEffs1.Count; ev++) {
                  validResults1.push(results[statsWithEff[es]][equalEffs1[ev]]);
               }
               // replace long list with (hopefully) shorter list with valid entries
               results[statsWithEff[es]] = validResults1;
               var validResults2 = [];
               for (ev = 0; ev < equalEffs2.Count; ev++) {
                  validResults2.Add(results[statsWithEff[et]][equalEffs2[ev]]);
               }
               results[statsWithEff[et]] = validResults2;
            }
            // only one stat left, not enough to compare it
            if (es >= statsWithEff.Count - 2) {
               break;
            }
         }
      }
      return -1;
   }

   // Makes sure every stat has at least 1 possibility
   EveryStatHasAtLeastOneResult() {
      var it;
      for (it in results) {
         if (results[it].length < 1) {
            return false;
         }
      }
      return true;
   } */
}