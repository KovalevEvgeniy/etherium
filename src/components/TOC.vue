<template>
	<nav class="toc">
		<div v-for="(item, i) in items" :key="item.path" class="toc__block">
			<a
				v-if="item.title"
				:href="`#${item.path}`"
				class="toc__title"
			>{{ i + 1 }}. {{ item.title }}</a>
			<div class="toc__list">
				<a
					v-for="child in item.children" :key="item.path"
					:href="`#${child.title}`"
					class="toc__item"
					:class="{
						_protect: child.protect,
					}"
				>
					{{ child.title }}
				</a>
			</div>
		</div>
	</nav>
</template>

<script setup>
defineProps({
	items: Array,
})
</script>

<style scoped lang="stylus">
.toc
	column-count: 3;
	column-gap: 1rem;
	width: 100%;
	line-height: 1.25;

	&__block
		break-inside: avoid;
		-webkit-column-break-inside: avoid;
		page-break-inside: avoid;
		margin-bottom: 4rem;

	&__list
		display flex
		flex-direction column
		gap 1rem
		padding-left 0rem

	&__item
		display: block;
		color #555
		text-decoration: none
		font-weight normal

		&._protect
			color #b11e1e

	&__title
		display block
		font-weight bold
		color #000
		margin-bottom 1rem

	&__item
	&__title
		text-decoration: none

		&:hover
			text-decoration underline

</style>