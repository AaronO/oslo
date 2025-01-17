---
title: "encodeBase64()"
---

**Deprecated - Use [`base64`](/encoding/base64) instead.**

# `encodeBase64()`

Encodes data into base64 string. Use [`decodeBase64()`](/reference/encoding/decodeBase64) to decode base64 strings.

## Definition

```ts
function encodeBase64(
	data: ArrayBuffer | TypedArray,
	options?: {
		padding?: boolean;
	}
): string;
```

### Parameters

- `data`
- `options.padding` (default: `true`): Set to `false` to remove padding

## Example

```ts
import { encodeBase64 } from "oslo/encoding";

const data = new TextEncoder("hello, world");
const encoded = encodeBase64(data);
```
