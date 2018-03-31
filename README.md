# ASBMobile
https://volatilepulse.github.io/ASBMobile/

### This is very much a work in progress and we ask you to please be patient as we attempt to provide the best experience possible. Unfortunately, we are not accept feature requests at this time. We are also very aware of bugs in the program at the moment. Thank you. :smile:

## Development

This project follows gitflow. Development work should be based off the `develop` branch, or in feature branches for large tasks.

For reference: <https://github.com/petervanderdoes/gitflow-avh>

## TODO

### High Priority
- Add server selector
- Add last selected server to library settings
- Write servers to the DB
- Write creatures to the DB

- Implement a real Extractor UI
- Begin implementation of Stat Tester - UI and backing code
- Begin implementation of Expert Mode - UI and backing code
- Begin implementation of library view, optimised for mobile but expandable to tablet size

- Figure out how library selection & management is going to be presented

### Medium Priority
- Verify caching and update mechanism
- Verify app compatibility with iOS
- Import/export library
- Disable devMode by default and provide a mechanism to turn it back on (store in settings)

### Low Priority
- Store app & data versions in settings and use to display short changelog
- Consider Implementation of "Expert" Mode to automatically calculate Server Settings
- Add ClassicFlyers compatibility

### Size Reduction
- Take only the components we use from bootstrap-vue

### Continuous
- Add extra test cases
- Address TODOs and FIXMEs in code
- Improve the extractor : handle more cases and produce less options in as little time as possible


These need updating...
- Add IBM value to server settings
- Implement Auto extract on wild tames
- Future implementations include Creature values for Xbox/Win10 and Ps4, as well as mods like Classic Flyers (framework is almost in place to support both features)
- Change Extractor tab to Calculator and have a radio button to switch from Extractor/Tester(or edit)/Expert Mode
