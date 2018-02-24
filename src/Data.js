/**
 * @fileOverview Controls the data flow for the app
 */

"use strict";

var Data = {

    /**
     * @description Creates an ASBM ready object using a JSON String
     * @param {JSON String} text 
     * @namespace Data
     */
    LoadValues(text) {
        app.speciesDB = JSON.parse(text);
        for(var i in app.speciesDB.species) {
            var temp = document.createElement("option");
            temp.text = app.speciesDB.species[i].name;
            document.getElementById("inputSpecies").add(temp);
            app.myMultipliers[app.speciesDB.species[i].name] = new ASBM.StatMultipliers(app.speciesDB.species[i].statsRaw, app.speciesDB.species[i].TBHM, app.speciesDB.species[i].doesNotUseOxygen, app.speciesDB.species[i].NoImprintingForSpeed);
        }
        app.officialServerSettings = new ASBM.Server(app.speciesDB.statMultipliers, null, false, app.speciesDB.imprintingMultiplier);
        app.officialSPSettings = new ASBM.Server(app.speciesDB.statMultipliersSP, app.officialServerSettings, true, app.speciesDB.imprintingMultiplier);
    }
}