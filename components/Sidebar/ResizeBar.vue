<!--
  SidebarResizeBar.vue
  Drag-handle divider allowing users to smoothly resize the sidebar width.
  Supports both mouse and touch events with clamped min/max boundaries (220px to 480px).
-->
<template>
	<div
		class="h-full w-2 -ml-1 cursor-col-resize flex items-center justify-center hover:bg-indigo-500/20 active:bg-indigo-500/30 transition-colors shrink-0 group select-none z-10"
		@mousedown.prevent="resizeStart"
		@touchstart.prevent="resizeStartTouch"
		title="Drag to resize sidebar"
		role="separator"
		aria-orientation="vertical"
	>
		<div class="w-0.5 h-8 rounded-full bg-zinc-300 dark:bg-zinc-700 group-hover:bg-indigo-500 transition-colors"></div>
	</div>
</template>

<script setup lang="ts">
	const { setNewWidth } = defineProps<{ setNewWidth: (v: string) => string }>()

	/**
	 * Restricts width between 220px and 480px to preserve responsive layout balance.
	 */
	function clampWidth(w: number) {
		const clamped = Math.max(220, Math.min(w, 480))
		return `${clamped}px`
	}

	function resizeStart() {
		globalThis.document.body.style.cursor = 'col-resize'
		globalThis.document.body.style.userSelect = 'none'
		globalThis.window.addEventListener('mousemove', resize)
		globalThis.window.addEventListener('mouseup', resizeEnd, { once: true })
	}

	function resizeEnd() {
		globalThis.document.body.style.cursor = ''
		globalThis.document.body.style.userSelect = ''
		globalThis.window.removeEventListener('mousemove', resize)
		globalThis.window.removeEventListener('mouseup', resizeEnd)
	}

	function resize(ev: MouseEvent) {
		setNewWidth(clampWidth(ev.clientX))
	}

	function resizeStartTouch() {
		globalThis.document.body.style.cursor = 'col-resize'
		globalThis.document.body.style.userSelect = 'none'
		globalThis.window.addEventListener('touchmove', resizeTouch)
		globalThis.window.addEventListener('touchend', resizeEndTouch, { once: true })
	}

	function resizeEndTouch() {
		globalThis.document.body.style.cursor = ''
		globalThis.document.body.style.userSelect = ''
		globalThis.window.removeEventListener('touchmove', resizeTouch)
		globalThis.window.removeEventListener('touchend', resizeEndTouch)
	}

	function resizeTouch(ev: TouchEvent) {
		if (!ev.touches.length) return
		const touch = ev.touches[0]
		setNewWidth(clampWidth(touch.clientX))
	}

	onBeforeUnmount(() => {
		resizeEnd()
		resizeEndTouch()
	})
</script>
