<template>
	<img class="img" :src="`assets/images/${name}`" :alt="alt">
</template>
<script setup>
defineProps({
	name: String,
	alt: {
		type: String,
		default: null
	}
})
</script>

<style scoped lang="stylus">
.img
	max-width: 100%
	height: auto
	display: block
	margin: 0 auto
	border-radius var(--radius)
</style>