<!--
  PostDisableScroll
  Prevents background document scrolling when a modal or overlay is open.
  Locks document body overflow smoothly without jitter.
-->
<template>
	<slot />
</template>

<script setup lang="ts">
	onMounted(() => {
		if (import.meta.server) return
		document.body.style.overflow = 'hidden'
	})

	onBeforeUnmount(() => {
		if (import.meta.server) return
		document.body.style.overflow = ''
	})
</script>
