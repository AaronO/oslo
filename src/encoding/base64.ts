import type { TypedArray } from "../index.js";
import type { Encoding } from "./index.js";

export class Base64Encoding implements Encoding {
	public alphabet: string;
	public padding: string;

	private decodeMap = new Map<string, number>();

	constructor(
		alphabet: string,
		options?: {
			padding?: string;
		}
	) {
		if (alphabet.length !== 64) {
			throw new Error("Invalid alphabet");
		}
		this.alphabet = alphabet;
		this.padding = options?.padding ?? "=";
		if (this.alphabet.includes(this.padding) || this.padding.length !== 1) {
			throw new Error("Invalid padding");
		}
		for (let i = 0; i < alphabet.length; i++) {
			this.decodeMap.set(alphabet[i]!, i);
		}
	}

	public encode(
		data: Uint8Array,
		options?: {
			includePadding?: boolean;
		}
	): string {
		let result = "";
		const chunkCount = Math.ceil(data.length / 3);
		for (let i = 0; i < chunkCount; i++) {
			let buffer = data[i * 3]! << 16;
			buffer += (data[i * 3 + 1] ?? 0) << 8;
			buffer += data[i * 3 + 2] ?? 0;
			for (let j = 0; j < 4; j++) {
				const key = (buffer >> ((3 - j) * 6)) & 0x3f;
				result += this.alphabet[key];
			}
		}
		let padCount = 0;
		if (data.length % 3 !== 0) {
			padCount = 4 - Math.ceil(((data.length % 3) * 4) / 3);
		}
		result = result.slice(0, result.length - padCount);
		const includePadding = options?.includePadding ?? true;
		if (includePadding) {
			for (let i = 0; i < padCount; i++) {
				result += "=";
			}
		}
		return result;
	}

	public decode(
		data: string,
		options?: {
			strict?: boolean;
		}
	): Uint8Array {
		const strict = options?.strict ?? true;
		const chunkCount = Math.ceil(data.length / 4);
		const result: number[] = [];
		for (let i = 0; i < chunkCount; i++) {
			let padCount = 0;
			let buffer = 0;
			for (let j = 0; j < 4; j++) {
				const encoded = data[i * 4 + j];
				if (encoded === "=") {
					if (i + 1 !== chunkCount) {
						throw new Error(`Invalid character: ${encoded}`);
					}
					padCount += 1;
					continue;
				}
				if (encoded === undefined) {
					if (strict) {
						throw new Error("Invalid data");
					}
					padCount += 1;
					continue;
				}
				const value = this.decodeMap.get(encoded) ?? null;
				if (value === null) {
					throw new Error(`Invalid character: ${encoded}`);
				}
				buffer += value << (6 * (3 - j));
			}
			result.push((buffer >> 16) & 0xff);
			if (padCount < 2) {
				result.push((buffer >> 8) & 0xff);
			}
			if (padCount < 1) {
				result.push(buffer & 0xff);
			}
		}
		return Uint8Array.from(result);
	}
}

export const base64 = new Base64Encoding(
	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
);

export const base64url = new Base64Encoding(
	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
);

/** @deprecated Use `base64.encode()` instead */
export function encodeBase64(
	data: ArrayBuffer | TypedArray,
	options?: {
		padding?: boolean;
	}
): string {
	return base64.encode(new Uint8Array(data), {
		includePadding: options?.padding ?? true
	});
}

/** @deprecated Use `base64.decode()` instead */
export function decodeBase64(data: string): Uint8Array {
	return base64.decode(data, {
		strict: false
	});
}

/** @deprecated Use `base64url.encode()` instead */
export function encodeBase64url(data: ArrayBuffer | TypedArray): string {
	return base64.encode(new Uint8Array(data), {
		includePadding: false
	});
}

/** @deprecated Use `base64url.decode()` instead */
export function decodeBase64url(data: string): Uint8Array {
	return base64url.decode(data, {
		strict: false
	});
}
