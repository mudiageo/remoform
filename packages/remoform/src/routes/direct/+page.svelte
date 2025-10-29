<script>
	import * as v from "valibot";
	import { createForm, Field, Label, Description, FieldErrors } from "$lib/index.js";
	import { createUser } from "../demo.remote.js";

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
		bio: v.optional(v.string()),
		country: v.optional(v.string()),
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
	<h1>Remoform - Direct Input Demo</h1>
	<p>No Control wrapper needed - Field automatically binds props to inputs!</p>

	<div class="form-section">
		<h2>Create User Account (Direct Inputs)</h2>

		<form {...form.remoteForm} class="demo-form">
			<!-- Direct input - no Control wrapper needed! -->
			<Field {form} name="email">
				<Label>Email Address</Label>
				<input type="text" placeholder="Enter your email" />
				<Description>We'll send you important updates</Description>
				<FieldErrors />
			</Field>

			<Field {form} name="name">
				<Label>Full Name</Label>
				<input type="text" placeholder="Enter your full name" />
				<FieldErrors />
			</Field>

			<Field {form} name="age">
				<Label>Age</Label>
				<input type="number" placeholder="Enter your age" />
				<Description>Must be 18 or older</Description>
				<FieldErrors />
			</Field>

			<Field {form} name="bio">
				<Label>Bio (Optional)</Label>
				<textarea rows="4" placeholder="Tell us about yourself..."></textarea>
				<FieldErrors />
			</Field>

			<Field {form} name="country">
				<Label>Country</Label>
				<select>
					<option value="">Select a country</option>
					<option value="us">United States</option>
					<option value="uk">United Kingdom</option>
					<option value="ca">Canada</option>
					<option value="au">Australia</option>
				</select>
				<FieldErrors />
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

	.demo-form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	input,
	textarea,
	select {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		font-size: 1rem;
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	input:focus,
	textarea:focus,
	select:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	input[aria-invalid="true"],
	textarea[aria-invalid="true"],
	select[aria-invalid="true"] {
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
