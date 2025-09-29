<script>
	import * as v from 'valibot';
	import { createForm, Field, Control, Label, Description, FieldErrors } from '$lib/index.js';
	import { createUser, getUsers } from './demo.remote.js';

	// Create the form with preflight validation and client-side schema
	const schema = v.object({
		name: v.pipe(v.string(), v.nonEmpty('Name is required')),
		email: v.pipe(v.string(), v.email('Please enter a valid email')),
		age: v.pipe(v.string(), v.transform(Number), v.number('Age must be a number'), v.minValue(18, 'Must be at least 18')),
		_password: v.pipe(v.string(), v.minLength(8, 'Password must be at least 8 characters')),
		bio: v.optional(v.string())
	});

	// Create form using the helper function
	const form = createForm(createUser, {
		preflight: true,
		includeUntouched: true,
		schema,
		validationMethod: 'oninput',
		scrollToError: 'smooth'
	});

</script>

<div class="container">
	<h1>Remoform - SvelteKit Remote Functions</h1>
	<p>A modern form library built on SvelteKit's remote functions API with Valibot validation</p>
	
	<div class="form-section">
		<h2>Create User Account</h2>
		
		<!-- The form object can be spread directly, providing all HTML attributes -->
		<form {...form.remoteForm} class="example-form">
		<Field {form} name="email">
			<Label>Email Address</Label>
			<Control>
				{#snippet children({ props })}
					<input 
						type="email" 
						{...props} 
						class="input"
					/>
				{/snippet}
			</Control>
			<Description>We'll send you important updates via email.</Description>
			<FieldErrors />
		</Field>

		<Field {form} name="name">
			<Label>Full Name</Label>
			<Control>
				{#snippet children({ props })}
					<input 
						type="text" 
						{...props} 
						class="input"
					/>
				{/snippet}
			</Control>
			<Description>Enter your full name as it appears on official documents</Description>
			<FieldErrors />
		</Field>

		<Field {form} name="age">
			<Label>Age</Label>
			<Control>
				{#snippet children({ props })}
					<input 
						type="number" 
						{...props} 
						class="input"
					/>
				{/snippet}
			</Control>
			<Description>Must be 18 or older to create an account</Description>
			<FieldErrors />
		</Field>

		<!-- Sensitive field with underscore prefix - won't be sent back on validation errors -->
		<Field {form} name="_password">
			<Label>Password</Label>
			<Control>
				{#snippet children({ props })}
					<input 
						type="password" 
						{...props} 
						class="input"
					/>
				{/snippet}
			</Control>
			<Description>Choose a strong password (min 8 characters)</Description>
			<FieldErrors />
		</Field>

		<Field {form} name="bio">
			<Label>Bio (Optional)</Label>
			<Control>
				{#snippet children({ props })}
					<textarea 
						{...props} 
						class="textarea"
						rows="3"
					></textarea>
				{/snippet}
			</Control>
			<Description>Tell us a bit about yourself</Description>
			<FieldErrors />
		</Field>

		<button type="submit" class="submit-button">
			Create Account
		</button>
	</form>

	{#if form.remoteForm.result?.success}
		<div class="success-message">
			<p>✅ User created successfully!</p>
			<p>User ID: {form.remoteForm.result.userId}</p>
		</div>
	{/if}
</div>

<div class="live-section">
	<h2>Form State (Live)</h2>
	<div class="state-display">
		<h3>Current Input</h3>
		<pre class="values-display">{JSON.stringify(form.remoteForm.input, null, 2)}</pre>
		
		{#if form.remoteForm.issues && Object.keys(form.remoteForm.issues).length > 0}
			<h3>Validation Issues</h3>
			<pre class="errors-display">{JSON.stringify(form.remoteForm.issues, null, 2)}</pre>
		{/if}
	</div>
</div>

<div class="users-section">
	<h2>Users</h2>
	<div class="users-container">
		{#await getUsers()}
			<p>Loading users...</p>
		{:then users}
			{#each users as user (user.id)}
				<div class="user-card">
					<h3>{user.name}</h3>
					<p><strong>Email:</strong> {user.email}</p>
					{#if user.bio}
						<p><strong>Bio:</strong> {user.bio}</p>
					{/if}
					<p><strong>Age:</strong> {user.age}</p>
				</div>
			{/each}
		{:catch error}
			<p>Error loading users: {error.message}</p>
		{/await}
	</div>
</div>
</div>
<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
		font-family: system-ui, sans-serif;
	}

	.form-section, .live-section, .users-section {
		margin-bottom: 3rem;
	}

	.example-form {
		background: #f9fafb;
		padding: 2rem;
		border-radius: 0.5rem;
		border: 1px solid #e5e7eb;
	}

	.input, .textarea, .select {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		font-size: 1rem;
		transition: border-color 0.15s ease-in-out;
	}

	.input:focus, .textarea:focus, .select:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
		transition: background-color 0.15s ease-in-out;
	}

	.submit-button:hover {
		background: #2563eb;
	}

	.success-message {
		background: #f0fdf4;
		border: 1px solid #bbf7d0;
		border-radius: 0.5rem;
		padding: 1rem;
		margin-top: 1rem;
		color: #166534;
	}

	.state-display {
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 0.5rem;
		padding: 1.5rem;
	}

	.values-display, .errors-display {
		background: #f3f4f6;
		padding: 1rem;
		border-radius: 0.375rem;
		border: 1px solid #e5e7eb;
		font-family: monospace;
		font-size: 0.875rem;
		overflow-x: auto;
		margin-top: 0.5rem;
	}

	.errors-display {
		background: #fef2f2;
		border-color: #fecaca;
		color: #991b1b;
	}

	.user-card {
		background: white;
		padding: 1.5rem;
		border-radius: 0.5rem;
		border: 1px solid #e5e7eb;
		margin-bottom: 1rem;
	}

	.user-card h3 {
		margin: 0 0 1rem 0;
		color: #1f2937;
	}

	.user-card p {
		margin: 0.5rem 0;
		color: #6b7280;
	}

	h1, h2, h3 {
		color: #1f2937;
	}

	h1 {
		margin-bottom: 0.5rem;
	}

	h2 {
		margin-bottom: 1rem;
	}

	/* Global styles for remoform components */
	:global(.remoform-field) {
		margin-bottom: 1.5rem;
	}

	:global(.remoform-field label) {
		display: block;
		font-weight: 600;
		margin-bottom: 0.5rem;
		color: #374151;
	}

	:global(.remoform-field input[aria-invalid="true"]),
	:global(.remoform-field textarea[aria-invalid="true"]) {
		border-color: #ef4444;
		box-shadow: 0 0 0 1px #ef4444;
	}

	:global(.remoform-field-errors) {
		margin-top: 0.5rem;
	}

	:global(.remoform-error) {
		color: #ef4444;
		font-size: 0.875rem;
	}
</style>
