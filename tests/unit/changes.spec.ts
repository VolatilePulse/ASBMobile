import { ChangeHandler } from '@/data/firestore/change';
import { expect } from 'chai';
import { cloneDeep } from 'lodash';

// tslint:disable:no-unused-expression


describe('network change handler', () => {
   const original = { a: 1, b: { c: 2 }, arr: ['one', 'two', 'three'] };
   let temp: any;
   let cache: ChangeHandler<any>;

   beforeEach(() => {
      temp = cloneDeep(original);
      cache = new ChangeHandler(cloneDeep(original));
   });

   it('gives access to initial data', () => {
      expect(cache.user).to.have.property('a').which.equals(1);
   });

   it('receives simple updates from the network', () => {
      temp.a = 2;
      cache.acceptNewData(temp);
      expect(cache.user).to.have.property('a').which.equals(2);
      expect(cache.conflicts).to.be.empty;
   });

   it('receives multiple updates from the network', () => {
      temp.a = 2;
      temp.b.c = 4;
      cache.acceptNewData(temp);
      expect(cache.user).to.have.property('a').which.equals(2);
      expect(cache.user).to.have.property('b');
      expect(cache.user.b).to.have.property('c').which.equals(4);
      expect(cache.conflicts).to.be.empty;
   });

   it('receives additions from the network', () => {
      (temp as any).x = 10;
      cache.acceptNewData(temp);
      expect(cache.user).to.have.property('x').which.equals(10);
      expect(cache.conflicts).to.be.empty;
   });

   it('maintains user data when non-conflicting data arrives', () => {
      cache.user.a = 2;
      temp.b.c = 4;
      cache.acceptNewData(temp);
      expect(cache.user).to.have.property('a').which.equals(2);
      expect(cache.user.b).to.have.property('c').which.equals(4);
      expect(cache.conflicts).to.be.empty;
   });

   it('maintains user data when non-conflicting data arrives (repeated)', () => {
      cache.user.a = 2;
      temp.b.c = 4;
      cache.acceptNewData(temp);
      expect(cache.user).to.have.property('a').which.equals(2);
      expect(cache.user.b).to.have.property('c').which.equals(4);
      expect(cache.conflicts).to.be.empty;
      temp.b.c = 5;
      cache.acceptNewData(temp);
      expect(cache.user).to.have.property('a').which.equals(2);
      expect(cache.user.b).to.have.property('c').which.equals(5);
      expect(cache.conflicts).to.be.empty;
   });

   it('maintains user data when conflicting data arrives', () => {
      cache.user.a = 2;
      temp.a = 3;
      cache.acceptNewData(temp);
      expect(cache.user).to.have.property('a').which.equals(2);
      expect(cache.conflicts).to.have.property('.a');
   });

   it('maintains user data when conflicting data arrives (repeated)', () => {
      cache.user.a = 2;
      temp.a = 3;
      cache.acceptNewData(temp);
      expect(cache.user).to.have.property('a').which.equals(2);
      expect(cache.conflicts).to.have.property('.a');
      cache.acceptNewData(temp);
      expect(cache.user).to.have.property('a').which.equals(2);
      expect(cache.conflicts).to.have.property('.a');
   });

   it('maintains conflicts when new unrelated data arrives', () => {
      cache.user.a = 2;
      temp.a = 3;
      cache.acceptNewData(temp);
      expect(cache.user).to.have.property('a').which.equals(2);
      expect(cache.conflicts).to.have.property('.a');
      temp = cloneDeep(original);
      temp.a = 3;
      temp.b.c = 10;
      cache.acceptNewData(temp);
      expect(cache.user).to.have.property('a').which.equals(2);
      expect(cache.conflicts).to.have.property('.a');
   });

   it('maintains user data when conflicting data arrives (deep)', () => {
      cache.user.b.c = 3;
      temp.b.c = 4;
      cache.acceptNewData(temp);
      expect(cache.user).to.have.property('b').which.has.property('c').which.equals(3);
      expect(cache.conflicts).to.have.property('.b.c');
   });

   it('maintains user data when new data arrives (new)', () => {
      cache.user.b.x = 10;
      temp.b.y = 11;
      cache.acceptNewData(temp);
      expect(cache.user).to.have.property('b').which.has.property('x').which.equals(10);
      expect(cache.user).to.have.property('b').which.has.property('y').which.equals(11);
      expect(cache.conflicts).is.empty;
   });

   it('maintains user data when conflicting data arrives (deletes)', () => {
      cache.user.b.c = 3;
      delete temp.b.c;
      cache.acceptNewData(temp);
      expect(cache.user).to.have.property('b').which.has.property('c').which.equals(3);
      expect(cache.conflicts).to.have.property('.b.c');
   });

   it('removes conflicts after same data arrives', () => {
      cache.user.a = 3;
      temp.a = 2;
      cache.acceptNewData(temp);
      expect(cache.user).to.have.property('a').which.equals(3);
      expect(cache.conflicts).to.have.property('.a');
      temp.a = 3;
      cache.acceptNewData(temp);
      expect(cache.user).to.have.property('a').which.equals(3);
      expect(cache.conflicts).to.be.empty;
   });
});
