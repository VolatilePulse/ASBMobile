# ASBMobile
https://volatilepulse.github.io/ASBMobile/

### This is very much a work in progress and we ask you to please be patient as we attempt to provide the best experience possible. Unfortunately, we are not accept feature requests at this time. We are also very aware of bugs in the program at the moment. Thank you. :smile:

## Inspiration

This app is inspired by the wonderful [Ark Smart Breeding](https://github.com/cadon/ARKStatsExtractor) and aims to replicate some of its functionality for mobile and tablet devices.

## Development

This project follows gitflow. Development work should be based off the `develop` branch, or in feature branches for large tasks.

For reference: <https://github.com/petervanderdoes/gitflow-avh>

## TODO

### High Priority
- Add server selector globally?
- Move last selected server setting from user settings to library settings
- Implement a real Extractor UI
- Begin implementation of Stat Tester - UI and backing code
- Begin implementation of Expert Mode - UI and backing code
- Begin implementation of library view, optimised for mobile but expandable to tablet size
- Figure out how library selection & management is going to be presented
- Add IBM value to server settings page

### Medium Priority
- Add ability to load extra configs, such as ClassicFlyers
- Verify caching and update mechanism
- Verify app compatibility with iOS
- Add class-species mappings to data.json
- Import/export ASB library
- Disable devMode by default and provide a mechanism to turn it back on (store in settings)
- Create continuous tester using random creatures and random server parameters
- Store last app & data versions in settings and use to display generated What's New page
- Investigate internationalisation via [i18-next](i18next.com) and [panter/vue-i18next](https://github.com/panter/vue-i18next)

### Low Priority
- Consider Implementation of "Expert" Mode to automatically calculate Server Settings

### Size Reduction
- Take only the components we use from bootstrap-vue

### Continuous
- Add extra test cases
- Address TODOs and FIXMEs in code
- Improve the extractor : handle more cases and produce less options in as little time as possible


These need updating...
- Implement Auto extract on wild tames?
- Change Extractor tab to Calculator and add ability to switch from Extractor/Tester(or edit)/Expert Mode?
