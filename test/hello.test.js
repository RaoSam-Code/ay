const assert = require('assert');

describe('Sample Test Suite', () => {
    it('should return true for true', () => {
        assert.strictEqual(true, true);
    });

    it('should add two numbers correctly', () => {
        assert.strictEqual(1 + 1, 2);
    });
});