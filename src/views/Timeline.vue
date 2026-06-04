<template>
	<div class="tl-root">

		<!-- ── Sticky top bar ── -->
		<div class="tl-topbar">
			<span class="tl-topbar__title">Хроника Этериума</span>
			<div class="tl-filters">
				<button
					v-for="t in tracks"
					:key="t.id"
					class="tl-filter"
					:class="{ _on: isActive(t.id) }"
					:style="{ '--c': t.color }"
					@click="toggle(t.id)"
				>
					<i class="tl-filter__dot" />
					{{ t.name }}
				</button>
			</div>
		</div>

		<!-- ── Vertical scroll ── -->
		<div class="tl-scroll" @mousemove="onMove">
			<div class="tl-canvas">

				<!-- Track header (sticky top) -->
				<div class="tl-header">
					<div class="tl-header__stub"></div>
					<div
						v-for="track in visibleTracks"
						:key="track.id"
						class="tl-col-head"
						:style="{ '--c': track.color }"
					>
						<span>{{ track.name }}</span>
					</div>
				</div>

				<!-- Body: era axis + track columns -->
				<div class="tl-body">

					<!-- Era axis (sticky left) -->
					<div class="tl-axis">
						<div
							v-for="era in ERAS"
							:key="era.id"
							class="tl-era-block"
							:style="{ height: eraH(era.id) + 'px' }"
						>
							<div class="tl-era-block__name">{{ era.label }}</div>
							<div class="tl-era-block__ruler">
								<!-- Year ticks (only in active segments) -->
								<span
									v-for="tick in eraTicks(era.id)"
									:key="tick"
									class="tl-tick"
									:style="{ top: yInEra(era.id, tick) + 'px' }"
								>{{ tick }}</span>
								<!-- Collapsed gap markers -->
								<div
									v-for="gap in eraGaps(era.id)"
									:key="'g' + gap.yearStart"
									class="tl-gap-label"
									:style="{ top: gap.pixelStart + 'px', height: gap.pixelH + 'px' }"
								>
									<span class="tl-gap-label__years">{{ gap.yearStart }} — {{ gap.yearEnd }}</span>
									<span class="tl-gap-label__note">нет сведений</span>
								</div>
							</div>
						</div>
					</div>

					<!-- Track columns -->
					<div
						v-for="track in visibleTracks"
						:key="track.id"
						class="tl-col"
					>
						<!-- Era background stripes -->
						<div
							v-for="(era, i) in ERAS"
							:key="era.id"
							class="tl-zone"
							:class="{ _alt: i % 2 === 1 }"
							:style="{ height: eraH(era.id) + 'px' }"
						></div>

						<!-- Era dividers -->
						<div
							v-for="(era, i) in ERAS"
							:key="era.id + '_d'"
							v-show="i > 0"
							class="tl-ediv"
							:style="{ top: eraOff[era.id] + 'px' }"
						></div>

						<!-- Collapsed gap overlays -->
						<template v-for="era in ERAS" :key="era.id + '_gaps'">
							<div
								v-for="gap in eraGaps(era.id)"
								:key="'cg-' + era.id + '-' + gap.yearStart"
								class="tl-col-gap"
								:style="{ top: (eraOff[era.id] + gap.pixelStart) + 'px', height: gap.pixelH + 'px' }"
							></div>
						</template>

						<!-- Duration bars (vertical) -->
						<div
							v-for="ev in getDurationEvents(track)"
							:key="ev._key"
							class="tl-bar"
							:style="{
								top:    yAbs(ev.era, ev.year) + 'px',
								height: barH(ev) + 'px',
								'--c':  track.color,
							}"
							@mouseenter="showTip(ev, track)"
							@mouseleave="hideTip"
						>
							<span class="tl-bar__title">{{ ev.title }}</span>
						</div>

						<!-- Point events -->
						<div
							v-for="ev in getPointEvents(track)"
							:key="ev._key"
							class="tl-point"
							:style="{ top: yAbs(ev.era, ev.year) + 'px', '--c': track.color }"
							@mouseenter="showTip(ev, track)"
							@mouseleave="hideTip"
						>
							<div class="tl-point__dot"></div>
							<div class="tl-point__label">{{ ev.title }}</div>
						</div>

					</div>
				</div>
			</div>
		</div>

		<!-- Tooltip -->
		<Teleport to="body">
			<div
				v-if="tip"
				class="tl-tip"
				:style="{ left: tipX + 'px', top: tipY + 'px' }"
			>
				<div class="tl-tip__source" :style="{ '--c': tip.track.color }">
					{{ tip.track.name }}
				</div>
				<div class="tl-tip__date">
					{{ tip.ev.era }} {{ tip.ev.year }}<template v-if="tip.ev.yearEnd"> — {{ tip.ev.yearEnd }}</template>
				</div>
				<div class="tl-tip__title">{{ tip.ev.title }}</div>
				<p v-if="tip.ev.description" class="tl-tip__desc">{{ tip.ev.description }}</p>
			</div>
		</Teleport>

	</div>
</template>

<script setup>
import { computed, ref } from 'vue'

// ── Scale ─────────────────────────────────────────────────────────────────────
const PX_PER_YEAR = 16
const BUFFER      = 2    // years of buffer around events before a gap starts
const MIN_GAP     = 3   // min years of silence to collapse
const GAP_H       = 32   // px height of a collapsed gap row

// ── Eras ──────────────────────────────────────────────────────────────────────
const ERAS = [
	{ id: 'КВИ', label: 'Великая Империя' },
	{ id: 'КБ',  label: 'Безвременье' },
	{ id: 'НМ',  label: 'Новый Мир' },
	{ id: 'СВ',  label: 'Светлые Времена' },
]

// ── Load tracks ───────────────────────────────────────────────────────────────
const raw    = import.meta.glob('@/timeline/*.json', { eager: true })
const tracks = Object.values(raw)
	.map(m => ({ id: m.id, name: m.name, color: m.color, events: m.events ?? [] }))
	.sort((a, b) => (a.id === 'general' ? -1 : b.id === 'general' ? 1 : a.name.localeCompare(b.name, 'ru')))

// ── Filters ───────────────────────────────────────────────────────────────────
const activeIds     = ref(tracks.map(t => t.id))
const isActive      = id => activeIds.value.includes(id)
const visibleTracks = computed(() => tracks.filter(t => isActive(t.id)))

function toggle(id) {
	if (isActive(id)) {
		if (activeIds.value.length > 1) activeIds.value = activeIds.value.filter(x => x !== id)
	} else {
		activeIds.value = [...activeIds.value, id]
	}
}

// ── Year range per era (all tracks — keeps axis stable when filters change) ───
const eraRange = computed(() => {
	const r = {}
	for (const track of tracks) {
		for (const ev of track.events) {
			if (!r[ev.era]) r[ev.era] = { min: Infinity, max: -Infinity }
			r[ev.era].min = Math.min(r[ev.era].min, ev.year)
			r[ev.era].max = Math.max(r[ev.era].max, ev.yearEnd ?? ev.year)
		}
	}
	for (const e of Object.values(r)) {
		if (e.min === e.max) { e.min -= 1; e.max += 1 }
	}
	return r
})

// ── Segmented era layout ──────────────────────────────────────────────────────
// Each era is split into active segments (events + buffer) and collapsed gaps.
function computeEraLayout(eraId) {
	const r = eraRange.value[eraId]
	if (!r) return { segments: [], totalH: GAP_H }

	// Collect event ranges with buffer.
	// Duration events: only mark start and end years as active — not the whole span,
	// so empty stretches inside long events still get collapsed.
	const ranges = []
	for (const track of tracks) {
		for (const ev of track.events) {
			if (ev.era !== eraId) continue
			ranges.push([ev.year - BUFFER, ev.year + BUFFER])
			if (ev.yearEnd) ranges.push([ev.yearEnd - BUFFER, ev.yearEnd + BUFFER])
		}
	}

	if (!ranges.length) {
		return {
			segments: [{ type: 'gap', yearStart: r.min, yearEnd: r.max, pixelStart: 0, pixelH: GAP_H }],
			totalH: GAP_H,
		}
	}

	// Sort and merge overlapping ranges
	ranges.sort((a, b) => a[0] - b[0])
	const merged = [[...ranges[0]]]
	for (let i = 1; i < ranges.length; i++) {
		const last = merged[merged.length - 1]
		if (ranges[i][0] <= last[1]) last[1] = Math.max(last[1], ranges[i][1])
		else merged.push([...ranges[i]])
	}

	// Build raw segments (active + gap)
	const segs = []
	let px  = 0
	let cur = r.min

	for (const [s, e] of merged) {
		const segStart = Math.max(s, r.min)
		const segEnd   = Math.min(e, r.max)
		if (segEnd < segStart) continue

		const gapLen = segStart - cur
		if (gapLen >= MIN_GAP) {
			segs.push({ type: 'gap',    yearStart: cur,      yearEnd: segStart, pixelStart: px, pixelH: GAP_H })
			px += GAP_H
		} else if (gapLen > 0) {
			segs.push({ type: 'active', yearStart: cur,      yearEnd: segStart, pixelStart: px, pixelH: gapLen * PX_PER_YEAR })
			px += gapLen * PX_PER_YEAR
		}

		const h = (segEnd - segStart) * PX_PER_YEAR
		segs.push({ type: 'active', yearStart: segStart, yearEnd: segEnd, pixelStart: px, pixelH: h })
		px += h
		cur = segEnd
	}

	// Trailing segment
	if (cur < r.max) {
		const gapLen = r.max - cur
		if (gapLen >= MIN_GAP) {
			segs.push({ type: 'gap',    yearStart: cur, yearEnd: r.max, pixelStart: px, pixelH: GAP_H })
		} else {
			segs.push({ type: 'active', yearStart: cur, yearEnd: r.max, pixelStart: px, pixelH: gapLen * PX_PER_YEAR })
		}
	}

	// Merge adjacent active segments
	const out = []
	for (const seg of segs) {
		const last = out[out.length - 1]
		if (last?.type === 'active' && seg.type === 'active') {
			last.yearEnd = seg.yearEnd
			last.pixelH += seg.pixelH
		} else {
			out.push({ ...seg })
		}
	}

	// Recalculate pixelStart after merge
	let pxCursor = 0
	for (const seg of out) {
		seg.pixelStart = pxCursor
		pxCursor += seg.pixelH
	}

	return { segments: out, totalH: pxCursor || GAP_H }
}

const eraLayout = computed(() => {
	const res = {}
	for (const era of ERAS) res[era.id] = computeEraLayout(era.id)
	return res
})

// ── Heights and offsets ───────────────────────────────────────────────────────
function eraH(eraId) {
	return eraLayout.value[eraId]?.totalH ?? GAP_H
}

const eraOff = computed(() => {
	const off = {}
	let y = 0
	for (const era of ERAS) { off[era.id] = y; y += eraH(era.id) }
	return off
})

// ── Coordinate helpers ────────────────────────────────────────────────────────
function yInEra(eraId, year) {
	const layout = eraLayout.value[eraId]
	if (!layout?.segments.length) return 0
	for (const seg of layout.segments) {
		if (year >= seg.yearStart && year <= seg.yearEnd) {
			if (seg.type === 'gap') return seg.pixelStart + seg.pixelH / 2
			const span = seg.yearEnd - seg.yearStart
			if (!span) return seg.pixelStart
			return seg.pixelStart + ((year - seg.yearStart) / span) * seg.pixelH
		}
	}
	const last = layout.segments[layout.segments.length - 1]
	return last.pixelStart + last.pixelH
}

function yAbs(eraId, year) {
	return eraOff.value[eraId] + yInEra(eraId, year)
}

function barH(ev) {
	return Math.max(yAbs(ev.era, ev.yearEnd) - yAbs(ev.era, ev.year), 6)
}

// ── Tick marks ────────────────────────────────────────────────────────────────
// Always shows: era min/max + all event years.
// Intermediate ticks: density-based, only within the same active segment.
function eraTicks(eraId) {
	const r = eraRange.value[eraId]
	if (!r) return []

	const layout  = eraLayout.value[eraId]
	const gapSegs = layout.segments.filter(s => s.type === 'gap')

	function inGap(y) {
		return gapSegs.some(g => y > g.yearStart && y < g.yearEnd)
	}
	function activeSegOf(y) {
		return layout.segments.find(s => s.type === 'active' && y >= s.yearStart && y <= s.yearEnd)
	}

	// Primary years: era boundaries + every event year
	const important = new Set([r.min, r.max])
	for (const track of tracks) {
		for (const ev of track.events) {
			if (ev.era !== eraId) continue
			important.add(ev.year)
			if (ev.yearEnd) important.add(ev.yearEnd)
		}
	}

	// Keep only years not swallowed by a gap
	const base = [...important].filter(y => !inGap(y)).sort((a, b) => a - b)

	// Add intermediate ticks only within the same active segment
	const all = new Set(base)
	for (let i = 0; i + 1 < base.length; i++) {
		const y1 = base[i], y2 = base[i + 1]
		const s1 = activeSegOf(y1), s2 = activeSegOf(y2)
		if (!s1 || s1 !== s2) continue   // different segments — no intermediates
		const gap = y2 - y1
		if (gap <= 20) continue
		const step = gap > 500 ? 100 : gap > 200 ? 50 : gap > 80 ? 20 : 10
		for (let y = Math.ceil((y1 + 1) / step) * step; y < y2; y += step) {
			if (!inGap(y)) all.add(y)
		}
	}

	return [...all].sort((a, b) => a - b)
}

// ── Gap segments for axis labels and column overlays ─────────────────────────
function eraGaps(eraId) {
	return eraLayout.value[eraId]?.segments.filter(s => s.type === 'gap') ?? []
}

// ── Event helpers ─────────────────────────────────────────────────────────────
const key = (track, ev, i) => `${track.id}-${ev.era}-${ev.year}-${i}`

function getPointEvents(track) {
	return track.events
		.filter(ev => !ev.yearEnd)
		.map((ev, i) => ({ ...ev, _key: key(track, ev, i) }))
}

function getDurationEvents(track) {
	return track.events
		.filter(ev => ev.yearEnd)
		.map((ev, i) => ({ ...ev, _key: key(track, ev, i) }))
}

// ── Tooltip ───────────────────────────────────────────────────────────────────
const tip  = ref(null)
const tipX = ref(0)
const tipY = ref(0)

const showTip = (ev, track) => { tip.value = { ev, track } }
const hideTip = ()           => { tip.value = null }
const onMove  = e            => { tipX.value = e.clientX + 16; tipY.value = e.clientY + 16 }
</script>

<style scoped lang="stylus">

// ── Root & layout ─────────────────────────────────────────────────────────────
.tl-root
	display flex
	flex-direction column
	height 100vh
	overflow hidden

.tl-scroll
	flex 1
	min-height 0
	overflow auto
	background #eeece7

.tl-canvas
	display inline-flex
	flex-direction column
	min-width 100%

// ── Top bar ───────────────────────────────────────────────────────────────────
// Not sticky — it lives outside the scroll area and stays at the top naturally.
.tl-topbar
	flex-shrink 0
	display flex
	align-items center
	gap 5rem
	flex-wrap wrap
	padding 3rem 6rem
	background rgba(15, 17, 21, 0.95)
	backdrop-filter blur(12px)
	border-bottom 1px solid rgba(255,255,255,0.07)

	&__title
		color #e7e9ee
		font-size 5rem
		font-weight 700
		flex-shrink 0

.tl-filters
	display flex
	gap 2rem
	flex-wrap wrap

.tl-filter
	display inline-flex
	align-items center
	gap 1.5rem
	padding 1.25rem 3rem
	border-radius 99px
	border 1.5px solid var(--c)
	background transparent
	color rgba(255,255,255,0.65)
	font-size 3rem
	cursor pointer
	font-family inherit
	transition background 0.15s, color 0.15s

	&__dot
		display block
		width 2rem
		height 2rem
		border-radius 50%
		background var(--c)
		flex-shrink 0

	&._on
		background var(--c)
		color #fff

// ── Track header (sticky top) ─────────────────────────────────────────────────
.tl-header
	display flex
	position sticky
	top 0
	z-index 50
	background #e3e1dc
	border-bottom 2px solid rgba(0,0,0,0.13)
	box-shadow 0 2px 8px rgba(0,0,0,0.08)

	&__stub
		width 160px
		flex-shrink 0
		position sticky
		left 0
		z-index 55
		background #e3e1dc
		border-right 2px solid rgba(0,0,0,0.13)

.tl-col-head
	width 220px
	flex-shrink 0
	padding 3rem 3rem 3rem 4rem
	border-right 1px solid rgba(0,0,0,0.08)
	display flex
	align-items center

	span
		font-size 3.5rem
		font-weight 700
		color #2a2a2a
		border-left 3px solid var(--c)
		padding-left 2.5rem
		line-height 1.4

// ── Body ──────────────────────────────────────────────────────────────────────
// padding-top gives clearance for the first labels that use translateY(-50%)
.tl-body
	display flex
	flex 1
	padding-top 20px

// ── Era axis (sticky left) ────────────────────────────────────────────────────
.tl-axis
	width 160px
	flex-shrink 0
	position sticky
	left 0
	z-index 20
	background #e8e6e1
	border-right 2px solid rgba(0,0,0,0.12)
	display flex
	flex-direction column

.tl-era-block
	position relative
	flex-shrink 0
	border-bottom 1px solid rgba(0,0,0,0.13)
	box-sizing border-box

	&__name
		position absolute
		left 0
		top 0
		bottom 0
		width 52px
		display flex
		align-items center
		justify-content center
		writing-mode vertical-rl
		text-orientation mixed
		transform rotate(180deg)
		font-size 2.75rem
		font-weight 700
		color #2a2a2a
		letter-spacing 0.02em
		background #e3e1dc
		border-right 1px solid rgba(0,0,0,0.08)

	&__ruler
		position absolute
		left 52px
		top 0
		right 0
		bottom 0

// ── Year tick ─────────────────────────────────────────────────────────────────
.tl-tick
	position absolute
	right 6px
	transform translateY(-50%)
	font-size 2.25rem
	color #999
	white-space nowrap
	user-select none
	display flex
	align-items center
	gap 3px

	&::before
		content ''
		display block
		width 5px
		height 1px
		background #ccc

// ── Collapsed gap label in axis ruler ────────────────────────────────────────
.tl-gap-label
	position absolute
	left 0
	right 0
	display flex
	flex-direction column
	align-items flex-end
	justify-content center
	padding-right 6px
	gap 0.5rem
	background rgba(0,0,0,0.05)
	border-top 1px dashed rgba(0,0,0,0.18)
	border-bottom 1px dashed rgba(0,0,0,0.18)
	overflow hidden
	box-sizing border-box

	&__years
		font-size 2rem
		color #aaa
		white-space nowrap
		font-variant-numeric tabular-nums

	&__note
		font-size 1.75rem
		color #bbb
		font-style italic
		white-space nowrap

// ── Track column ──────────────────────────────────────────────────────────────
.tl-col
	width 220px
	flex-shrink 0
	position relative
	display flex
	flex-direction column
	border-right 1px solid rgba(0,0,0,0.07)

// ── Era stripe backgrounds ────────────────────────────────────────────────────
.tl-zone
	flex-shrink 0
	width 100%
	pointer-events none

	&._alt
		background rgba(0,0,0,0.022)

// ── Era dividers (horizontal lines between eras) ──────────────────────────────
.tl-ediv
	position absolute
	left 0
	right 0
	height 2px
	background rgba(0,0,0,0.09)
	pointer-events none
	z-index 1

// ── Collapsed gap overlay in column ──────────────────────────────────────────
.tl-col-gap
	position absolute
	left 0
	right 0
	z-index 2
	pointer-events none
	background repeating-linear-gradient(
		45deg,
		rgba(0,0,0,0.035),
		rgba(0,0,0,0.035) 3px,
		transparent 3px,
		transparent 10px
	)
	border-top 1px dashed rgba(0,0,0,0.15)
	border-bottom 1px dashed rgba(0,0,0,0.15)

// ── Point event: dot + always-visible label ───────────────────────────────────
.tl-point
	position absolute
	left 0
	right 0
	height 0
	cursor pointer
	z-index 8

	&__dot
		position absolute
		left 12px
		top 0
		transform translate(-50%, -50%)
		width 10px
		height 10px
		border-radius 50%
		background var(--c)
		border 2px solid #edeae4
		box-shadow 0 0 0 1.5px var(--c)
		transition transform 0.12s

	&:hover &__dot
		transform translate(-50%, -50%) scale(1.5)
		z-index 3

	&__label
		position absolute
		left 22px
		top 0
		transform translateY(-50%)
		font-size 2.5rem
		line-height 1.35
		color #1a1a1a
		white-space nowrap
		background rgba(238,236,231,0.88)
		padding 0.4rem 1.5rem
		border-radius 0.75rem
		pointer-events none

// ── Duration bar (vertical) ───────────────────────────────────────────────────
BAR_W_V = 12px

.tl-bar
	position absolute
	left 6px
	width BAR_W_V
	background var(--c)
	border-radius (BAR_W_V / 2)
	opacity 0.82
	cursor pointer
	z-index 5
	transition opacity 0.12s, box-shadow 0.12s

	&:hover
		opacity 1
		box-shadow 0 2px 10px rgba(0,0,0,0.25)
		z-index 10

	&__title
		position absolute
		left (BAR_W_V + 6px)
		top 2px
		font-size 2.5rem
		font-weight 700
		color #1a1a1a
		white-space nowrap
		pointer-events none
		background rgba(238,236,231,0.88)
		padding 0.4rem 1.5rem
		border-radius 0.75rem

// ── Tooltip ───────────────────────────────────────────────────────────────────
.tl-tip
	position fixed
	z-index 9999
	pointer-events none
	max-width 300px
	background rgba(14, 16, 20, 0.97)
	color #e7e9ee
	border-radius 2rem
	padding 3.5rem 4rem
	box-shadow 0 8px 32px rgba(0,0,0,0.5)
	border 1px solid rgba(255,255,255,0.07)

	&__source
		font-size 2.5rem
		font-weight 700
		color var(--c)
		margin-bottom 1.5rem
		text-transform uppercase
		letter-spacing 0.06em

	&__date
		font-size 2.75rem
		color rgba(255,255,255,0.4)
		margin-bottom 0.75rem
		font-variant-numeric tabular-nums

	&__title
		font-size 4rem
		font-weight 600
		line-height 1.3
		margin-bottom 1.5rem

	&__desc
		font-size 3rem
		color rgba(255,255,255,0.6)
		line-height 1.5
		margin 0
</style>
