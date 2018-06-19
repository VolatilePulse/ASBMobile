import { applyDiff, findDiff } from '@/data/firestore/diff';
import { expect } from 'chai';
import { cloneDeep } from 'lodash';

// tslint:disable:no-unused-expression


describe('object differ', () => {
   const original = { a: 1, b: { c: 2 }, arr: ['one', 'two', 'three'] };
   let target: any;

   beforeEach(() => {
      target = cloneDeep(original);
   });

   describe('finds simple adds', () => {
      beforeEach(() => {
         target.x = 'new value';
      });
      it('forwards', () => {
         const diff = findDiff(original, target);
         expect(diff).to.have.keys('.x');
         expect(diff['.x']).to.have.property('operation').which.is.eql('add');
         expect(diff['.x']).to.have.property('value').which.is.eql('new value');
      });
      it('reversed', () => {
         const reverseDiff = findDiff(target, original);
         const reversed = applyDiff(target, reverseDiff);
         expect(reversed).to.eql(original);
      });
   });

   describe('finds simple adds (deep)', () => {
      beforeEach(() => {
         target.b.x = 'new value';
      });
      it('forwards', () => {
         const diff = findDiff(original, target);
         expect(diff).to.have.keys('.b.x');
         expect(diff['.b.x']).to.have.property('operation').which.is.eql('add');
         expect(diff['.b.x']).to.have.property('value').which.is.eql('new value');
      });
      it('reversed', () => {
         const reverseDiff = findDiff(target, original);
         const reversed = applyDiff(target, reverseDiff);
         expect(reversed).to.eql(original);
      });
   });

   describe('finds simple changes', () => {
      beforeEach(() => {
         target.a = 'new value';
      });
      it('forwards', () => {
         const diff = findDiff(original, target);
         expect(diff).to.have.keys('.a');
         expect(diff['.a']).to.have.property('operation').which.is.eql('update');
         expect(diff['.a']).to.have.property('value').which.is.eql('new value');
      });
      it('reversed', () => {
         const reverseDiff = findDiff(target, original);
         const reversed = applyDiff(target, reverseDiff);
         expect(reversed).to.eql(original);
      });
   });

   describe('finds simple changes (deep)', () => {
      beforeEach(() => {
         target.b.c = 'new value';
      });
      it('forwards', () => {
         const diff = findDiff(original, target);
         expect(diff).to.have.keys('.b.c');
         expect(diff['.b.c']).to.have.property('operation').which.is.eql('update');
         expect(diff['.b.c']).to.have.property('value').which.is.eql('new value');
      });
      it('reversed', () => {
         const reverseDiff = findDiff(target, original);
         const reversed = applyDiff(target, reverseDiff);
         expect(reversed).to.eql(original);
      });
   });

   describe('finds simple deletes', () => {
      beforeEach(() => {
         delete target.a;
      });
      it('forwards', () => {
         const diff = findDiff(original, target);
         expect(diff).to.have.keys('.a');
         expect(diff['.a']).to.have.property('operation').which.is.eql('delete');
         expect(diff['.a']).to.not.have.property('value');
      });
      it('reversed', () => {
         const reverseDiff = findDiff(target, original);
         const reversed = applyDiff(target, reverseDiff);
         expect(reversed).to.eql(original);
      });
   });

   describe('finds simple deletes (deep)', () => {
      beforeEach(() => {
         delete target.b.c;
      });
      it('forwards', () => {
         const diff = findDiff(original, target);
         expect(diff).to.have.keys('.b.c');
         expect(diff['.b.c']).to.have.property('operation').which.is.eql('delete');
         expect(diff['.b.c']).to.not.have.property('value');
      });
      it('reversed', () => {
         const reverseDiff = findDiff(target, original);
         const reversed = applyDiff(target, reverseDiff);
         expect(reversed).to.eql(original);
      });
   });

   describe('finds object adds', () => {
      beforeEach(() => {
         target.x = { y: 'new value' };
      });
      it('forwards', () => {
         const diff = findDiff(original, target);
         expect(diff).to.have.keys('.x');
         expect(diff['.x']).to.have.property('operation').which.is.eql('add');
         expect(diff['.x']).to.have.property('value').which.is.eql({ y: 'new value' });
      });
      it('reversed', () => {
         const reverseDiff = findDiff(target, original);
         const reversed = applyDiff(target, reverseDiff);
         expect(reversed).to.eql(original);
      });
   });

   describe('finds object changes with same properties', () => {
      beforeEach(() => {
         target.b = { c: 'new value' };
      });
      it('forwards', () => {
         const diff = findDiff(original, target);
         expect(diff).to.have.keys('.b.c');
         expect(diff['.b.c']).to.have.property('operation').which.is.eql('update');
         expect(diff['.b.c']).to.have.property('value').which.is.eql('new value');
      });
      it('reversed', () => {
         const reverseDiff = findDiff(target, original);
         const reversed = applyDiff(target, reverseDiff);
         expect(reversed).to.eql(original);
      });
   });

   describe('finds object changes with different properties', () => {
      beforeEach(() => {
         target.b = { y: 'new value' };
      });
      it('forwards', () => {
         const diff = findDiff(original, target);
         expect(diff).to.have.keys('.b.c', '.b.y');
         expect(diff['.b.c']).to.have.property('operation').which.is.eql('delete');
         expect(diff['.b.c']).to.have.not.property('value');
         expect(diff['.b.y']).to.have.property('operation').which.is.eql('add');
         expect(diff['.b.y']).to.have.property('value').which.is.eql('new value');
      });
      it('reversed', () => {
         const reverseDiff = findDiff(target, original);
         const reversed = applyDiff(target, reverseDiff);
         expect(reversed).to.eql(original);
      });
   });

   describe('handles array updates as per objects', () => {
      beforeEach(() => {
         target.arr[1] = 'new value';
      });
      it('forwards', () => {
         const diff = findDiff(original, target);
         expect(diff).to.have.keys('.arr.1');
         expect(diff['.arr.1']).to.have.property('operation').which.is.eql('update');
         expect(diff['.arr.1']).to.have.property('value').which.is.eql('new value');
      });
      it('reversed', () => {
         const reverseDiff = findDiff(target, original);
         const reversed = applyDiff(target, reverseDiff);
         expect(reversed).to.eql(original);
      });
   });

   describe('handles array adds as per objects', () => {
      beforeEach(() => {
         target.arr[3] = 'new value';
      });
      it('forwards', () => {
         const diff = findDiff(original, target);
         expect(diff).to.have.keys('.arr.3');
         expect(diff['.arr.3']).to.have.property('operation').which.is.eql('add');
         expect(diff['.arr.3']).to.have.property('value').which.is.eql('new value');
      });
      it('reversed (with empty element)', () => {
         const reverseDiff = findDiff(target, original);
         const reversed = applyDiff(target, reverseDiff);
         expect(reversed).to.have.property('a').which.eql(original.a);
         expect(reversed).to.have.property('b').which.eql(original.b);
         expect(reversed).to.have.property('arr').with.length(3);
         expect(reversed.arr[3]).to.be.undefined;
      });
   });

   describe('handles array delete as per objects', () => {
      beforeEach(() => {
         delete target.arr[1];
      });
      it('forwards', () => {
         const diff = findDiff(original, target);
         expect(diff).to.have.keys('.arr.1');
         expect(diff['.arr.1']).to.have.property('operation').which.is.eql('delete');
         expect(diff['.arr.1']).to.not.have.property('value');
      });
      it('reversed (with empty element)', () => {
         const reverseDiff = findDiff(target, original);
         const reversed = applyDiff(target, reverseDiff);
         expect(reversed).to.eql(original);
      });
   });

   describe('handles array removes as per objects', () => {
      beforeEach(() => {
         target.arr.splice(1, 1);
      });
      it('forwards', () => {
         const diff = findDiff(original, target);
         expect(diff).to.have.keys('.arr.1', '.arr.2');
         expect(diff['.arr.1']).to.have.property('operation').which.is.eql('update');
         expect(diff['.arr.1']).to.have.property('value').which.is.eql('three');
         expect(diff['.arr.2']).to.have.property('operation').which.is.eql('delete');
         expect(diff['.arr.2']).to.not.have.property('value');
      });
      it('reversed', () => {
         const reverseDiff = findDiff(target, original);
         const reversed = applyDiff(target, reverseDiff);
         expect(reversed).to.eql(original);
      });
   });

   describe('handles array inserts as per objects', () => {
      beforeEach(() => {
         target.arr.splice(2, 0, 'new value');
      });
      it('forwards', () => {
         const diff = findDiff(original, target);
         expect(diff).to.have.keys('.arr.2', '.arr.3');
         expect(diff['.arr.2']).to.have.property('operation').which.is.eql('update');
         expect(diff['.arr.2']).to.have.property('value').which.is.eql('new value');
         expect(diff['.arr.3']).to.have.property('operation').which.is.eql('add');
         expect(diff['.arr.3']).to.have.property('value').which.is.eql('three');
      });
      it('reversed (with empty element)', () => {
         const reverseDiff = findDiff(target, original);
         const reversed = applyDiff(target, reverseDiff);
         expect(reversed).to.have.property('a').which.eql(original.a);
         expect(reversed).to.have.property('b').which.eql(original.b);
         expect(reversed).to.have.property('arr').with.length(3);
         expect(reversed.arr[3]).to.be.undefined;
      });
   });

   it('applied deletes can be replaced with a string', () => {
      const changes: any = { '.a': { operation: 'delete' } };
      const result = applyDiff(target, changes, 'GONE');
      expect(result).to.have.property('a').which.equals('GONE');
   });

   it('applied deletes can be replaced with an object', () => {
      const changes: any = { '.a': { operation: 'delete' } };
      const deleted = {};
      const result = applyDiff(target, changes, deleted);
      expect(result).to.have.property('a').which.equals(deleted);
   });

   describe('handles properties as values', () => {
      let left: any;
      let right: any;

      beforeEach(() => {
         left = {
            get a() { return 1; }
         };
         right = {
            a: 1,
         };
      });

      it('when no difference', () => {
         const changes = findDiff(left, right);
         expect(changes).to.be.empty;
      });

      it('when different', () => {
         right.a = 2;
         const changes = findDiff(left, right);
         expect(changes).to.have.property('.a').which.has.property('operation').which.equals('update');
         expect(changes['.a']).to.have.property('value').which.equals(2);
      });
   });
});
