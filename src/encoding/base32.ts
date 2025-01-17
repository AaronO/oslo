import type { TypedArray } from "../index.js";
import type { Encoding } from "./index.js";

export class Base32Encoding implements Encoding {
	public alphabet: string;
	public padding: string;

	private decodeMap = new Map<string, number>();

	constructor(
		alphabet: string,
		options?: {
			padding?: string;
		}
	) {
		if (alphabet.length !== 32) {
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
		const chunkCount = Math.ceil(data.length / 5);
		for (let i = 0; i < chunkCount; i++) {
			let buffer1 = data[i * 5]! << 24;
			buffer1 += (data[i * 5 + 1] ?? 0) << 16;
			buffer1 += (data[i * 5 + 2] ?? 0) << 8;
			buffer1 += data[i * 5 + 3] ?? 0;
			for (let j = 0; j < 6; j++) {
				const key = (buffer1 >> (27 - 5 * j)) & 0x1f;
				result += this.alphabet[key];
			}
			const buffer2 = data[i * 5 + 4] ?? 0;
			let key = ((buffer1 & 0x03) << 3) + (buffer2 >> 5);
			result += this.alphabet[key];
			key = buffer2 & 0x1f;
			result += this.alphabet[key];
		}
		let padCount = 0;
		if (data.length % 5 !== 0) {
			padCount = 8 - Math.ceil(((data.length % 5) * 8) / 5);
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
		const chunkCount = Math.ceil(data.length / 8);
		const result: number[] = [];
		for (let i = 0; i < chunkCount; i++) {
			let padCount = 0;
			const chunks: number[] = [];
			for (let j = 0; j < 8; j++) {
				const encoded = data[i * 8 + j];
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
				chunks.push(value);
			}
			if (padCount === 8 || padCount === 7 || padCount === 5 || padCount === 2) {
				throw new Error("Invalid padding");
			}
			const byte1 = (chunks[0]! << 3) + (chunks[1]! >> 2);
			result.push(byte1);
			if (padCount < 6) {
				const byte2 = ((chunks[1]! & 0x03) << 6) + (chunks[2]! << 1) + (chunks[3]! >> 4);
				result.push(byte2);
			}
			if (padCount < 4) {
				const byte3 = ((chunks[3]! & 0xff) << 4) + (chunks[4]! >> 1);
				result.push(byte3);
			}
			if (padCount < 3) {
				const byte4 = ((chunks[4]! & 0x01) << 7) + (chunks[5]! << 2) + (chunks[6]! >> 3);
				result.push(byte4);
			}
			if (padCount < 1) {
				const byte5 = ((chunks[6]! & 0x07) << 5) + chunks[7]!;
				result.push(byte5);
			}
		}
		return Uint8Array.from(result);
	}
}

export const base32 = new Base32Encoding("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567");
export const base32hex = new Base32Encoding("0123456789ABCDEFGHIJKLMNOPQRSTUV");

/** @deprecated Use `base32.encode()` instead */
export function encodeBase32(
	data: ArrayBuffer | TypedArray,
	options?: {
		padding?: boolean;
	}
): string {
	return base32.encode(new Uint8Array(data), {
		includePadding: options?.padding ?? true
	});
}

/** @deprecated Use `base32.decode()` instead */
export function decodeBase32(data: string): Uint8Array {
	return base32.decode(data, {
		strict: false
	});
}
