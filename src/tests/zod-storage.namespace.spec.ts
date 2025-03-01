import { z } from 'zod';
import { ZodStorageBuilder } from '../lib/zod-storage-builder';

describe('ZodStorage instance with namespace', () => {

	beforeEach(() => {
		localStorage.clear();
	});

	it('should remove item', () => {
		const customSchema = z.object({
			name: z.string()
		});
		const customZodStorage = new ZodStorageBuilder(customSchema)
		.withNamespace("k1_")
		.build();
		customZodStorage.name.set('John');
		customZodStorage.name.remove();
		expect(customZodStorage.name.get()).toBeNull();
		expect(localStorage.getItem('k1_name')).toBeNull();
	});

	it('should include the namespace in addition to custom keys', () => {
		const customSchema = z.object({
			name: z.string()
		});
		const customZodStorage = new ZodStorageBuilder(customSchema)
		.withNamespace("k1_")
		.withKeys({
			name: 'CUSTOM_KEY_FOR_NAME',
		})
		.build();
		customZodStorage.name.set('John');
		expect(customZodStorage.name.get()).toBe('John');
		expect(localStorage.getItem('k1_CUSTOM_KEY_FOR_NAME'))
			.toBe(JSON.stringify('John'));
	});

	it('should prefix the key with the namespace when supplied', () => {
		const schema = z.object({
			name: z.string()
		});
		const storage = new ZodStorageBuilder(schema)
		.withNamespace("app_")
		.build();
		storage.name.set('John');
		expect(storage.name.get()).toBe('John');
		expect(localStorage.getItem('app_name'))
			.toBe(JSON.stringify('John'));
		expect(localStorage.getItem('name'))
			.toBe(null);
	});

	it('should not interfere when multiple instances', () => {
		const schema = z.object({
			name: z.string()
		});
		const storage1 = new ZodStorageBuilder(schema)
		.withNamespace("n1_")
		.build();
		const storage2 = new ZodStorageBuilder(schema)
		.withNamespace("n2_")
		.build();
		storage1.name.set('John');
		storage2.name.set('Bob');
		expect(storage1.name.get()).toBe('John');
		expect(storage2.name.get()).toBe('Bob');
		expect(localStorage.getItem('n1_name'))
			.toBe(JSON.stringify('John'));
		expect(localStorage.getItem('n2_name'))
			.toBe(JSON.stringify('Bob'));
	});

});
