export enum ZodStorageErrors {
	builderNotInitialized = "ZodStorageBuilder not initialized",
	invalidNamespace = "Namespace must be a string with at least one character",
};

export class ZodStorageError extends Error {
	constructor(message: ZodStorageErrors) {
		super(message);
	}
}
