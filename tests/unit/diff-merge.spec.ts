import { findDiff, mergeDiffs } from '@/data/firestore/diff';
import { expect } from 'chai';
import { cloneDeep } from 'lodash';
import { inspect } from 'util';

// tslint:disable:no-unused-expression

inspect.defaultOptions = { colors: true, depth: 4, showProxy: true };


describe('object merger', () => {
   const original = { a: 1, b: { c: 2 }, arr: ['one', 'two', 'three'] };
   let target: any, ours: any, theirs: any;

   beforeEach(() => {
      target = cloneDeep(original);
      ours = cloneDeep(original);
      theirs = cloneDeep(original);
   });

   describe('non-conflicting changes', () => {
      it('handles simple changes on our side', () => {
         ours.a = 2;
         const result = mergeDiffs(target, findDiff(target, ours), findDiff(target, theirs));
         expect(result).to.have.property('target').which.eql(ours);
      });

      it('handles simple changes on their side', () => {
         theirs.a = 2;
         const result = mergeDiffs(target, findDiff(target, ours), findDiff(target, theirs));
         expect(result).to.have.property('target').which.eql(theirs);
      });

      it('handles adds on our side', () => {
         ours.x = 2;
         const result = mergeDiffs(target, findDiff(target, ours), findDiff(target, theirs));
         expect(result).to.have.property('target').which.eql(ours);
      });

      it('handles adds on their side', () => {
         theirs.x = 2;
         const result = mergeDiffs(target, findDiff(target, ours), findDiff(target, theirs));
         expect(result).to.have.property('target').which.eql(theirs);
      });

      it('handles deletes on our side', () => {
         delete ours.a;
         const result = mergeDiffs(target, findDiff(target, ours), findDiff(target, theirs));
         expect(result).to.have.property('target').which.eql(ours);
      });

      it('handles deletes on their side', () => {
         delete theirs.a;
         const result = mergeDiffs(target, findDiff(target, ours), findDiff(target, theirs));
         expect(result).to.have.property('target').which.eql(theirs);
      });

      it('handles identical changes on both sides', () => {
         ours.a = 2;
         theirs.a = 2;
         const result = mergeDiffs(target, findDiff(target, ours), findDiff(target, theirs));
         expect(result).to.have.property('target').which.eql(ours);
      });

      it('handles identical adds on both sides', () => {
         ours.x = 2;
         theirs.x = 2;
         const result = mergeDiffs(target, findDiff(target, ours), findDiff(target, theirs));
         expect(result).to.have.property('target').which.eql(ours);
      });

      it('handles identical deletes on both sides', () => {
         delete ours.a;
         delete theirs.a;
         const result = mergeDiffs(target, findDiff(target, ours), findDiff(target, theirs));
         expect(result).to.have.property('target').which.eql(ours);
      });

      it('handles our deep change when their parent changed', () => {
         delete ours.b.c;
         theirs.b = { z: 10 };
         const result = mergeDiffs(target, findDiff(target, ours), findDiff(target, theirs));
         expect(result).to.have.property('target').which.eql(theirs);
         expect(result.conflicts).to.be.empty;
      });
   });

   describe('conflicting changes', () => {
      it('record different changes', () => {
         ours.a = 2;
         theirs.a = 3;
         const result = mergeDiffs(target, findDiff(target, ours), findDiff(target, theirs));
         expect(result).to.have.property('target').which.eql(original);
         expect(result.conflicts).to.have.keys('.a');
         expect(result.conflicts['.a']).to.have.property('operation').which.equals('merge');
         expect(result.conflicts['.a']).to.have.property('ourChange').which.is.eql({ operation: 'update', value: 2 });
         expect(result.conflicts['.a']).to.have.property('theirChange').which.is.eql({ operation: 'update', value: 3 });
      });

      it('record different adds', () => {
         ours.x = 2;
         theirs.x = 3;
         const result = mergeDiffs(target, findDiff(target, ours), findDiff(target, theirs));
         expect(result).to.have.property('target').which.eql(original);
         expect(result.conflicts).to.have.keys('.x');
         expect(result.conflicts['.x']).to.have.property('operation').which.equals('merge');
         expect(result.conflicts['.x']).to.have.property('ourChange').which.is.eql({ operation: 'add', value: 2 });
         expect(result.conflicts['.x']).to.have.property('theirChange').which.is.eql({ operation: 'add', value: 3 });
      });

      it('record our change when theirs deleted', () => {
         ours.a = 2;
         delete theirs.a;
         const result = mergeDiffs(target, findDiff(target, ours), findDiff(target, theirs));
         expect(result).to.have.property('target').which.eql(original);
         expect(result.conflicts).to.have.keys('.a');
         expect(result.conflicts['.a']).to.have.property('operation').which.equals('merge');
         expect(result.conflicts['.a']).to.have.property('ourChange').which.is.eql({ operation: 'update', value: 2 });
         expect(result.conflicts['.a']).to.have.property('theirChange').which.is.eql({ operation: 'delete' });
      });

      it('record our delete when theirs changes', () => {
         delete ours.a;
         theirs.a = 2;
         const result = mergeDiffs(target, findDiff(target, ours), findDiff(target, theirs));
         expect(result).to.have.property('target').which.eql(original);
         expect(result.conflicts).to.have.keys('.a');
         expect(result.conflicts['.a']).to.have.property('operation').which.equals('merge');
         expect(result.conflicts['.a']).to.have.property('ourChange').which.is.eql({ operation: 'delete' });
         expect(result.conflicts['.a']).to.have.property('theirChange').which.is.eql({ operation: 'update', value: 2 });
      });
   });
});
