import { z } from 'zod';
import { Stringifier, ZodStorage, ZodStorageItem } from './types';
import { JSONStringifier } from './json-stringifier';

export class ZodStorageBuilder<T extends z.ZodRawShape> {
	private _items?: ZodStorage<z.infer<z.ZodObject<T>>>;
	constructor(storageSchema: z.ZodObject<T>,
				keys?: Partial<Record<keyof T, string>>,
				private provider: Storage = localStorage,
				stringifier: Stringifier = new JSONStringifier()) {
		const entries = Object.entries(storageSchema.shape);
		entries.flatMap(([shapeKey, itemSchema]) => {
			const key = keys?.[shapeKey] ?? shapeKey;
			const item: ZodStorageItem<z.infer<typeof itemSchema>> = {
				get: () => {
					const value = this.provider.getItem(key);
					if (value === null) {
						return null;
					}
					try {
						if (itemSchema instanceof z.ZodDate) {
							const result = itemSchema.safeParse(new Date(stringifier.parse(value)));
							return result.success ? result.data : null;
						}
						const result = itemSchema.safeParse(stringifier.parse(value));
						return result.success ? result.data : null;
					} catch(e) {
						this.provider.removeItem(key);
						return null;
					}
				},
				set: (value: z.infer<typeof itemSchema>) => {
					this.provider.setItem(key, stringifier.stringify(value));
				},
				remove: () => {
					this.provider.removeItem(key);
				}
			};
			if (!this._items) {
				this._items = {} as ZodStorage<z.infer<z.ZodObject<T>>>;
			}
			this._items = {
				...this._items,
				[shapeKey]: item
			};
		});
	}

	private _clear() {
		if (!this._items) {
			return;
		}
		Object.keys(this._items).forEach((key) => {
			this._items?.[key].remove();
		});
	}

	build(): ZodStorage<z.infer<z.ZodObject<T>>> {
		if (!this._items) {
			throw new Error('ZodStorageBuilder not initialized');
		}
		return Object.freeze({
			...this._items,
			clear: this._clear.bind(this)
		});
	}
}
