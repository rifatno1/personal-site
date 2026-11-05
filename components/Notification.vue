<!--
  Notification.vue
  Global transition toast container anchored at the bottom-right viewport.
  Smoothly renders entry/exit animations for success and error alerts.
-->
<template>
	<div class="fixed right-4 sm:right-6 bottom-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
		<TransitionGroup name="toast">
			<div
				v-for="each in arr"
				:key="each.key"
				class="pointer-events-auto flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl shadow-xl border backdrop-blur-xl transition-all duration-300"
				:class="
					each.isError
						? 'bg-rose-50/95 dark:bg-rose-950/90 border-rose-200 dark:border-rose-900/60 text-rose-950 dark:text-rose-100 shadow-rose-500/10'
						: 'bg-white/95 dark:bg-zinc-900/95 border-zinc-200/90 dark:border-zinc-800/90 text-zinc-900 dark:text-zinc-100 shadow-black/10'
				"
			>
				<!-- Icon -->
				<div class="shrink-0 mt-0.5">
					<span
						v-if="each.isError"
						class="flex items-center justify-center w-5 h-5 rounded-full bg-rose-500 text-white text-xs font-bold"
					>
						!
					</span>
					<span
						v-else
						class="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white text-xs font-bold"
					>
						✓
					</span>
				</div>

				<div class="flex-1 min-w-0">
					<p class="text-xs sm:text-sm font-medium leading-relaxed">{{ each.message }}</p>
				</div>

				<button
					type="button"
					@click="() => remove(each)"
					class="shrink-0 p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
					aria-label="Dismiss notification"
				>
					<IconClose class="w-3.5 h-3.5" />
				</button>
			</div>
		</TransitionGroup>
	</div>
</template>

<style scoped>
	.toast-enter-active,
	.toast-leave-active {
		transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
	}
	.toast-enter-from {
		opacity: 0;
		transform: translateY(16px) scale(0.95);
	}
	.toast-leave-to {
		opacity: 0;
		transform: translateX(20px) scale(0.9);
	}
</style>

<script setup lang="ts">
	// Reactive array of notifications from global state
	const arr = getNoti()

	// Dismisses a single notification and clears its timeout
	function remove(each: EachNotificationType) {
		const ind = arr.value.findIndex(el => el.key === each.key)
		if (ind === -1) return
		clearTimeout(each.timeoutID)
		arr.value.splice(ind, 1)
	}
</script>
