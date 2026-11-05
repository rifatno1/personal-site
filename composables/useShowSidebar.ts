/**
 * Composable for managing sidebar drawer open/close visibility state.
 * Shared across the Navigation Toggle button, the Backdrop, and the Sidebar container.
 */
export default () => {
	// Global reactive state for sidebar drawer visibility (particularly for screens <= 800px)
	const data = useState<boolean>('showSideBar', () => false)

	// Toggles the sidebar visibility
	const toggle = () => {
		data.value = !data.value
	}

	return {
		showSidebar: data,
		toggleShowSidebar: toggle
	}
}
