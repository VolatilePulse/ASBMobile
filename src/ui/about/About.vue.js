import withRender from './About.html?style=./About.css';

import * as app from '../../app';

export default withRender({
   name: 'about',

   data: () => ({
   }),

   computed: {
      dbVersion: () => app.data.valuesJson
   }
});
