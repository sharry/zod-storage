import { Stringifier } from './types';

export class JSONStringifier implements Stringifier {
	stringify<T>(value: T): string {
		return JSON.stringify(value);
	}

	parse<T>(value: string): T {
		return JSON.parse(value);
	}
}
