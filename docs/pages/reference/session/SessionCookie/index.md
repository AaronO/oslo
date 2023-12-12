---
title: "SessionCookie"
---

# `SessionCookie`

Represents a session cookie.

## Constructor

```ts
//$ CookieAttributes=/reference/cookie/CookieAttributes
function constructor(name: string, value: string, attributes?: $$CookieAttributes): this;
```

### Parameters

- `name`: Cookie name
- `value`: Session id
- `attributes`: Cookie attributes

## Methods

- [`serialize()`](/reference/session/SessionCookie)

## Properties

```ts
//$ CookieAttributes=/reference/cookie/CookieAttributes
interface Properties {
	name: string;
	value: string;
	attributes: $$CookieAttributes;
}
```

- `name`: Cookie name
- `value`: Session id
- `attributes`: Cookie attributes

## Example

```ts
import { SessionCookie } from "oslo/session";

const cookieName = "session";
const sessionCookie = new SessionCookie(cookieName, sessionId, {
	maxAge: 60 * 60 * 24 // 1 day
});
response.headers.set("Set-Cookie", sessionCookie.serialize());
```

If your framework provides an API for setting cookies:

```ts
import { SessionCookie } from "oslo/session";

const sessionCookie = new SessionCookie(cookieName, sessionId);

setCookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
```