/**
 * utils/aes_gcm.ts
 * Client and server shared Web Crypto AES-GCM encryption/decryption utilities:
 * - Derives 256-bit AES-GCM keys via SHA-256 hash
 * - Uses 12-byte initialization vectors (IV) prefixed to ciphertext
 */

/**
 * Derives a 256-bit key from the provided key string using SHA-256.
 */
async function deriveKey(key: string) {
	const encodedKey = new TextEncoder().encode(key)
	const hash = await globalThis.crypto.subtle.digest('SHA-256', encodedKey)
	return globalThis.crypto.subtle.importKey('raw', hash, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
}

/**
 * Decrypts text using AES-GCM algorithm via Web Crypto API.
 * @param encryptedText Base64 encoded string containing 12-byte IV + ciphertext
 * @param key Plaintext passphrase
 * @returns Decrypted UTF-8 string
 */
export async function aesDecrypt(encryptedText: string, key: string): Promise<string> {
	if (!encryptedText || typeof encryptedText !== 'string') throw new Error('[encryptedText] must be a non-empty string.')
	if (!key || typeof key !== 'string') throw new Error('[key] must be a non-empty string.')

	const derivedKey = await deriveKey(key)
	const buffer = new Uint8Array(
		atob(encryptedText)
			.split('')
			.map(char => char.charCodeAt(0))
	)
	const iv = buffer.slice(0, 12)
	const encryptedData = buffer.slice(12)

	const decrypted = await globalThis.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, derivedKey, encryptedData)
	return new TextDecoder().decode(decrypted)
}
