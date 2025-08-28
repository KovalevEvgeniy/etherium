<template>
	<span class="spoiler-text">
		Осторожно споилер!
		<span class="spoiler-text__desc">Клик для просмотра</span>
	</span>
</template>

<script setup>
</script>

<style scoped lang="stylus">
.spoiler-text
	color #b11e1e
	font-size 5rem
	margin-top -2rem
	margin-bottom 2rem
	position absolute
	top 50%
	left 50%
	transform translate(-50%, -50%)
	font-weight 800
	text-align center
	cursor pointer
	white-space nowrap
	pointer-events none
	&__desc
		font-size .8em
		display block
		opacity .75
		font-weight normal
		font-style italic

</style>