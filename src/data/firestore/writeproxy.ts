import { clone, pickBy } from 'lodash';
import { isObject } from 'util';


export class WriteProxy<T extends object> implements ProxyHandler<T> {
   public proxy: T;

   log: any[];

   private proxies: WeakMap<any, any>;
   private shadows: WeakMap<any, any>;

   constructor(public target: T) {
      this.log = [];
      this.proxies = new WeakMap();
      this.shadows = new WeakMap();
      this.proxy = this.proxyFor(target);
   }

   public getChanges(): any {
      return this._getChanges(this.target);
   }

   _getChanges(obj: any): any {
      const shadow = this.shadows.get(obj);
      let changes = shadow ? clone(shadow) : {};
      Object.entries(obj).forEach(([k, v]) => {
         if (k in changes || !isObject(v)) return;
         changes[k] = this._getChanges(v);
      });
      changes = pickBy(changes, v => !(isObject(v) && Object.keys(v).length === 0));
      return changes;
   }

   proxyFor(obj: T): T {
      const existing = this.proxies.get(obj);
      if (existing instanceof Object) return existing;

      const proxy = new Proxy(obj, this);
      this.proxies.set(obj, proxy);
      return proxy;
   }

   get(target: T, key: PropertyKey, receiver: any): any {
      this.log.push(['get', key]);
      if (key === '__isProxy') return true;

      let value: any;

      const shadow = this.shadows.get(target);
      if (shadow !== undefined) {
         if (key === '__isShadow') return true;
         value = Reflect.get(shadow, key, shadow);
      }
      else {
         value = Reflect.get(target, key, receiver);
      }

      if (value instanceof Object && !value.__isProxy) {
         value = this.proxyFor(value);
      }

      return value;
   }

   set(target: T, key: PropertyKey, value: any, receiver: any): boolean {
      this.log.push(['set', key, value]);

      // if (isString(key) && key.startsWith('__'))
      //    return Reflect.set(target, key, value, receiver);

      const pd = Object.getOwnPropertyDescriptor(target, key);
      if (pd && pd.set)
         return Reflect.set(target, key, value, receiver);

      let shadow = this.shadows.get(target);
      if (shadow === undefined) {
         this.log.push(['new shadow']);
         shadow = {};
         this.shadows.set(target, shadow);
      }

      return Reflect.set(shadow, key, value, shadow);
   }

   getOwnPropertyDescriptor(target: T, key: PropertyKey): PropertyDescriptor | undefined {
      this.log.push(['getOwnPropertyDescriptor', key]);
      if (key === '__isProxy') return undefined;

      const shadow = this.shadows.get(target);
      if (shadow !== undefined) {
         this.log.push(['...using shadow', key]);
         return Reflect.getOwnPropertyDescriptor(shadow, key);
      }
      else {
         this.log.push(['...using target', key]);
         return Reflect.getOwnPropertyDescriptor(target, key);
      }
   }

   has(target: T, key: PropertyKey): boolean {
      this.log.push(['has', key]);
      if (key === '__isProxy') return true;

      let has: boolean;

      const shadow = this.shadows.get(target);
      if (shadow !== undefined) {
         has = key in shadow && shadow[key] !== undefined; // Reflect.has(shadow, key);
      }
      else {
         has = Reflect.has(target, key);
      }

      return has;
   }

   deleteProperty(target: T, key: PropertyKey): boolean {
      this.log.push(['deleteProperty', key]);
      if (key === '__isProxy') return true;

      let okay: boolean;

      let shadow = this.shadows.get(target);
      if (shadow === undefined) {
         this.log.push(['new shadow']);
         shadow = {};
         this.shadows.set(target, shadow);
      }

      okay = Reflect.set(shadow, key, undefined, shadow);

      return okay;
   }

   getPrototypeOf?(target: T): object | null {
      this.log.push(['getPrototypeOf']);
      return Reflect.getPrototypeOf(target);
   }
   setPrototypeOf?(target: T, v: any): boolean {
      this.log.push(['setPrototypeOf', v]);
      return Reflect.setPrototypeOf(target, v);
   }
   isExtensible?(target: T): boolean {
      this.log.push(['isExtensible']);
      return Reflect.isExtensible(target);
   }
   preventExtensions?(target: T): boolean {
      this.log.push(['preventExtensions']);
      return Reflect.preventExtensions(target);
   }
   defineProperty?(target: T, p: PropertyKey, attributes: PropertyDescriptor): boolean {
      this.log.push(['defineProperty', p, attributes]);
      return Reflect.defineProperty(target, p, attributes);
   }
   enumerate?(target: T): PropertyKey[] {
      this.log.push(['enumerate']);
      return Reflect.enumerate(target) as any;
   }
   ownKeys?(target: T): PropertyKey[] {
      this.log.push(['enumerate']);
      return Reflect.ownKeys(target);
   }
   apply?(target: T, thisArg: any, argArray?: any): any {
      this.log.push(['apply', target]);
      return Reflect.apply(target as any, thisArg, argArray);
   }
}
