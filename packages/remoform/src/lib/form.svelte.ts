import { getContext, setContext } from "svelte";
import type { Snippet } from "svelte";
import type { RemoteForm, RemoteFormInput } from "@sveltejs/kit";
import type { StandardSchemaV1 } from "@standard-schema/spec";

const REMOFORM_FORM_CONTEXT_KEY = Symbol.for("remoform-form");
const REMOFORM_FIELD_CONTEXT_KEY = Symbol.for("remoform-field");

export interface RemoformRemoteForm<TInput extends RemoteFormInput = any, TOutput = any>
	extends RemoteForm<TInput, TOutput> {
	oninput?: (event: Event) => void;
	onblur?: (event: Event) => void;
	onchange?: (event: Event) => void;
	onsubmit?: (event: Event) => void;
}

export interface RemoformFieldContext {
	name: string;
	form: Remoform;
	fieldId: string;
	labelId: string;
	descriptionId: string;
	errorId: string;
	props: Record<string, any>;
}

// Control props interface with proper typing
export interface ControlProps {
	id: string;
	name: string;
	"aria-describedby": string;
	"aria-invalid": boolean;
	"aria-labelledby": string;
	"aria-required": "true" | undefined;
	"data-remoform-control": string;
	"data-remoform-error": string | undefined;
	value: any;
}

// Component props interfaces
export interface FieldProps {
	form: Remoform;
	name: string;
	type?: 'text' | 'number' | 'checkbox' | 'radio' | 'file' | 'select' | 'select multiple';
	children: Snippet;
}

export interface LabelProps {
	children: Snippet;
}

export interface DescriptionProps {
	children: Snippet;
}

export interface FieldErrorsProps {
	// No additional props needed as it uses field context
}

export interface FieldsetProps {
	form: Remoform;
	name: string;
	children: Snippet;
}

export interface LegendProps {
	children: Snippet;
}

/**
 * Sets the form context for child components
 */
export function setFormContext(form: Remoform) {
	setContext(REMOFORM_FORM_CONTEXT_KEY, form);
}

/**
 * Gets the form context
 */
export function getFormContext(): Remoform {
	const form = getContext<Remoform>(REMOFORM_FORM_CONTEXT_KEY);
	if (!form) {
		throw new Error(
			"Form context not found. Make sure to use form components within a Field component."
		);
	}
	return form;
}

/**
 * Sets the field context for child components
 */
export function setFieldContext(context: () => RemoformFieldContext) {
	setContext(REMOFORM_FIELD_CONTEXT_KEY, context());
}

/**
 * Gets the field context
 */
export function getFieldContext(): RemoformFieldContext {
	const context = getContext<RemoformFieldContext>(REMOFORM_FIELD_CONTEXT_KEY);
	if (!context) {
		throw new Error(
			"Field context not found. Make sure to use this component within a Field component."
		);
	}
	return context;
}

/**
 * Generates a unique ID for form elements
 */
export function generateId(prefix: string = "remoform"): string {
	return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

// CreateForm options interface
export interface CreateFormOptions<TSchema extends StandardSchemaV1 = StandardSchemaV1> {
	// Core validation options
	validationMethod?: "auto" | "oninput" | "onblur" | "onsubmit" | "onchange";
	clearOnSubmit?: "errors-and-message" | "message" | "errors" | "none";

	// Preflight validation
	preflight?: boolean;
	schema?: TSchema extends StandardSchemaV1 ? TSchema : never;
	includeUntouched?: boolean;

	// Basic form options
	id?: string;
	resetForm?: boolean | (() => boolean);
	taintedMessage?: boolean | string | (() => Promise<boolean>);
	multipleSubmits?: "prevent" | "allow" | "abort";

	// Error handling
	scrollToError?: "auto" | "smooth" | "off" | boolean | ScrollIntoViewOptions;
	autoFocusOnError?: "detect" | boolean;
	errorSelector?: string;
	selectErrorText?: boolean;
}

// Extract required fields from a StandardSchema
function extractRequiredFields(schema: StandardSchemaV1): Set<string> {
	const requiredFields = new Set<string>();

	// Test with an empty object to see which fields are required
	const result = schema["~standard"].validate({});

	// Handle both sync and async validation results
	if (result instanceof Promise) {
		// For async validation, we can't determine required fields synchronously
		return requiredFields;
	}

	// Check if validation failed
	if ('issues' in result && result.issues) {
		for (const issue of result.issues) {
			if (issue.path && issue.path.length > 0) {
				const fieldName = String(issue.path[0]);
				// Common messages that indicate required fields
				if (
					issue.message?.toLowerCase().includes("required") ||
					issue.message?.toLowerCase().includes("missing")
				) {
					requiredFields.add(fieldName);
				}
			}
		}
	}

	return requiredFields;
}

// Infer field type from schema
function inferFieldType(schema: StandardSchemaV1, fieldPath: string): string {
	// Try to validate with different types of data to infer the field type
	const testData: Record<string, any> = {};
	
	// Test with a number
	testData[fieldPath] = 123;
	const numberResult = schema["~standard"].validate(testData);
	if (!(numberResult instanceof Promise) && 'value' in numberResult) {
		if (typeof numberResult.value?.[fieldPath] === 'number') {
			return 'number';
		}
	}
	
	// Test with a boolean
	testData[fieldPath] = true;
	const boolResult = schema["~standard"].validate(testData);
	if (!(boolResult instanceof Promise) && 'value' in boolResult) {
		if (typeof boolResult.value?.[fieldPath] === 'boolean') {
			return 'checkbox';
		}
	}
	
	// Test with a File object (in a try-catch since File might not exist in all environments)
	try {
		testData[fieldPath] = new File([''], 'test.txt');
		const fileResult = schema["~standard"].validate(testData);
		if (!(fileResult instanceof Promise) && 'value' in fileResult) {
			if (fileResult.value?.[fieldPath] instanceof File) {
				return 'file';
			}
		}
	} catch (e) {
		// File not available in this environment
	}
	
	// Default to text
	return 'text';
}

// Error handling utilities
export function scrollToError(
	form: HTMLFormElement,
	options: "auto" | "smooth" | "off" | boolean | ScrollIntoViewOptions = "auto"
) {
	if (options === "off" || options === false) return;

	const errorElement = form.querySelector('[aria-invalid="true"]') as HTMLElement;
	if (!errorElement) return;

	const scrollOptions: ScrollIntoViewOptions =
		typeof options === "object"
			? options
			: options === "smooth"
				? { behavior: "smooth", block: "center" }
				: { behavior: "auto", block: "center" };

	errorElement.scrollIntoView(scrollOptions);
}

export function autoFocusOnError(form: HTMLFormElement, options: "detect" | boolean = "detect") {
	if (options === false) return;

	const errorElement = form.querySelector('[aria-invalid="true"]') as HTMLInputElement;
	if (!errorElement) return;

	errorElement.focus();

	// Select text if it's an input field and selectErrorText is enabled
	if (
		errorElement.select &&
		(errorElement.type === "text" ||
			errorElement.type === "email" ||
			errorElement.type === "password")
	) {
		errorElement.select();
	}
}

// Main Remoform class that properly utilizes SvelteKit remote form features
export class Remoform<TSchema extends StandardSchemaV1 = StandardSchemaV1> {
	private originalRemoteForm: RemoformRemoteForm;
	public remoteForm: RemoformRemoteForm;
	private requiredFields: Set<string>;
	private fieldTypes: Map<string, string>;
	private formName: string;
	public readonly options: CreateFormOptions<TSchema>;

	constructor(originalRemoteForm: RemoformRemoteForm, options: CreateFormOptions<TSchema> = {}) {
		if (options.preflight && !options.schema) {
			throw new Error("Schema is required when preflight validation is enabled");
		}

		this.originalRemoteForm = originalRemoteForm;
		this.fieldTypes = new Map<string, string>();
		this.options = {
			validationMethod: "auto",
			clearOnSubmit: "errors-and-message",
			preflight: false,
			multipleSubmits: "prevent",
			scrollToError: "auto",
			autoFocusOnError: "detect",
			errorSelector: '[aria-invalid="true"]',
			selectErrorText: true,
			resetForm: false,
			...options,
		};

		// Apply preflight if enabled
		const remoteForm = $derived(
			this.options.preflight && this.options.schema
				? this.originalRemoteForm.preflight(this.options.schema)
				: this.originalRemoteForm
		);

		const enhancedForm = remoteForm.enhance(this.createEnhanceCallback);

		Object.getOwnPropertySymbols(remoteForm).forEach((symbol) => {
			const enhanceSymbol = Object.getOwnPropertySymbols(enhancedForm)[0];
			if (enhanceSymbol) {
				delete remoteForm[symbol];
				remoteForm[enhanceSymbol] = enhancedForm[enhanceSymbol];
			}
		});

		// Copy only enumerable properties from remoteForm (no symbols)
		this.remoteForm = Object.defineProperties(
			remoteForm,
			Object.getOwnPropertyDescriptors(this.formEventHandlers)
		);

		// Extract required fields from schema if provided
		this.requiredFields = this.options.schema
			? extractRequiredFields(this.options.schema)
			: new Set<string>();

		// Generate form name if not provided
		this.formName = this.options.id || `remoform-${Math.random().toString(36).substr(2, 9)}`;
	}

	private createEnhanceCallback = async ({
		form,
		data,
		submit,
	}: {
		form: HTMLFormElement;
		data: FormData;
		submit: () => Promise<any>;
	}) => {
		try {
			// Handle multiple submits prevention
			if (this.options.multipleSubmits === "prevent" && this.remoteForm.pending) {
				return;
			}
			console.log("enhance running");
			// Clear errors/messages based on clearOnSubmit option
			if (this.options.clearOnSubmit !== "none") {
				if (
					this.options.clearOnSubmit === "errors-and-message" ||
					this.options.clearOnSubmit === "errors"
				) {
					// this.remoteForm.issues = {}
				}
			}

			// Submit the form
			await submit();
			form.reset();
		} catch (error) {
			// Handle submission errors - SvelteKit will populate form.issues automatically
			console.error("Form submission error:", error);
		} finally {
			// Handle post-submit actions
			setTimeout(() => {
				if (this.remoteForm.issues && Object.keys(this.remoteForm.issues).length > 0) {
					// Handle error focusing and scrolling
					if (this.options.scrollToError !== "off" && this.options.scrollToError !== false) {
						scrollToError(form, this.options.scrollToError);
					}

					if (this.options.autoFocusOnError !== false) {
						autoFocusOnError(form, this.options.autoFocusOnError);
					}
				}
			}, 0);
		}
	};

	private createValidationHandler = (eventType: "input" | "blur" | "change") => {
		return (event: Event) => {
			const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
			if (!target?.name) return;

			// Check if this is a sensitive field (underscore prefix) - SvelteKit feature
			const isSensitive = target.name.startsWith("_");

			// Validate based on validation method using SvelteKit's form.validate()
			const shouldValidate =
				this.options.validationMethod === "auto" ||
				(this.options.validationMethod === "oninput" && eventType === "input") ||
				(this.options.validationMethod === "onblur" && eventType === "blur") ||
				(this.options.validationMethod === "onchange" && eventType === "change");

			if (shouldValidate && this.remoteForm.validate)
				this.remoteForm.validate({ includeUntouched: this.options?.includeUntouched || false });
		};
	};

	private get formEventHandlers() {
		return {
			...(this.options.validationMethod !== "onsubmit" && {
				oninput: this.createValidationHandler("input"),
				onblur: this.createValidationHandler("blur"),
				onchange: this.createValidationHandler("change"),
			}),
		};
	}

	// Enhanced field utility that works with schema-based required detection
	public isFieldRequired = (fieldName: string): boolean => {
		// Remove underscore prefix for sensitive fields when checking requirements
		const cleanFieldName = fieldName.startsWith("_") ? fieldName.slice(1) : fieldName;
		return this.requiredFields.has(cleanFieldName);
	};

	public get getRemoteForm(): RemoformRemoteForm {
		return this.remoteForm;
	}

	public get name(): string {
		return this.formName;
	}

	// Expose the field accessor from the RemoteForm
	// Access like: form.fields.fieldName or form.field.fieldName
	public get field() {
		return this.remoteForm.field;
	}
	
	// Alias for convenience - allows form.fields[name] syntax
	public get fields() {
		return new Proxy({} as any, {
			get: (target, prop: string) => {
				return this.remoteForm.field(prop);
			}
		});
	}

	// Get inferred or cached field type
	public getFieldType(fieldPath: string): string {
		// Check if we've already inferred this field's type
		if (this.fieldTypes.has(fieldPath)) {
			return this.fieldTypes.get(fieldPath)!;
		}

		// If no schema provided, default to 'text'
		if (!this.options.schema) {
			return 'text';
		}

		// Infer the type from schema
		const inferredType = inferFieldType(this.options.schema, fieldPath);
		this.fieldTypes.set(fieldPath, inferredType);
		return inferredType;
	}
}

// Helper function to create a Remoform instance
export function createForm<TSchema extends StandardSchemaV1 = StandardSchemaV1>(
	originalRemoteForm: RemoformRemoteForm,
	options: CreateFormOptions<TSchema> = {}
): Remoform {
	return new Remoform<TSchema>(originalRemoteForm, options);
}

/**
 * Helper to access nested field from form.fields using path notation
 * e.g., getFieldByPath(form.fields, 'user.email') or getFieldByPath(form.fields, 'items[0].name')
 */
export function getFieldByPath(fields: any, path: string): any {
	const parts = path.split(/[\.\[\]]+/).filter(Boolean);
	let current = fields;
	
	for (const part of parts) {
		if (current && typeof current === 'object' && part in current) {
			current = current[part];
		} else {
			return undefined;
		}
	}
	
	return current;
}