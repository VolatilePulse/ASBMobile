// @ts-ignore
import withRender from './Welcome.html?style=./Welcome.css';

import * as app from '../../app';

export default withRender({
   name: 'welcome',

   data: () => ({
   }),

   computed: {
      dbVersion: () => app.data.valuesJson
   }
});
