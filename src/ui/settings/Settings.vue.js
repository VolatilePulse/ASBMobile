// @ts-ignore
import withRender from './Settings.html?style=./Settings.css';

import * as app from '../../app';

export default withRender({
   name: 'settings',

   data: () => ({
      settings: app.settings.current,
   }),

   methods: {
      markDirty() { app.settings.notifyChanged(); },
   },
});
