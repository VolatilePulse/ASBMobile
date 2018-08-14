import { SubSystem } from '@/systems/common';
import theStore, { EVENT_SCREEN_RESIZED } from '@/ui/store';
import _ from 'lodash';


const BOUNDARIES: Array<[string, number]> = [
   ['xs', 576],
   ['sm', 768],
   ['md', 992],
   ['lg', 1200],
   ['xl', 1E9],
];

const DEBOUNCE_WAIT = 250;
const DEBOUNCE_WAIT_MAX = 750;

export interface ScreenState {
   width: number;
   height: number;
   breakpoint: string;
   size: number;
}

class ResizeSystem implements SubSystem {
   private resizeDebounce: ((evt: any) => void) & _.Cancelable;

   public async initialise() {
      console.log('ResizeSystem: Started');

      this.resizeDebounce = _.debounce(this.onResize.bind(this), DEBOUNCE_WAIT, { maxWait: DEBOUNCE_WAIT_MAX });

      window.addEventListener('resize', this.resizeDebounce, false);
      window.addEventListener('orientationchange', this.resizeDebounce, false);

      // Do the initial setup without raising a change event
      this.onResize(true);

      console.log('ResizeSystem: Done');
   }

   private onResize(noEvent?: boolean) {
      // This method only changes values in theStore where they have changed, to reduce Vue observer updates
      if (theStore.screen.width !== window.innerWidth) theStore.screen.width = window.innerWidth;
      if (theStore.screen.height !== window.innerHeight) theStore.screen.height = window.innerHeight;

      for (let i = 0; i < BOUNDARIES.length; i++) {
         const [name, limit] = BOUNDARIES[i];
         if (limit > theStore.screen.width) {
            if (theStore.screen.breakpoint !== name) theStore.screen.breakpoint = name;
            if (theStore.screen.size !== i) theStore.screen.size = i;
            break;
         }
      }

      console.log(`ResizeSystem: Screen changed to ${theStore.screen.width} x ${theStore.screen.height} (${theStore.screen.breakpoint})`);

      if (!noEvent) theStore.events.emit(EVENT_SCREEN_RESIZED);
   }
}

export const resizeSystem = new ResizeSystem();
