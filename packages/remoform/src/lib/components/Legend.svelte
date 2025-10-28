<script lang="ts">
	import { getFieldContext, type LegendProps } from "../form.svelte.js";

	let { children }: LegendProps = $props();

	const fieldContext = getFieldContext();
</script>

<legend id={fieldContext.labelId} class="remoform-legend">
	{@render children()}
</legend>

<style>
	.remoform-legend {
		font-weight: 600;
		margin-bottom: 0.5rem;
		padding: 0 0.25rem;
	}
</style>
