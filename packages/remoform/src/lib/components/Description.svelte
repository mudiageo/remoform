<script lang="ts">
	import { getFieldContext, type DescriptionProps } from "../form.svelte.js";

	let { children }: DescriptionProps = $props();

	const fieldContext = getFieldContext();
</script>

<div id={fieldContext.descriptionId} class="remoform-description">
	{@render children()}
</div>

<style>
	.remoform-description {
		color: #6b7280;
		font-size: 0.875rem;
		line-height: 1.25rem;
		margin-top: 0.25rem;
	}
</style>
