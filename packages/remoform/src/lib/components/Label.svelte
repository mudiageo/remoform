<script lang="ts">
	import { getFieldContext, type LabelProps } from "../form.svelte.js";

	let { children }: LabelProps = $props();

	const fieldContext = getFieldContext();
</script>

<label for={fieldContext.fieldId} id={fieldContext.labelId} class="remoform-label">
	{@render children()}
</label>

<style>
	.remoform-label {
		display: block;
		font-weight: 500;
		margin-bottom: 0.25rem;
		cursor: pointer;
	}
</style>
