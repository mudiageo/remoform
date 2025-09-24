<script lang="ts">
	import { setFieldContext, generateId, type RemoformFieldContext, type FieldsetProps } from '../form.svelte.js';

	let { form, name, children }: FieldsetProps = $props();

	const fieldsetId = generateId('fieldset');
	const legendId = generateId('legend');
	const descriptionId = generateId('fieldset-description');
	const errorId = generateId('fieldset-error');

	const hasErrors = $derived((form.remoteForm.issues?.[name]?.length ?? 0) > 0);
	const errors = $derived(form.remoteForm.issues?.[name] || []);
	const value = $derived(form.remoteForm.input?.[name]);

	const fieldContext: RemoformFieldContext = $derived({
		name,
		form,
		fieldId: fieldsetId,
		labelId: legendId,
		descriptionId,
		errorId,
		hasErrors,
		errors,
		value,

	});


	setFieldContext(() => fieldContext);
	$effect(() => {
		setFieldContext(() => fieldContext);
	});	

</script>

<fieldset 
	id={fieldsetId} 
	class="remoform-fieldset" 
	data-field={name}
	aria-describedby={fieldContext.hasErrors ? errorId : descriptionId}
>
	{@render children()}
</fieldset>

<style>
	.remoform-fieldset {
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		padding: 1rem;
		margin-bottom: 1rem;
	}
</style>