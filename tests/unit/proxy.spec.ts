import { WriteProxy } from '@/data/firestore/writeproxy';
import { shallowMount, Wrapper } from '@vue/test-utils';
import { expect } from 'chai';
import { cloneDeep } from 'lodash';
import { inspect } from 'util';
import Vue from 'vue';
import Proxied from './proxied.vue';

// tslint:disable:no-unused-expression

inspect.defaultOptions = { colors: true, depth: 4, showProxy: true };


describe('write-caching proxy acts like a normal object', () => {
   const original = { a: 1, b: { c: 2 } };

   let target: typeof original;
   let writer: WriteProxy<typeof target>;
   let proxy: any;

   beforeEach(() => {
      target = cloneDeep(original);
      writer = new WriteProxy(target);
      proxy = writer.proxy;
   });

   it('can be created and all original values can be read', () => {
      expect(writer.proxy).to.exist;
      expect(proxy).to.eql(target);
   });

   it('returns undefined for missing properties', () => {
      expect(proxy.z).to.be.undefined;
   });

   it('can be assigned to and read back', () => {
      proxy.a = 2;
      expect(proxy.a).to.eq(2);
   });

   it('can be assigned to and read back (deep)', () => {
      proxy.b.c = 3;
      expect(proxy.b.c).to.eq(3);
   });

   it('object reads return a proxy', () => {
      const target_b = target.b;
      const proxy_b = proxy.b;
      expect(proxy_b).to.eql(target_b).but.not.equal(target_b); // == but not ===
      expect(proxy.__isProxy).to.be.true;
   });

   it('repeated object reads return same proxy', () => {
      expect(proxy.b).to.equal(proxy.b);
   });

   it('can have new properties written', () => {
      proxy.d = 5;
      expect(proxy.d).to.eq(5);
   });

   it('can have new properties written (deep)', () => {
      proxy.b.d = 5;
      expect(proxy.b.d).to.eq(5);
   });

   it('allows properties to be enumerated', () => {
      const names = Object.getOwnPropertyNames(proxy);
      expect(names).to.have.members(['a', 'b']);
   });

   it('deletes appear to work', () => {
      proxy.d = 1;
      expect(proxy.d).to.equals(1);
      expect('d' in proxy).to.be.true;
      expect(proxy).to.have.property('d');
      delete proxy.d;
      expect(proxy.d).to.be.undefined;
      expect(proxy).to.not.have.property('d');
   });

   it('deletes appear to work (deep)', () => {
      proxy.b.d = 1;
      expect(proxy.b).to.have.property('d').that.equals(1);
      delete proxy.b.d;
      expect(proxy.b.d).to.be.undefined;
      expect(proxy.b).to.not.have.property('d');
   });

   it('can have a getter added', () => {
      Object.defineProperty(proxy, '_a', { get() { return this.a; }, set(value) { this.a = value; } });
      expect(proxy._a).to.eql(1);
   });

   it('getters for objects are given proxies', () => {
      Object.defineProperty(proxy, '_b', { get() { return this.b; }, set(value) { this.b = value; } });
      expect(proxy._b).to.eql(target.b).but.not.equal(target.b);
      expect(proxy._b.__isProxy).to.be.true;
   });

   it('can have a setter added', () => {
      Object.defineProperty(proxy, '_a', { get() { return this.a; }, set(value) { this.a = value; } });
      const pd = Object.getOwnPropertyDescriptor(proxy, '_a');
      expect(pd.set).to.not.be.undefined;
      expect(pd.value).to.be.undefined;
   });

   it('setters work as expected', () => {
      Object.defineProperty(proxy, '_a', { get() { return this.a; }, set(value) { this.a = value; } });
      proxy._a = 2;
      expect(proxy.a).to.eql(2);
   });

   it('setters with objects work', () => {
      Object.defineProperty(proxy, '_b', { get() { return this.b; }, set(value) { this.b = value; } });
      proxy._b = { d: 3 };
      expect(proxy.b).to.eql({ d: 3 });
      expect(proxy.b).to.have.property('d').which.equals(3);
      expect(proxy.b).to.not.eql(original.a);
   });
});


describe('write-caching proxy buffers writes', () => {
   const original = { a: 1, b: { c: 2 } };

   let target: typeof original;
   let writer: WriteProxy<typeof target>;
   let proxy: any;

   beforeEach(() => {
      target = cloneDeep(original);
      writer = new WriteProxy(target);
      proxy = writer.proxy;
   });

   it('writes can be read back but don\'t affect the original', () => {
      proxy.a = 4;
      expect(proxy.a).to.equal(4);
      expect(target.a).to.equal(original.a);
   });

   it('writes can be read back but don\'t affect the original (deep)', () => {
      proxy.b.c = 5;
      expect(proxy.b.c).to.equal(5);
      expect(target.b.c).to.equal(original.b.c);
   });

   it('new properties are supported', () => {
      proxy.d = 5;
      expect(proxy.d).to.equal(5);
      expect(target).to.eql(original);
   });

   it('setters do not affect the original', () => {
      Object.defineProperty(proxy, '_a', { get() { return this.a; }, set(value) { this.a = value; } });
      proxy._a = 2;
      expect(proxy.a).to.eql(2);
      expect(target).to.eql(original);
   });

   it('setters do not affect the original (deep)', () => {
      Object.defineProperty(proxy.b, '_c', { get() { return this.c; }, set(value) { this.c = value; } });
      proxy.b._c = 4;
      expect(proxy.b.c).to.eql(4);
      expect(target).to.eql(original);
   });

   it('deep writes don\'t affect the deep proxying', () => {
      proxy.b.c = 5;
      expect(proxy.b.__isProxy).to.be.true;
   });

   it('allows properties to be enumerated after writing', () => {
      proxy.a = 2;
      const names = Object.getOwnPropertyNames(proxy);
      expect(names).to.have.members(['a', 'b']);
   });

   // it('allow __ writes to pass through to the original', () => {
   //    proxy.__dummy__ = 'dummy';
   //    expect(proxy.__dummy__).to.equal('dummy');
   //    expect((target as any).__dummy__).to.equal('dummy');
   // });

   it('gives access to the changes', () => {
      proxy.a = 2;
      const changes = writer.getChanges();
      expect(changes).to.have.keys('a');
   });

   it('gives access to the changes (deep)', () => {
      proxy.b.c = 3;
      const changes = writer.getChanges();
      expect(changes).to.have.keys('b');
      expect(changes.b).to.have.keys('c');
   });

   it('deletes are recorded as undefined writes', () => {
      delete proxy.a;
      const changes = writer.getChanges();
      expect(changes).to.have.property('a').which.is.undefined;
   });

   it('deletes are recorded as undefined writes (object)', () => {
      delete proxy.b;
      const changes = writer.getChanges();
      expect(changes).to.have.property('b').which.is.undefined;
   });

   it('deletes are recorded as undefined writes (deep)', () => {
      delete proxy.b.c;
      const changes = writer.getChanges();
      expect(changes).to.have.property('b');
      expect(changes.b).to.have.property('c').which.is.undefined;
   });
});


describe('write-caching proxy can be used with Vue', () => {
   const original = { a: 1, b: { c: 2 } };

   let target: typeof original;
   let writer: WriteProxy<typeof target>;
   let proxy: any;

   let wrapper: Wrapper<Proxied>;
   let cmp: { [name: string]: Wrapper<Vue> };
   const cmpIds = ['output_a', 'output_c', 'change_a', 'change_c'];

   beforeEach(() => {
      target = cloneDeep(original);
      writer = new WriteProxy(target);
      proxy = writer.proxy;

      wrapper = shallowMount(Proxied, { propsData: { data: proxy } });
      cmp = {};
      cmpIds.forEach(id => cmp[id] = wrapper.find('#' + id));
   });

   it('target is untouched after being attached to a Vue component', () => {
      expect(target).to.eql(original);
      expect((target.b as any).__isProxy).to.be.undefined;
   });

   it('content can be rendered', () => {
      expect(cmp.output_a.text()).to.equal('1');
      expect(cmp.output_c.text()).to.equal('2');
   });

   it('content is updated when the underlying data changes', () => {
      proxy.a = 2;
      expect(cmp.output_a.text()).to.equal('2');
      proxy.b.c = 3;
      expect(cmp.output_c.text()).to.equal('3');
   });

   it('content is updated when the Vue changes the data', () => {
      cmp.change_a.trigger('click');
      expect(cmp.output_a.text()).to.equal('2');
      cmp.change_c.trigger('click');
      expect(cmp.output_c.text()).to.equal('3');
   });

   it('changes from Vue are buffer and do not affec the original', () => {
      expect(writer.getChanges()).to.be.an('object').and.be.empty;
      cmp.change_a.trigger('click');
      expect(target.a).to.equal(original.a);
      expect(writer.getChanges()).to.be.an('object').and.have.keys('a');
   });
});

