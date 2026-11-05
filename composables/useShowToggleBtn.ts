/**
 * Composable for controlling whether the mobile hamburger/menu toggle button
 * should be rendered in the top navigation bar (enabled in advanced layout with sidebar).
 */
export default () => {
	// Global reactive state determining if the mobile menu button is shown
	const data = useState<boolean>('showToggleBtn', () => false)

	// Explicit setter for menu button visibility
	const set = (val: boolean) => {
		data.value = val
	}

	return {
		showToggleBtn: data,
		setShowToggleBtn: set
	}
}
