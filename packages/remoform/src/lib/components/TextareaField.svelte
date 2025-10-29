<script lang="ts">
	import Field from "./Field.svelte";
	import Label from "./Label.svelte";
	import Description from "./Description.svelte";
	import FieldErrors from "./FieldErrors.svelte";
	import Control from "./Control.svelte";
	import type { Remoform } from "../form.svelte.js";
	import type { Snippet } from "svelte";

	interface Props {
		form: Remoform;
		name: string;
		label?: string;
		description?: string;
		placeholder?: string;
		rows?: number;
		showErrors?: boolean;
		children?: Snippet;
	}

	let { 
		form, 
		name, 
		label, 
		description, 
		placeholder,
		rows = 3,
		showErrors = true,
		children 
	}: Props = $props();
</script>

<Field {form} {name} type="text">
	{#if children}
		{@render children()}
	{:else}
		{#if label}
			<Label>{label}</Label>
		{/if}
		<Control>
			{#snippet children({ props })}
				<textarea {...props} {placeholder} {rows} class="remoform-textarea"></textarea>
			{/snippet}
		</Control>
		{#if description}
			<Description>{description}</Description>
		{/if}
		{#if showErrors}
			<FieldErrors />
		{/if}
	{/if}
</Field>

<style>
	.remoform-textarea {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		font-size: 1rem;
		font-family: inherit;
		resize: vertical;
	}

	.remoform-textarea:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.remoform-textarea[aria-invalid="true"] {
		border-color: #ef4444;
	}
</style>
