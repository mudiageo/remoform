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
		type?: 'text' | 'number' | 'checkbox' | 'radio' | 'file' | 'select' | 'select multiple';
		placeholder?: string;
		showErrors?: boolean;
		children?: Snippet;
	}

	let { 
		form, 
		name, 
		label, 
		description, 
		type,
		placeholder,
		showErrors = true,
		children 
	}: Props = $props();
</script>

<Field {form} {name} {type}>
	{#if children}
		{@render children()}
	{:else}
		{#if label}
			<Label>{label}</Label>
		{/if}
		<Control>
			{#snippet children({ props })}
				<input {...props} {placeholder} class="remoform-input" />
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
	.remoform-input {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		font-size: 1rem;
	}

	.remoform-input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.remoform-input[aria-invalid="true"] {
		border-color: #ef4444;
	}
</style>
