/**
 * Tests for sum utility functions
 */

import { sum, sumArray } from './sum';

describe('sum', () => {
  it('should add two numbers', () => {
    expect(sum(2, 3)).toBe(5);
  });


});

describe('sumArray', () => {
  it('should sum all numbers in an array', () => {
    expect(sumArray([1, 2, 3, 4, 5])).toBe(15);
  });

});