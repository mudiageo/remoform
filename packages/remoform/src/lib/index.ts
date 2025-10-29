export interface RemoformFieldProps {
	form: import("./form.svelte.js").Remoform;
	name: string;
}

// Export main components
export { default as Field } from "./components/Field.svelte";
export { default as Control } from "./components/Control.svelte";
export { default as Label } from "./components/Label.svelte";
export { default as FieldErrors } from "./components/FieldErrors.svelte";
export { default as Description } from "./components/Description.svelte";
export { default as Fieldset } from "./components/Fieldset.svelte";
export { default as Legend } from "./components/Legend.svelte";

// Export simplified components
export { default as Input } from "./components/Input.svelte";
export { default as TextField } from "./components/TextField.svelte";
export { default as NumberField } from "./components/NumberField.svelte";
export { default as TextareaField } from "./components/TextareaField.svelte";

export * from "./form.svelte.js";
