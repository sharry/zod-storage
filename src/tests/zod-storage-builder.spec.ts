import { z } from 'zod';
import { ZodStorageBuilder } from '../lib/zod-storage-builder';
import { JSONStringifier } from '../lib/json-stringifier';
import { ZodStorageErrors } from '../lib/ZodStorageError';

describe('ZodStorageBuilder', () => {

	it('should accept a zod object', () => {
		// Arrange
		const schema = z.object({});
		// Act
		const builder = new ZodStorageBuilder(schema);
		// Assert
		expect(builder).toBeDefined();
	});

	it('should accept a zod object and a provider', () => {
		// Arrange
		const schema = z.object({
			name: z.string()
		});
		// Act
		const builder = new ZodStorageBuilder(schema);
		builder.withProvider(localStorage);
		// Assert
		expect(builder).toBeDefined();
	});

	it('should accept a zod object, keys and a provider', () => {
		// Arrange
		const schema = z.object({
			name: z.string()
		});
		// Act
		const builder = new ZodStorageBuilder(schema)
			.withKeys({
				name: 'NAME_KEY'
			})
			.withProvider(localStorage);
		// Assert
		expect(builder).toBeDefined();
	});

	it('should accept a zod object, keys, provider and a stringifier', () => {
		// Arrange
		const schema = z.object({
			name: z.string()
		});
		// Act
		const builder = new ZodStorageBuilder(schema)
			.withKeys({
				name: 'NAME_KEY'
			})
			.withProvider(localStorage)
			.withStringifier(new JSONStringifier());
		// Assert
		expect(builder).toBeDefined();
	});

	it('should not build a ZodStorage if not initialized', () => {
		// Arrange
		const schema = z.object({});
		const builder = new ZodStorageBuilder(schema);
		// Act & Assert
		expect(() => builder.build())
			.toThrow(ZodStorageErrors.builderNotInitialized);
	});

	it('should build a ZodStorage with the correct shape', () => {
		// Arrange
		const schema = z.object({
			name: z.string(),
			age: z.number(),
			isActive: z.boolean(),
			createdAt: z.date(),
			theme: z.enum(['light', 'dark']),
			profile: z.object({
				avatar: z.string()
			}),
			tags: z.array(z.string()),
		});
		const builder = new ZodStorageBuilder(schema);
		// Act
		const storage = builder.build();
		// Assert
		expect(storage).toBeDefined();
		expect(storage.name).toBeDefined();
		expect(storage.age).toBeDefined();
		expect(storage.isActive).toBeDefined();
		expect(storage.createdAt).toBeDefined();
		expect(storage.theme).toBeDefined();
		expect(storage.profile).toBeDefined();
		expect(storage.tags).toBeDefined();
		expect(storage.clear).toBeDefined();
	});

});
