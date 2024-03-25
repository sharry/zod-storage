export interface Stringifier {
	stringify<T>(value: T): string;
	parse<T>(value: string): T;
}

export type ZodStorageItem<T> = Readonly<{
  get(): T | null;
  set(value: T): void;
  remove(): void;
}>;

export type ZodStorage<T> = Readonly<{
  [P in keyof T]: ZodStorageItem<T[P]>;
}> & Readonly<{
  clear(): void;
}>;
