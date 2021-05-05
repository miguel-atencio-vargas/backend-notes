
const palindrome = require('../utils/for_testing').palindrome;

describe.skip('Palindrome', () => {
  test('of a', () => {
    const result = palindrome('a');
    expect(result).toBe('a');
  });

  test('of react', () => {
    const result = palindrome('react');
    expect(result).toBe('tcaer');
  });

  test('of releveler', () => {
    const result = palindrome('releveler');
    expect(result).toBe('releveler');
  });
});
