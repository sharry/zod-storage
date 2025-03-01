import { z } from 'zod';
import { ZodStorageBuilder } from '../lib/zod-storage-builder';
import { ZodStorageErrors } from '../lib/ZodStorageError';

describe('ZodStorageBuilder using namespaces', () => {

	it('should accept a namespace', () => {
		// Arrange
		const schema = z.object({
			name: z.string()
		});
		// Act
		const builder = new ZodStorageBuilder(schema)
			.withNamespace('app_');
		// Assert
		expect(builder).toBeDefined();
	});

	it('should throw an error if the namespace is not a string', () => {
		// Arrange
		const schema = z.object({
			name: z.string()
		});
		// Act & Assert
		expect(() => {
            new ZodStorageBuilder(schema)
				.withNamespace(12 as unknown as string);
        }).toThrow(ZodStorageErrors.invalidNamespace);
	});

	it('should throw an error if the namespace is an empty string', () => {
		// Arrange
		const schema = z.object({
			name: z.string()
		});
		// Act & Assert
		expect(() => {
            new ZodStorageBuilder(schema)
				.withNamespace("");
        }).toThrow(ZodStorageErrors.invalidNamespace);
	});

});
