<template>
	<div></div>
	<div class="color-box" :style="{
	backgroundColor: `var(--color-${color})`
}">
		<div class="color-box__text">
			<slot/>
		</div>
	</div>
</template>

<script setup>
defineProps({
	color: String
})
</script>

<style scoped lang="stylus">
.color-box
	width 4rem
	height 4rem
	display inline-block
	vertical-align baseline
	background #4c4c4c
	border-radius 1rem
</style>