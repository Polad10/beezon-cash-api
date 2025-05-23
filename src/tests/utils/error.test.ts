import { describe, it, expect } from 'vitest';
import { getErrorData } from '../../utils/error';

describe('getErrorData tests', () => {
    it('should return error data', () => {
        const error = new Error('Test error');
        const errorData = {
            name: 'Error',
            message: 'Test error',
            cause: undefined,
            stack: expect.any(String),
        };

        expect(getErrorData(error)).toEqual(errorData);
    });
});