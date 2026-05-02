/**
 * Sum utility function
 */

export function sum(a: number, b: number): number {
  return a + b;
}

export function sumArray(numbers: number[]): number {
  return numbers.reduce((acc, num) => acc + num, 0);
}