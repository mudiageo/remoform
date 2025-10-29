<script>
	import * as v from "valibot";
	import { createForm, Field } from "$lib/index.js";
	import { createUser } from "../demo.remote.js";

	// Define your client-side schema
	const schema = v.object({
		email: v.pipe(v.string(), v.email("Please enter a valid email")),
		firstName: v.pipe(v.string(), v.nonEmpty("First name is required")),
		lastName: v.pipe(v.string(), v.nonEmpty("Last name is required")),
		age: v.pipe(
			v.string(),
			v.transform(Number),
			v.number("Age must be a number"),
			v.minValue(18, "Must be at least 18")
		),
		phoneNumber: v.optional(v.string()),
		bio: v.optional(v.string()),
	});

	// Create form with auto-labels and auto-errors enabled
	const form = createForm(createUser, {
		preflight: true,
		includeUntouched: true,
		schema,
		validationMethod: "oninput",
		scrollToError: "smooth",
		autoLabels: true, // Automatically generate labels from field names
		showErrors: true, // Automatically show errors
	});
</script>

<div class="container">
	<h1>Remoform - Form-Level Configuration</h1>
	<p>Auto-labels and auto-errors - configured once at the form level!</p>

	<div class="form-section">
		<h2>Create User Account (Auto-configured)</h2>

		<form {...form.remoteForm} class="demo-form">
			<!-- No Label or FieldErrors needed - configured at form level! -->
			<Field {form} name="email">
				<input type="text" placeholder="Enter your email" />
			</Field>

			<Field {form} name="firstName">
				<input type="text" placeholder="Enter your first name" />
			</Field>

			<Field {form} name="lastName">
				<input type="text" placeholder="Enter your last name" />
			</Field>

			<Field {form} name="age">
				<input type="number" placeholder="Enter your age" />
			</Field>

			<Field {form} name="phoneNumber">
				<input type="tel" placeholder="Enter your phone number" />
			</Field>

			<Field {form} name="bio">
				<textarea rows="4" placeholder="Tell us about yourself..."></textarea>
			</Field>

			<button type="submit" class="submit-button">Create Account</button>
		</form>

		{#if form.remoteForm.result?.success}
			<div class="success-message">
				<p>✅ User created successfully!</p>
				<p>User ID: {form.remoteForm.result.userId}</p>
			</div>
		{/if}
	</div>

	<div class="info-section">
		<h3>💡 Configuration Details</h3>
		<p>The form is configured with:</p>
		<ul>
			<li><code>autoLabels: true</code> - Labels are automatically generated from field names (e.g., "firstName" → "First Name")</li>
			<li><code>showErrors: true</code> - Errors are automatically displayed without needing FieldErrors component</li>
			<li>Optional: <code>labelTransform</code> - Custom function to transform field names to labels</li>
		</ul>
	</div>
</div>

<style>
	.container {
		max-width: 800px;
		margin: 2rem auto;
		padding: 0 1rem;
	}

	h1 {
		color: #1e293b;
		margin-bottom: 0.5rem;
	}

	h2 {
		color: #334155;
		margin-bottom: 1rem;
	}

	h3 {
		color: #475569;
		margin-bottom: 0.5rem;
	}

	.form-section {
		background: white;
		border-radius: 0.5rem;
		padding: 2rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		margin-bottom: 2rem;
	}

	.info-section {
		background: #f8fafc;
		border-radius: 0.5rem;
		padding: 1.5rem;
		border: 1px solid #e2e8f0;
	}

	.info-section ul {
		margin: 0.5rem 0 0 1.5rem;
		color: #475569;
	}

	.info-section li {
		margin-bottom: 0.5rem;
	}

	.info-section code {
		background: #e2e8f0;
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-family: monospace;
		font-size: 0.875rem;
	}

	.demo-form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	input,
	textarea {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		font-size: 1rem;
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	input:focus,
	textarea:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	input[aria-invalid="true"],
	textarea[aria-invalid="true"] {
		border-color: #ef4444;
	}

	textarea {
		resize: vertical;
		font-family: inherit;
	}

	.submit-button {
		background: #3b82f6;
		color: white;
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 0.375rem;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
	}

	.submit-button:hover {
		background: #2563eb;
	}

	.submit-button:disabled {
		background: #94a3b8;
		cursor: not-allowed;
	}

	.success-message {
		margin-top: 1rem;
		padding: 1rem;
		background: #dcfce7;
		border: 1px solid #86efac;
		border-radius: 0.375rem;
		color: #166534;
	}

	.success-message p {
		margin: 0.25rem 0;
	}
</style>
