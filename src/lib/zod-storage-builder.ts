import { z } from 'zod';
import { Stringifier, ZodStorage, ZodStorageItem } from './types';
import { JSONStringifier } from './json-stringifier';
import { ZodStorageError, ZodStorageErrors } from './ZodStorageError';

export class ZodStorageBuilder<T extends z.ZodRawShape> {

	private items?: ZodStorage<z.infer<z.ZodObject<T>>>;
	private keys?: Partial<Record<keyof T, string>> = undefined;
	private provider: Storage = localStorage;
	private stringifier: Stringifier = new JSONStringifier();
	private namespace: string = "";

	constructor(private storageSchema: z.ZodObject<T>) {}

	public withKeys(keys: Partial<Record<keyof T, string>>): ZodStorageBuilder<T> {
		this.keys = keys;
		return this;
	}

	public withProvider(provider: Storage): ZodStorageBuilder<T> {
		this.provider = provider;
		return this;
	}

	public withStringifier(stringifier: Stringifier): ZodStorageBuilder<T> {
		this.stringifier = stringifier;
		return this;
	}

	public withNamespace(namespace: string): ZodStorageBuilder<T> {
		const { success } = z.string().min(1)
			.safeParse(namespace);
		if (!success) {
			throw new ZodStorageError(ZodStorageErrors.invalidNamespace);
		}
		this.namespace = namespace;
		return this;
	}

	private configureItems() {
		const entries = Object.entries(this.storageSchema.shape);
		entries.flatMap(([shapeKey, itemSchema]) => {
			const key = this.namespace + (this.keys?.[shapeKey] ?? shapeKey);
			const item: ZodStorageItem<z.infer<typeof itemSchema>> = {
				get: () => {
					const value = this.provider.getItem(key);
					if (value === null) {
						return null;
					}
					try {
						if (itemSchema instanceof z.ZodDate) {
							const result = itemSchema.safeParse(new Date(this.stringifier.parse(value)));
							return result.success ? result.data : null;
						}
						const result = itemSchema.safeParse(this.stringifier.parse(value));
						return result.success ? result.data : null;
					} catch(e) {
						this.provider.removeItem(key);
						return null;
					}
				},
				set: (value: z.infer<typeof itemSchema>) => {
					itemSchema.parse(value);
					this.provider.setItem(key, this.stringifier.stringify(value));
				},
				remove: () => {
					this.provider.removeItem(key);
				}
			};
			if (!this.items) {
				this.items = {} as ZodStorage<z.infer<z.ZodObject<T>>>;
			}
			this.items = {
				...this.items,
				[shapeKey]: item
			};
		});
	}

	private clear() {
		if (!this.items) {
			return;
		}
		Object.keys(this.items).forEach((key) => {
			this.items?.[key].remove();
		});
	}

	public build(): ZodStorage<z.infer<z.ZodObject<T>>> {
		this.configureItems();
		if (!this.items) {
			throw new ZodStorageError(ZodStorageErrors.builderNotInitialized);
		}
		return Object.freeze({
			...this.items,
			clear: this.clear.bind(this)
		});
	}

}
