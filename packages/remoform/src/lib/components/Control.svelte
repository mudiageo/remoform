<script lang="ts">
	import { getFieldContext, type ControlProps } from "../form.svelte.js";
	import type { Snippet } from "svelte";

	interface Props {
		children: Snippet<[{ props: ControlProps }]>;
	}

	let { children }: Props = $props();

	const fieldContext = getFieldContext();

	const controlProps: ControlProps = $derived({
		id: fieldContext.fieldId,
		// Use SvelteKit's form.field() method for type safety if available, otherwise fallback to name
		name: fieldContext.form.remoteForm.field?.(fieldContext.name) || fieldContext.name,
		"aria-describedby": [
			fieldContext.hasErrors ? fieldContext.errorId : null,
			fieldContext.descriptionId,
		]
			.filter(Boolean)
			.join(" "),
		"aria-invalid": fieldContext.hasErrors,
		"aria-labelledby": fieldContext.labelId,
		// Use the isFieldRequired method from the form
		"aria-required": fieldContext.form.isFieldRequired?.(fieldContext.name) ? "true" : undefined,
		"data-remoform-control": fieldContext.name,
		"data-remoform-error": fieldContext.hasErrors ? fieldContext.errorId : undefined,
		// Use SvelteKit's live input values from form.input
		value: fieldContext.value,
	});
</script>

{@render children({ props: controlProps })}
