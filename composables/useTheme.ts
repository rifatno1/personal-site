/**
 * Theme management composable providing 3-way toggle:
 * - 'auto': Respects system/OS prefers-color-scheme
 * - 'light': Forces light theme
 * - 'dark': Forces dark theme
 *
 * Persists user preference in localStorage and handles system dark mode changes.
 */

export type ThemeMode = 'auto' | 'light' | 'dark'

export function useTheme() {
	// The current selected theme mode ('auto' | 'light' | 'dark')
	const theme = useState<ThemeMode>('app-theme-mode', () => 'auto')
	// Whether the effective appearance is currently dark mode
	const isDark = useState<boolean>('app-theme-is-dark', () => false)

	/**
	 * Applies the CSS 'dark' class on the HTML document element based on the target theme.
	 */
	function applyTheme(targetTheme: ThemeMode) {
		if (import.meta.server) return

		let dark = false
		if (targetTheme === 'dark') {
			dark = true
		} else if (targetTheme === 'light') {
			dark = false
		} else {
			dark = globalThis.window.matchMedia('(prefers-color-scheme: dark)').matches
		}

		isDark.value = dark
		if (dark) {
			globalThis.document.documentElement.classList.add('dark')
		} else {
			globalThis.document.documentElement.classList.remove('dark')
		}
	}

	/**
	 * Sets and persists a new theme preference.
	 */
	function setTheme(newTheme: ThemeMode) {
		theme.value = newTheme
		if (import.meta.client) {
			try {
				localStorage.setItem('theme', newTheme)
			} catch (e) {}
			applyTheme(newTheme)
		}
	}

	/**
	 * Cycles between themes: auto -> light -> dark -> auto.
	 */
	function toggleTheme() {
		if (theme.value === 'auto') setTheme('light')
		else if (theme.value === 'light') setTheme('dark')
		else setTheme('auto')
	}

	/**
	 * Initializes the theme from localStorage and subscribes to OS media query changes.
	 */
	function initTheme() {
		if (import.meta.server) return

		try {
			const saved = localStorage.getItem('theme') as ThemeMode | null
			if (saved === 'light' || saved === 'dark' || saved === 'auto') {
				theme.value = saved
			}
		} catch (e) {}

		applyTheme(theme.value)

		const mediaQuery = globalThis.window.matchMedia('(prefers-color-scheme: dark)')
		const handler = () => {
			if (theme.value === 'auto') {
				applyTheme('auto')
			}
		}

		mediaQuery.addEventListener?.('change', handler)
	}

	return {
		theme,
		isDark,
		setTheme,
		toggleTheme,
		initTheme
	}
}
