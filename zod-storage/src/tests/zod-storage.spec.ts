import { z } from 'zod';
import { ZodStorageBuilder } from '../lib/zod-storage-builder';

const fakeDate = new Date("2021-01-01T00:00:00.000Z");
const schema = z.object({
	name: z.string(),
	age: z.number(),
	isActive: z.boolean(),
	createdAt: z.date(),
	theme: z.enum(['light', 'dark']),
	profile: z.object({
		avatar: z.string(),
		address: z.object({
			line1: z.string(),
		}),
	}),
	tags: z.array(z.string()),
});

const zodStorage = new ZodStorageBuilder(schema).build();
type Schema = z.infer<typeof schema>;
describe('ZodStorage instance', () => {

	beforeEach(() => {
		localStorage.clear();
	});

	it.each<[(keyof Schema), Schema[keyof Schema]]>([
		['name', 'John'],
		['age', 30],
		['isActive', true],
		['createdAt', fakeDate],
		['theme', 'light'],
		['profile', { avatar: 'avatar.jpg', address: { line1: '123 Main St' } }],
		['tags', ['tag1', 'tag2']],
	])('should set a value of "%s" and get it back', (key, val) => {
		zodStorage[key].set(val as never);
		const value = zodStorage[key].get();
		expect(value).toEqual(val);
	});

	it.each<[(keyof Schema), Schema[keyof Schema]]>([
		['name', 'John'],
		['age', 30],
		['isActive', true],
		['createdAt', fakeDate],
		['theme', 'light'],
		['profile', { avatar: 'avatar.jpg', address: { line1: '123 Main St' } }],
		['tags', ['tag1', 'tag2']],
	])('should have set a value of "%s" to localStorage as string', (key, val) => {
		zodStorage[key].set(val as never);
		const item = localStorage.getItem(key);
		if(item === null) {
			throw new Error('Item not found');
		}
		expect(JSON.stringify(val)).toEqual(item);
	});

	it.each<[(keyof Schema), Schema[keyof Schema]]>([
		['name', 'John'],
		['age', 30],
		['isActive', true],
		['createdAt', fakeDate],
		['theme', 'light'],
		['profile', { avatar: 'avatar.jpg', address: { line1: '123 Main St' } }],
		['tags', ['tag1', 'tag2']],
	])(`should remove the value of "%s"`, (key, val) => {
		zodStorage[key].set(val as never);
		zodStorage[key].remove();
		const item = localStorage.getItem(key);
		expect(item).toBeNull();
		expect(zodStorage[key].get()).toBeNull();
	});

	it.each<[(keyof Schema), Schema[keyof Schema]]>([
		['name', false],
		['age', false],
		['isActive', "false"],
		['createdAt', false],
		['theme', false],
		['profile', false],
		['tags', false],
	])(`should throw if trying to set an invalid %s`, (key, val) => {
		expect(() => zodStorage.theme.set(val as never)).toThrow();
	});

	it('should clear all items', () => {
		zodStorage.name.set('John');
		zodStorage.age.set(30);
		zodStorage.isActive.set(true);
		zodStorage.createdAt.set(fakeDate);
		zodStorage.theme.set('light');
		zodStorage.profile.set({ avatar: 'avatar.jpg', address: { line1: '123 Main St' } });
		zodStorage.tags.set(['tag1', 'tag2']);
		zodStorage.clear();
		expect(zodStorage.name.get()).toBeNull();
		expect(zodStorage.age.get()).toBeNull();
		expect(zodStorage.isActive.get()).toBeNull();
		expect(zodStorage.createdAt.get()).toBeNull();
		expect(zodStorage.theme.get()).toBeNull();
		expect(zodStorage.profile.get()).toBeNull();
		expect(zodStorage.tags.get()).toBeNull();
	});

	it('should not clear items that are not in the schema', () => {
		localStorage.setItem('extra', 'extra');
		zodStorage.clear();
		expect(localStorage.getItem('extra')).toBe('extra');
	});

	it('should remove item if it fails to parse', () => {
		localStorage.setItem('isActive', 'invalid');
		expect(zodStorage.isActive.get()).toBeNull();
		expect(localStorage.getItem('isActive')).toBeNull();
	});

	it('with custom keys should set and get values', () => {
		const customSchema = z.object({
			name: z.string()
		});
		const customZodStorage = new ZodStorageBuilder(customSchema)
			.withKeys({
				name: 'CUSTOM_KEY_FOR_NAME',
			})
			.build();
		customZodStorage.name.set('John');
		expect(customZodStorage.name.get()).toBe('John');
		expect(localStorage.getItem('CUSTOM_KEY_FOR_NAME')).toBe(JSON.stringify('John'));
	});

	it('with custom keys should remove item', () => {
		const customSchema = z.object({
			name: z.string()
		});
		const customZodStorage = new ZodStorageBuilder(customSchema)
			.withKeys({
				name: 'CUSTOM_KEY_FOR_NAME',
			})
			.build();
		customZodStorage.name.set('John');
		customZodStorage.name.remove();
		expect(customZodStorage.name.get()).toBeNull();
		expect(localStorage.getItem('CUSTOM_KEY_FOR_NAME')).toBeNull();
	});

	it('with custom keys should clear all items', () => {
		const customSchema = z.object({
			name: z.string()
		});
		const customZodStorage = new ZodStorageBuilder(customSchema)
			.withKeys({
				name: 'CUSTOM_KEY_FOR_NAME',
			})
			.build();
		customZodStorage.name.set('John');
		customZodStorage.clear();
		expect(customZodStorage.name.get()).toBeNull();
		expect(localStorage.getItem('CUSTOM_KEY_FOR_NAME')).toBeNull();
	});

	it("should remove a value if tampered with", () => {
		const schema = z.object({
			num: z.number().max(5)
		});
		const zodStorage = new ZodStorageBuilder(schema).build();
		localStorage.setItem('num', '6');
		expect(zodStorage.num.get()).toBe(null);
	});

	it("should remove a date value if tampered with", () => {
		const schema = z.object({
			date: z.date()
		});
		const zodStorage = new ZodStorageBuilder(schema).build();
		localStorage.setItem('date', 'invalid');
		expect(zodStorage.date.get()).toBe(null);
	});

});
