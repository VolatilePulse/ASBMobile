import { ChangeHandler } from '@/data/firestore/change';
import _ from 'lodash';
import Vue, { VNode, VNodeDirective } from 'vue';


function isNumberLike(value: string | number) {
   return String(value).match(/^\d+$/);
}

function hasOwnProperty(object: any, property: string) {
   return Object.prototype.hasOwnProperty.call(object, property);
}

function toPath(pathString: string | string[]) {
   if (Array.isArray(pathString)) return pathString;
   if (typeof pathString === 'number') return [pathString];
   pathString = String(pathString);

   // taken from lodash - https://github.com/lodash/lodash
   const pathRx = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(\.|\[\])(?:\4|$))/g;
   const pathArray: string[] = [];

   pathString.replace(pathRx, (match, num, quote, str) => {
      pathArray.push(quote ? str : num !== undefined ? Number(num) : match);
      return pathArray[pathArray.length - 1];
   });
   return pathArray;
}

export function vueSet(obj: any, path: string | string[], value: any) {
   const fields = Array.isArray(path) ? path : toPath(path);
   const prop = fields.shift();

   if (!fields.length) return Vue.set(obj, prop, value);
   if (!hasOwnProperty(obj, prop) || obj[prop] === null) {
      const objVal = fields.length >= 1 && isNumberLike(fields[0]) ? [] : {};
      Vue.set(obj, prop, objVal);
   }
   vueSet(obj[prop], fields, value);
}

Vue.directive('net-data', {
   bind(el: HTMLElement, binding: VNodeDirective, vNode: VNode) { // on first bind, before VNodes are present
      if (!(vNode.context as any).cache) throw new Error('v-net-data requires a cache in the containing component');

      if (el.tagName.toLowerCase() === 'div' && el.childElementCount > 0) el = el.childNodes[0] as HTMLElement;
      if (el.tagName.toLowerCase() !== 'input') throw new Error('v-net-data attached no non-input element');

      const inputEl = el as HTMLInputElement;
      const vm = vNode.context as Vue;
      const cache = (vNode.context as any).cache as ChangeHandler<any>;
      const path = binding.arg.replace(/_/g, '.');

      inputEl.disabled = true;
      inputEl.classList.add('net-data');
      const isNumber = !!binding.modifiers.number;
      if (isNumber) {
         el.setAttribute('type', 'number');
      }

      // Wait for isActive to be set
      vm.$watch('cache.isActive', active => {
         if (active && !el.dataset.netDataActivated) {
            el.dataset.netDataActivated = 'true';
            el.dataset.netIgnoreNext = 'true';
            inputEl.disabled = false;

            // Monitor all data model changes
            vm.$watch('cache.user.' + path, value => {
               inputEl.value = value.toString();
               if (inputEl.dataset.netIgnoreNext) {
                  delete inputEl.dataset.netIgnoreNext;
               } else {
                  inputEl.classList.add('changed');
                  setTimeout(() => inputEl.classList.remove('changed'), 1000);
               }
            }, { immediate: true });

            // Monitor incoming conflicts
            vm.$watch('cache.conflicts', () => {
               if (('.' + path) in cache.conflicts) {
                  inputEl.classList.add('conflict');
                  inputEl.disabled = true;
               } else {
                  inputEl.classList.remove('conflict');
                  inputEl.disabled = false;
               }
            }, { immediate: true, deep: true });

            // Watch for user changes in the element
            el.addEventListener('input', () => {
               const newValue = isNumber ? parseFloat(inputEl.value) : inputEl.value;
               const oldValue = _.get(cache.user, path);
               if (newValue !== oldValue) {
                  vueSet(cache.user, path, newValue); // vueSet is a deep, path-based Vue.set
                  el.dataset.netIgnoreNext = 'true';
                  cache.notifyUserDirty();
               }
            });
         }
      });
   },

   // inserted(el, binding, vNode) {} - when VNodes are inserted
   // updated(el, binding, vNode, oldVNode) {} - called after parent VNode is updated
   // componentUpdated(el, binding, vNode, oldVNode) {} - called after parent VNode and all of its children are updated
   // unbind() {} - before directive is removed from an element
});
