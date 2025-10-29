<script lang="ts">
	import { getFieldContext } from "../form.svelte.js";

	const fieldContext = getFieldContext();
	
	// Get field issues using the new fields API
	const field = $derived(fieldContext.form.fields[fieldContext.name]);
	const errors = $derived(field?.issues() || []);
	const hasErrors = $derived(errors.length > 0);
</script>

{#if hasErrors}
	<div 
		id={fieldContext.errorId} 
		class="remoform-field-errors" 
		role="alert" 
		aria-live="polite"
		data-remoform-errors
	>
		{#each errors as issue}
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
