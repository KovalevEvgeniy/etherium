<template>
	<div class="island">
		<slot/>
	</div>
</template>

<style scoped lang="stylus">
.island
	width 100%
	margin: 0 auto;
	background-color: var(--color-bg-content);
	border-radius: var(--radius);
	padding: 5rem;
	position: relative;
	z-index: 1;
	box-sizing border-box

	@media (max-width: 768px)
		padding: 3rem
</style>