<template>
	<div class="tl-page">
		<div class="tl-island">
			<h1 class="tl-title">Хроника Этериума</h1>

			<div class="tl-filters">
				<button
					v-for="track in tracks"
					:key="track.id"
					class="tl-filter"
					:class="{ _active: activeIds.includes(track.id) }"
					:style="{ '--c': track.color }"
					@click="toggleTrack(track.id)"
				>
					<span class="tl-filter__dot"></span>
					{{ track.name }}
				</button>
			</div>

			<div class="tl-wrap">
				<div class="tl-spine"></div>

				<template v-for="era in ERAS" :key="era.id">
					<template v-if="eraGroups[era.id]?.length">
						<div class="tl-era">
							<div class="tl-era__label">{{ era.name }}</div>
							<div class="tl-era__sub">{{ era.sub }}</div>
						</div>

						<div
							v-for="group in eraGroups[era.id]"
							:key="group.key"
							class="tl-group"
						>
							<div class="tl-group__year">{{ group.year === 0 ? '—' : group.year }}</div>
							<div class="tl-group__dot"></div>
							<div class="tl-group__events">
								<div
									v-for="(ev, i) in group.events"
									:key="i"
									class="tl-event"
									:style="{ '--c': ev._color }"
								>
									<span class="tl-event__badge">{{ ev._name }}</span>
									<span class="tl-event__title">{{ ev.title }}</span>
									<p v-if="ev.description" class="tl-event__desc">{{ ev.description }}</p>
								</div>
							</div>
						</div>
					</template>
				</template>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue';

const ERAS = [
	{ id: 'КВИ', name: 'Календарь Великой Империи', sub: 'До падения луны' },
	{ id: 'КБ',  name: 'Календарь Безвременья',     sub: 'После разрушения' },
	{ id: 'НМ',  name: 'Новый Мир',                 sub: 'Рождение нового уклада' },
	{ id: 'СВ',  name: 'Светлые Времена',            sub: 'После победы над тьмой' },
];

const trackModules = import.meta.glob('@/timeline/*.json', { eager: true });

const tracks = Object.values(trackModules).map(m => ({
	id: m.id,
	name: m.name,
	color: m.color,
	events: m.events,
}));

const activeIds = ref(tracks.map(t => t.id));

function toggleTrack(id) {
	if (activeIds.value.includes(id)) {
		if (activeIds.value.length > 1) {
			activeIds.value = activeIds.value.filter(x => x !== id);
		}
	} else {
		activeIds.value = [...activeIds.value, id];
	}
}

const eraGroups = computed(() => {
	const activeTracks = tracks.filter(t => activeIds.value.includes(t.id));

	// Flat list of all events with track info
	const all = [];
	for (const track of activeTracks) {
		for (const ev of track.events) {
			all.push({ ...ev, _color: track.color, _name: track.name, _id: track.id });
		}
	}

	// Group by era → year
	const byEra = {};
	for (const era of ERAS) byEra[era.id] = {};

	for (const ev of all) {
		if (!byEra[ev.era]) continue;
		const key = ev.year;
		if (!byEra[ev.era][key]) byEra[ev.era][key] = [];
		byEra[ev.era][key].push(ev);
	}

	// Sort years, convert to array of groups
	const result = {};
	for (const era of ERAS) {
		result[era.id] = Object.entries(byEra[era.id])
			.sort(([a], [b]) => Number(a) - Number(b))
			.map(([year, events]) => ({
				key: `${era.id}-${year}`,
				year: Number(year),
				events,
			}));
	}

	return result;
});
</script>

<style scoped lang="stylus">
.tl-page
	max-width 960px
	margin 0 auto

.tl-island
	background-color var(--color-bg-content)
	border-radius var(--radius)
	padding 8rem
	position relative
	z-index 1
	@media (max-width 768px)
		padding 4rem

.tl-title
	margin-top 0

.tl-filters
	display flex
	flex-wrap wrap
	gap 2rem
	margin-bottom 8rem

.tl-filter
	display flex
	align-items center
	gap 1.5rem
	padding 1.5rem 3rem
	border-radius 99px
	border 2px solid var(--c)
	background transparent
	color #333
	font-size 3.5rem
	cursor pointer
	transition background 0.15s, color 0.15s
	font-family inherit

	&__dot
		width 2rem
		height 2rem
		border-radius 50%
		background var(--c)
		flex-shrink 0

	&._active
		background var(--c)
		color #fff

.tl-wrap
	position relative
	padding-left 20rem
	@media (max-width 600px)
		padding-left 12rem

.tl-spine
	position absolute
	left 14rem
	top 0
	bottom 0
	width 1px
	background linear-gradient(to bottom, transparent, #00000022 5%, #00000022 95%, transparent)
	@media (max-width 600px)
		left 8rem

// Era header
.tl-era
	position relative
	margin 10rem 0 6rem
	padding-left 8rem

	&::before
		content ''
		position absolute
		left -8rem
		top 50%
		transform translateY(-50%)
		width 5rem
		height 1px
		background #00000033

	&__label
		font-size 4.5rem
		font-weight 700
		color #222
		line-height 1.2

	&__sub
		font-size 3rem
		color #888
		margin-top 0.5rem

// Year group
.tl-group
	display flex
	align-items flex-start
	gap 4rem
	margin-bottom 4rem
	position relative

	&__year
		width 10rem
		flex-shrink 0
		text-align right
		font-size 3rem
		color #888
		padding-top 1.25rem
		font-variant-numeric tabular-nums
		@media (max-width 600px)
			width 5rem
			font-size 2.5rem

	&__dot
		width 3rem
		height 3rem
		border-radius 50%
		background #ccc
		border 2px solid #aaa
		flex-shrink 0
		margin-top 1.5rem
		position relative
		z-index 1

	&__events
		flex 1
		display flex
		flex-direction column
		gap 2rem
		min-width 0

// Single event
.tl-event
	padding 2.5rem 3rem
	border-radius 1.5rem
	border-left 3px solid var(--c)
	background #ffffff66

	&__badge
		display inline-block
		padding 0.5rem 1.5rem
		border-radius 99px
		background var(--c)
		color #fff
		font-size 2.5rem
		font-weight 600
		margin-bottom 1rem
		vertical-align middle

	&__title
		font-size 3.5rem
		font-weight 600
		color #222
		line-height 1.3

	&__desc
		font-size 3rem
		color #555
		margin 1rem 0 0
		line-height 1.4
</style>
