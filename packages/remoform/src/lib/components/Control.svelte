<script lang="ts">
	import { getFieldContext } from "../form.svelte.js";
	import type { Snippet } from "svelte";

	interface Props {
		children: Snippet<[{ props: Record<string, any> }]>;
	}

	let { children }: Props = $props();

	const fieldContext = getFieldContext();
</script>

{@render children({ props: fieldContext.props })}
