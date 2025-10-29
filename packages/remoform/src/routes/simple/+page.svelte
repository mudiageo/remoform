<script>
	import * as v from "valibot";
	import { createForm, Input, TextField, NumberField, TextareaField } from "$lib/index.js";
	import { createUser } from "./demo.remote.js";

	// Define your client-side schema
	const schema = v.object({
		email: v.pipe(v.string(), v.email("Please enter a valid email")),
		name: v.pipe(v.string(), v.nonEmpty("Name is required")),
		age: v.pipe(
			v.string(),
			v.transform(Number),
			v.number("Age must be a number"),
			v.minValue(18, "Must be at least 18")
		),
		_password: v.pipe(v.string(), v.minLength(8, "Password must be at least 8 characters")),
		bio: v.optional(v.string()),
	});

	// Create form using the remote function
	const form = createForm(createUser, {
		preflight: true,
		includeUntouched: true,
		schema,
		validationMethod: "oninput",
		scrollToError: "smooth",
	});
</script>

<div class="container">
	<h1>Remoform - Simplified API Demo</h1>
	<p>Ultra-simple form components with automatic type inference</p>

	<div class="form-section">
		<h2>Create User Account (Simplified)</h2>

		<form {...form.remoteForm} class="simple-form">
			<!-- Single-line components! -->
			<Input {form} name="email" label="Email Address" description="We'll send you important updates" />
			
			<TextField {form} name="name" label="Full Name" placeholder="Enter your full name" />
			
			<NumberField {form} name="age" label="Age" description="Must be 18 or older" />
			
			<Input {form} name="_password" label="Password" type="text" description="Min 8 characters" placeholder="Enter password" />
			
			<TextareaField {form} name="bio" label="Bio (Optional)" rows={4} placeholder="Tell us about yourself..." />

			<button type="submit" class="submit-button">Create Account</button>
		</form>

		{#if form.remoteForm.result?.success}
			<div class="success-message">
				<p>✅ User created successfully!</p>
				<p>User ID: {form.remoteForm.result.userId}</p>
			</div>
		{/if}
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

	.form-section {
		background: white;
		border-radius: 0.5rem;
		padding: 2rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		margin-bottom: 2rem;
	}

	.simple-form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
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
