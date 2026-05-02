/**
 * Tests for sum utility functions
 */

import { sum, sumArray } from './sum';

describe('sum', () => {
  it('should add two numbers', () => {
    expect(sum(2, 3)).toBe(5);
  });

  it('should handle negative numbers', () => {
    expect(sum(-1, 1)).toBe(0);
    expect(sum(-5, -3)).toBe(-8);
  });

  it('should handle zero', () => {
    expect(sum(0, 0)).toBe(0);
    expect(sum(5, 0)).toBe(5);
  });

  it('should handle decimal numbers', () => {
    expect(sum(0.1, 0.2)).toBeCloseTo(0.3);
  });
});

describe('sumArray', () => {
  it('should sum all numbers in an array', () => {
    expect(sumArray([1, 2, 3, 4, 5])).toBe(15);
  });

  it('should return 0 for empty array', () => {
    expect(sumArray([])).toBe(0);
  });

  it('should handle single element array', () => {
    expect(sumArray([10])).toBe(10);
  });

  it('should handle negative numbers', () => {
    expect(sumArray([-1, -2, -3])).toBe(-6);
  });
});