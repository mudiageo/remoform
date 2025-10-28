# Remoform

The powerful form library for SvelteKit built on remote functions. Remoform provides a seamless way to handle form validation, submission, and state management by leveraging SvelteKit's `form` remote function properties.

> **Heavily inspired by [Formsnap](https://formsnap.dev)** - This library builds upon the excellent work done on Formsnap, adapting their accessible form component patterns for SvelteKit's remote functions API.

## Installation

```bash
npm i remoform zod
# or with other schema libraries
npm i remoform valibot
```

## Features

- **Remote Validation**: Validate forms on the server using remote functions
- **Progressive Enhancement**: Works with and without JavaScript
- **Type Safety**: Full TypeScript support with schema inference  
- **Accessible**: Built-in accessibility features and ARIA attributes
- **Framework Agnostic**: Works with any validation library (Zod, Valibot, etc.)

## Usage

#### 1. Define your form schema

```ts
// lib/schemas.ts
import { z } from "zod";

export const userSchema = z.object({
	email: z.string().email("Please enter a valid email"),
	name: z.string().min(2, "Name must be at least 2 characters"),
	age: z.number().min(18, "Must be 18 or older"),
	preferences: z.object({
		newsletter: z.boolean().default(false),
		theme: z.enum(["light", "dark"]).default("light"),
	})
});

export type UserForm = z.infer<typeof userSchema>;
```

#### 2. Create your remote function

```ts
// routes/profile/demo.remote.ts
import * as v from 'valibot';
import { form, query } from '$app/server';

// In-memory store for demo purposes
let users: { id: string; email: string; name: string; age: number; bio?: string }[] = [];

// Query function to get all users
export const getUsers = query(async () => {
	return users;
});

// Query function to get user by ID
export const getUserById = query(v.string(), async (id) => {
	const user = users.find(u => u.id === id);
	if (!user) {
		throw new Error('User not found');
	}
	return user;
});

// Form function that creates a user
export const createUser = form(
	v.object({
		name: v.pipe(v.string(), v.nonEmpty('Name is required')),
		email: v.pipe(v.string(), v.email('Please enter a valid email')),
		age: v.pipe(v.string(), v.transform(Number), v.number('Age must be a number'), v.minValue(18, 'Must be at least 18')),
		_password: v.pipe(v.string(), v.minLength(8, 'Password must be at least 8 characters')), // Sensitive data with underscore
		bio: v.optional(v.string())
	}),
	async (data) => {
		// Simulate API delay
		await new Promise(resolve => setTimeout(resolve, 1000));
		
		const newUser = {
			id: Math.random().toString(36).substr(2, 9),
			...data
		};
		
		users.push(newUser);
		
		// Refresh the users query
		await getUsers().refresh();
		
		// Return success result
		return { 
			success: true, 
			message: `User ${data.name} created successfully!`,
			userId: newUser.id,
			user: newUser
		};
	}
);
```

#### 3. Use the form in your component

```svelte
<!-- routes/profile/+page.svelte -->
<script>
	import * as v from 'valibot';
	import { createForm, Field, Control, Label, Description, FieldErrors } from 'remoform';
	import { createUser } from './demo.remote.js';

	// Define your client-side schema
	const schema = v.object({
		email: v.pipe(v.string(), v.email('Please enter a valid email')),
		name: v.pipe(v.string(), v.nonEmpty('Name is required')),
		age: v.pipe(v.string(), v.transform(Number), v.number('Age must be a number'), v.minValue(18, 'Must be at least 18')),
		_password: v.pipe(v.string(), v.minLength(8, 'Password must be at least 8 characters')),
		bio: v.optional(v.string())
	});

	// Create form using the remote function
	const form = createForm(createUser, {
		preflight: true,
		includeUntouched: true,
		schema,
		validationMethod: 'oninput',
		scrollToError: 'smooth'
	});
</script>

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
		<Description>Enter your full name</Description>
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
		<Description>Must be 18 or older</Description>
		<FieldErrors />
	</Field>

	<!-- Sensitive field with underscore prefix -->
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
```

## Query Functions for Data Fetching

Remoform also supports query functions for reactive data fetching:

```svelte
<script>
	import { getUsers, getUserById } from './demo.remote.js';
</script>

<!-- Display all users -->
<div class="users-section">
	<h2>Users</h2>
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
```

## Configuration Options

```ts
const form = createForm(remoteFunction, {
	preflight: true,              // Validate on client before sending
	includeUntouched: true,       // Include untouched fields in validation
	schema,                       // Client-side validation schema
	validationMethod: 'oninput',  // When to validate ('oninput', 'onblur', etc.)
	scrollToError: 'smooth'       // Scroll behavior on validation errors
});
```

Check out the [documentation](https://remoform.dev) for more advanced usage and examples.