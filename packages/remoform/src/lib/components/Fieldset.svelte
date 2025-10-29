<script lang="ts">
	import {
		setFieldContext,
		generateId,
		type RemoformFieldContext,
		type FieldsetProps,
	} from "../form.svelte.js";

	let { form, name, children }: FieldsetProps = $props();

	const fieldsetId = generateId("fieldset");
	const legendId = generateId("legend");
	const descriptionId = generateId("fieldset-description");
	const errorId = generateId("fieldset-error");

	// Get field using the fields API
	const field = $derived(form.fields[name]);
	const hasErrors = $derived((field?.issues()?.length ?? 0) > 0);

	const fieldContext: RemoformFieldContext = $derived({
		name,
		form,
		fieldId: fieldsetId,
		labelId: legendId,
		descriptionId,
		errorId,
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
	aria-describedby={hasErrors ? errorId : descriptionId}
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
