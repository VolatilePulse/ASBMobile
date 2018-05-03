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
- Ability to import Ark Exports into extractor
- Implement library-specific settings
- Move last selected server setting from app settings to library settings
- Implement a real Extractor UI
- Begin implementation of Stat Tester - UI and backing code
- Begin implementation of Expert Mode - UI and backing code
- Begin implementation of library view, optimised for mobile but expandable to tablet size
- Add IBM value to server editing UI
- Store last app & data versions in app settings
- Display generated What's New page when app version changes
- Display notification when data version changes

### Medium Priority
- Add server selector either globally or in extractor
- Figure out how library selection & management is going to be presented
- Add ability to load extra configs, such as ClassicFlyers, in a generic way
- Verify caching and update mechanism works
- Verify app compatibility with iOS
- Add vanilla class-species mappings to data.json (to be used in importer)
- Import/export ASB library
- Disable devMode by default and provide a mechanism to turn it back on (store in app settings)
- Create continuous tester using random creatures and random server parameters
- Implement internationalisation via [i18-next](i18next.com) and [panter/vue-i18next](https://github.com/panter/vue-i18next)
- Change Extractor tab to Calculator and add ability to switch from Extractor/Tester(or edit)/Expert Mode?
- Switch navigation to vue-router to get more capability

### Size Reduction
- Take only the components we use from bootstrap-vue
- Investigate the recent 100Kb bump in size

### Continuous
- Add extra test cases
- Address TODOs and FIXMEs in code
- Improve the extractor : handle more cases and produce less options in as little time as possible
