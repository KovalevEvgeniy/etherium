<template>
	<div class="app">
		<Background/>

		<header class="header">
<!--			<nav class="nav">-->
<!--				<RouterLink to="/">Главная</RouterLink>-->
<!--				<RouterLink to="/about">О проекте</RouterLink>-->
<!--			</nav>-->
		</header>

		<main class="main">
			<RouterView />
		</main>
	</div>
</template>

<script setup>
// Ничего дополнительного не требуется
import Background from "./components/Background.vue";
</script>

<style src="./styles/style.css"></style>