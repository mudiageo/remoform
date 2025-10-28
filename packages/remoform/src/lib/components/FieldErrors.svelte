<script lang="ts">
	import { getFieldContext } from "../form.svelte.js";

	const fieldContext = getFieldContext();
</script>

{#if fieldContext.hasErrors}
	<div id={fieldContext.errorId} class="remoform-field-errors" role="alert" aria-live="polite">
		{#each fieldContext.errors as issue}
			<div class="remoform-error">{issue.message}</div>
		{/each}
	</div>
{/if}

<style>
	.remoform-field-errors {
		margin-top: 0.25rem;
	}

	.remoform-error {
		color: #ef4444;
		font-size: 0.875rem;
		line-height: 1.25rem;
	}
</style>
