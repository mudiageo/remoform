<script lang="ts">
	import {
		setFieldContext,
		generateId,
		type RemoformFieldContext,
		type FieldProps,
	} from "../form.svelte.js";
	import Label from "./Label.svelte";
	import FieldErrors from "./FieldErrors.svelte";

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

	// Auto-bind props to direct input/select/textarea children
	let fieldElement: HTMLDivElement;

	$effect(() => {
		if (!fieldElement) return;

		// Find direct input/select/textarea elements
		const inputs = fieldElement.querySelectorAll(
			'input:not([data-remoform-control]), select:not([data-remoform-control]), textarea:not([data-remoform-control])'
		);

		inputs.forEach((input) => {
			// Apply all props to the input
			Object.entries(props).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					if (key === 'value') {
						// Handle value specially for different input types
						if (input instanceof HTMLInputElement) {
							if (input.type === 'checkbox' || input.type === 'radio') {
								input.checked = !!value;
							} else {
								input.value = String(value ?? '');
							}
						} else {
							(input as HTMLSelectElement | HTMLTextAreaElement).value = String(value ?? '');
						}
					} else if (key === 'checked') {
						(input as HTMLInputElement).checked = !!value;
					} else if (key.startsWith('on')) {
						// Handle event listeners
						const eventName = key.slice(2).toLowerCase();
						input.addEventListener(eventName, value as EventListener);
					} else {
						// Set attribute
						input.setAttribute(key, String(value));
					}
				}
			});
		});
	});

	// Check if children contains Label or FieldErrors components
	let hasLabel = $state(false);
	let hasFieldErrors = $state(false);

	$effect(() => {
		if (!fieldElement) return;
		
		// Check if Label component exists in children
		hasLabel = fieldElement.querySelector('[data-remoform-label]') !== null;
		
		// Check if FieldErrors component exists in children
		hasFieldErrors = fieldElement.querySelector('[data-remoform-errors]') !== null;
	});

	// Get auto-label from form configuration
	const autoLabel = $derived(form.options.autoLabels ? form.getAutoLabel(name) : null);
	const shouldShowErrors = $derived(form.options.showErrors && !hasFieldErrors);
</script>

<div class="remoform-field" data-field={name} bind:this={fieldElement}>
	<!-- Auto-generate label if autoLabels is enabled and no Label component provided -->
	{#if autoLabel && !hasLabel}
		<Label>{autoLabel}</Label>
	{/if}

	{@render children()}

	<!-- Auto-show errors if showErrors is enabled and no FieldErrors component provided -->
	{#if shouldShowErrors}
		<FieldErrors />
	{/if}
</div>

<style>
	.remoform-field {
		margin-bottom: 1rem;
	}
</style>
