<script lang="ts">
	import {
		setFieldContext,
		generateId,
		type RemoformFieldContext,
		type FieldProps,
	} from "../form.svelte.js";

	let { form, name, children }: FieldProps = $props();

	const fieldId = generateId("field");
	const labelId = generateId("label");
	const descriptionId = generateId("description");
	const errorId = generateId("error");

	const hasErrors = $derived((form.remoteForm.issues?.[name]?.length ?? 0) > 0);
	const errors = $derived(form.remoteForm.issues?.[name] || []);
	const value = $derived(form.remoteForm.input?.[name]);

	const fieldContext: RemoformFieldContext = $derived({
		name,
		form,
		fieldId,
		labelId,
		descriptionId,
		errorId,
		get hasErrors() {
			return (form.remoteForm.issues?.[name]?.length ?? 0) > 0;
		},
		get errors() {
			return form.remoteForm.issues?.[name] || [];
		},
		value,
	});

	setFieldContext(() => fieldContext);
</script>

<div class="remoform-field" data-field={name}>
	{@render children()}
</div>

<style>
	.remoform-field {
		margin-bottom: 1rem;
	}
</style>
