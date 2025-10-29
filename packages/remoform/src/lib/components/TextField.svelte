<script lang="ts">
	import Input from "./Input.svelte";
	import type { Remoform } from "../form.svelte.js";
	import type { Snippet } from "svelte";

	interface Props {
		form: Remoform;
		name: string;
		label?: string;
		description?: string;
		placeholder?: string;
		showErrors?: boolean;
		children?: Snippet;
	}

	let props: Props = $props();
</script>

<Input {...props} type="text" />
