# ZodStorage
Runtime validation and intellisense for localStorage and sessionStorage with Zod

## Get Started

```bash
npm install zod-storage
```

```typescript
import { ZodStorageBuilder } from 'zod-storage';
import { z } from 'zod';

// define your localStorage schema with Zod
const schema = z.object({
	theme: z.enum(['light', 'dark']),
	age: z.number().min(18),
	name: z.string()
});

// use the builder to create a storage object
const storage = new ZodStorageBuilder(schema).build();

// Enjoy the intellisense and runtime validation
storage.theme.set('light');
storage.theme.set('sepia'); // Argument of type '"sepia"' is not assignable to parameter of type '"light" | "dark"'

const age = storage.age.get(); // age is number
storage.age.set(19); // throws zod error
```

## Features
- Intellisense for keys
- Runtime validation
- Type inference
- No need to parse or stringify data

## Custom keys
By default, the builder uses the key in the schema object in the storage as well. You can override this using the `withKeys` method.

```typescript
import { ZodStorageBuilder } from 'zod-storage';
import { z } from 'zod';

const schema = z.object({
    theme: z.enum(['light', 'dark']),
    name: z.string()
});

const storage = new ZodStorageBuilder(schema)
    .withKeys({
        theme: 'my_custom_key',
    }).build();
```
## Storage Types

The builder support any storage type that implements the `Storage` interface. By default, it uses `localStorage`, you can set it using the `withProvider` method.

```typescript
import { ZodStorageBuilder } from 'zod-storage';

const storage = new ZodStorageBuilder(schema)
    .withProvider(sessionStorage)
    .build();
```

## Stringifier

By default, the builder uses `JSON.stringify` and `JSON.parse` to store and retrieve data. You can override this using the `withStringifier` method, by passing a custom stringifier, which implements the `Stringifier` interface.

```typescript
import { ZodStorageBuilder, Stringifier } from 'zod-storage';

class MyCustomStringifier implements Stringifier {
	// implement the interface
}

const storage = new ZodStorageBuilder(schema)
    .withStringifier(new MyCustomStringifier())
    .build();
```
