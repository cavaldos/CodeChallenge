/**
 * Sample test to verify Jest configuration works
 */

describe('Jest Setup', () => {
  it('should pass basic test', () => {
    expect(true).toBe(true);
  });

  it('should handle math operations', () => {
    expect(2 + 2).toBe(4);
    expect(10 - 5).toBe(5);
    expect(3 * 4).toBe(12);
  });

  it('should work with strings', () => {
    const greeting = 'Hello, World!';
    expect(greeting).toContain('Hello');
    expect(greeting).toHaveLength(13);
  });

  it('should work with arrays', () => {
    const numbers = [1, 2, 3, 4, 5];
    expect(numbers).toHaveLength(5);
    expect(numbers).toContain(3);
    expect(numbers.filter(n => n > 3)).toEqual([4, 5]);
  });
});