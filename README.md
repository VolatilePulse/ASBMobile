# ASBMobile
https://volatilepulse.github.io/ASBMobile/

### this is very much a work in progress and we ask you to please be patient as we attempt to provide the best experience possible. Unfortunately, we are not accept feature requests at this time. We are also very aware of bugs in the program at the moment. Thank you. :smile:

## TODO
- Add extra test cases
- Server copy constructor
- Add IBM value to server settings 
- Add Server name property for storage
- Write servers to the DB
- Store values.json version number to DB
- Better address unused stats to reduce creating so many stat possibilities
- Create an auto sorting function for results from extractor to move best possible results to the front
- Implement Auto extract on wild tames
- Begin implementing a stat tester
- Decode the Vue elements to better address adding/manipulating elements for styling and navigation for users
- Address TODOs and FIXMEs in code
- Add additional documentation to further aide intellisense and organize code better
- Create Dexie objects for each type of database
- Create array objects to hold servers/libraries
- After implementing, previous used library (based off of server) should load first, set dataLoaded to true, and continue loading other libraries into memory (may further address memory issues if present)
- Future implementations of databases need to be handled through the Data namespace and verify database integrity prior to fetching files and writing over known good data
- Address caching issues
- Further comply with PWA requirements
- UI should optimize for mobile first, using empty screen real estate on PC for fixed navbar/creature details
- Generate a Server Window to pop up when user edits server
- Generate a Settings Window for any additional settings
- Future implementations include Creature values for Xbox/Win10 and Ps4, as well as mods like Classic Flyers (framework is almost in place to support both features)
- Consider Implementation of "Expert" Mode to automatically calculate Server Settings
- Change Extractor tab to Calculator and have a radio button to switch from Extractor/Tester(or edit)/Expert Mode
- Look into libraries to better display library data vs handcrafting a library (may be easier with Vue to sort/filter and display)
- Library must render well on mobile. Side scrolling is not acceptable
- Implement footer to display relevant data to user, I.E. loading values, syncing to cloud, offline mode, etc.
- Add quick access to Server window/Settings