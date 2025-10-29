<script lang="ts">
	import {
		setFieldContext,
		generateId,
		type RemoformFieldContext,
		type FieldProps,
	} from "../form.svelte.js";

	let { form, name, type, children }: FieldProps = $props();

	const fieldId = generateId("field");
	const labelId = generateId("label");
	const descriptionId = generateId("description");
	const errorId = generateId("error");

	// Get field using the accessor
	const field = $derived(form.fields[name]);
	const fieldIssues = $derived(field?.issues() || []);
	const hasErrors = $derived(fieldIssues.length > 0);

	// Infer type from schema if not provided
	const fieldType = $derived(type ?? form.getFieldType(name));

	// Compute props with SvelteKit's field.as(type) and enhance with accessibility
	const props = $derived({
		...field?.as(fieldType),
		id: fieldId,
		"aria-describedby": [
			hasErrors ? errorId : null,
			descriptionId,
		]
			.filter(Boolean)
			.join(" "),
		"aria-labelledby": labelId,
		"data-remoform-control": name,
		"data-remoform-error": hasErrors ? errorId : undefined,
	});

	const fieldContext: RemoformFieldContext = $derived({
		name,
		form,
		fieldId,
		labelId,
		descriptionId,
		errorId,
		props,
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
