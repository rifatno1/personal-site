/**
 * Authentication composable for client-side and SSR authorization checks.
 * Manages the reactive admin state and provides login/logout synchronization.
 */
export function useAuth() {
	// Shared reactive state for current user's administrator status
	const isAdmin = useState<boolean>('app-is-admin', () => false)
	const router = useRouter()

	/**
	 * Validates current authentication state by verifying the encrypted TokenP cookie
	 * against the public key using Web Crypto AES-GCM.
	 * @returns Promise<boolean> true if authenticated as admin, false otherwise
	 */
	async function checkAuth(): Promise<boolean> {
		const tokenP = useCookie('TokenP').value
		const tokenS = useCookie('TokenS').value
		const stay = useCookie('Stay').value

		if (!tokenP || !tokenS || (stay !== 'Yes' && stay !== 'No')) {
			isAdmin.value = false
			return false
		}

		try {
			const config = useRuntimeConfig()
			const key = config.public?.publicKey || (import.meta as any).env?.VITE_PublicKey
			if (!key) {
				isAdmin.value = false
				return false
			}

			const msg = await aesDecrypt(tokenP, key)
			const valid = msg === 'Personal_Site'
			isAdmin.value = valid
			return valid
		} catch (e) {
			isAdmin.value = false
			return false
		}
	}

	/**
	 * Logs out the current user by destroying cookies, resetting reactive state,
	 * displaying a feedback toast, and navigating back to the sign-in page.
	 */
	function logout() {
		const tokenP = useCookie('TokenP')
		const tokenS = useCookie('TokenS')
		const stay = useCookie('Stay')

		tokenP.value = null
		tokenS.value = null
		stay.value = null

		if (import.meta.client) {
			globalThis.document.cookie = 'TokenP=; Max-Age=0; path=/;'
			globalThis.document.cookie = 'TokenS=; Max-Age=0; path=/;'
			globalThis.document.cookie = 'Stay=; Max-Age=0; path=/;'
		}

		isAdmin.value = false
		setNoti('Logged out successfully')
		router.push('/login')
	}

	return {
		isAdmin,
		checkAuth,
		logout
	}
}
