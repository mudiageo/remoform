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
- **Simplified API**: Multiple API levels from ultra-simple to fully customizable

## Quick Start - Simplified API

Remoform offers **four different API levels** to match your needs. Start simple and add complexity only when needed:

### 1. Form-Level Configuration (Least code!)

Configure once at the form level, then just write inputs:

```svelte
<script>
	import { createForm, Field } from "remoform";
	import { createUser } from "./demo.remote.js";
	
	const form = createForm(createUser, { 
		schema,
		autoLabels: true,  // Auto-generate labels from field names
		showErrors: true   // Auto-show errors
	});
</script>

<form {...form.remoteForm}>
	<!-- Just the field and input - labels and errors are automatic! -->
	<Field {form} name="email">
		<input type="text" />
	</Field>
	
	<Field {form} name="firstName">
		<input type="text" />
	</Field>
	
	<button type="submit">Submit</button>
</form>
```

### 2. Ultra-Simple Components

Single-line components with everything built-in:

```svelte
<script>
	import { createForm, Input, TextField, NumberField, TextareaField } from "remoform";
	import { createUser } from "./demo.remote.js";
	
	const form = createForm(createUser, { schema });
</script>

<form {...form.remoteForm}>
	<!-- Single-line components with auto-inferred types -->
	<Input {form} name="email" label="Email" description="We'll send updates" />
	<TextField {form} name="name" label="Full Name" />
	<NumberField {form} name="age" label="Age" />
	<TextareaField {form} name="bio" label="Bio" rows={4} />
	
	<button type="submit">Submit</button>
</form>
```

### 3. Direct Input (No Control wrapper)

Field automatically binds to direct child inputs:

```svelte
<script>
	import { createForm, Field, Label, FieldErrors } from "remoform";
</script>

<form {...form.remoteForm}>
	<!-- No Control wrapper needed! -->
	<Field {form} name="email">
		<Label>Email</Label>
		<input type="text" />
		<FieldErrors />
	</Field>
</form>
```

### 4. Full Control (Maximum flexibility)

Use Control component with snippets for complete customization:

```svelte
<script>
	import { createForm, Field, Label, Control, Description, FieldErrors } from "remoform";
</script>

<form {...form.remoteForm}>
	<!-- Types are auto-inferred from schema! -->
	<Field {form} name="email">
		<Label>Email</Label>
		<Control>
			{#snippet children({ props })}
				<input {...props} />
			{/snippet}
		</Control>
		<Description>We'll send you updates</Description>
		<FieldErrors />
	</Field>
</form>
```

## Detailed Usage

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
	}),
});

export type UserForm = z.infer<typeof userSchema>;
```

#### 2. Create your remote function

```ts
// routes/profile/demo.remote.ts
import * as v from "valibot";
import { form, query } from "$app/server";

// In-memory store for demo purposes
let users: { id: string; email: string; name: string; age: number; bio?: string }[] = [];

// Query function to get all users
export const getUsers = query(async () => {
	return users;
});

// Query function to get user by ID
export const getUserById = query(v.string(), async (id) => {
	const user = users.find((u) => u.id === id);
	if (!user) {
		throw new Error("User not found");
	}
	return user;
});

// Form function that creates a user
export const createUser = form(
	v.object({
		name: v.pipe(v.string(), v.nonEmpty("Name is required")),
		email: v.pipe(v.string(), v.email("Please enter a valid email")),
		age: v.pipe(
			v.string(),
			v.transform(Number),
			v.number("Age must be a number"),
			v.minValue(18, "Must be at least 18")
		),
		_password: v.pipe(v.string(), v.minLength(8, "Password must be at least 8 characters")), // Sensitive data with underscore
		bio: v.optional(v.string()),
	}),
	async (data) => {
		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 1000));

		const newUser = {
			id: Math.random().toString(36).substr(2, 9),
			...data,
		};

		users.push(newUser);

		// Refresh the users query
		await getUsers().refresh();

		// Return success result
		return {
			success: true,
			message: `User ${data.name} created successfully!`,
			userId: newUser.id,
			user: newUser,
		};
	}
);
```

#### 3. Use the form in your component

```svelte
<!-- routes/profile/+page.svelte -->
<script>
	import * as v from "valibot";
	import { createForm, Field, Control, Label, Description, FieldErrors } from "remoform";
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

<!-- The form object can be spread directly, providing all HTML attributes -->
<form {...form.remoteForm} class="example-form">
	<Field {form} name="email" type="text">
		<Label>Email Address</Label>
		<Control>
			{#snippet children({ props })}
				<input type="email" {...props} class="input" />
			{/snippet}
		</Control>
		<Description>We'll send you important updates via email.</Description>
		<FieldErrors />
	</Field>

	<Field {form} name="name" type="text">
		<Label>Full Name</Label>
		<Control>
			{#snippet children({ props })}
				<input {...props} class="input" />
			{/snippet}
		</Control>
		<Description>Enter your full name</Description>
		<FieldErrors />
	</Field>

	<Field {form} name="age" type="number">
		<Label>Age</Label>
		<Control>
			{#snippet children({ props })}
				<input {...props} class="input" />
			{/snippet}
		</Control>
		<Description>Must be 18 or older</Description>
		<FieldErrors />
	</Field>

	<!-- Sensitive field with underscore prefix -->
	<Field {form} name="_password" type="text">
		<Label>Password</Label>
		<Control>
			{#snippet children({ props })}
				<input type="password" {...props} class="input" />
			{/snippet}
		</Control>
		<Description>Choose a strong password (min 8 characters)</Description>
		<FieldErrors />
	</Field>

	<Field {form} name="bio" type="text">
		<Label>Bio (Optional)</Label>
		<Control>
			{#snippet children({ props })}
				<textarea {...props} class="textarea" rows="3"></textarea>
			{/snippet}
		</Control>
		<Description>Tell us a bit about yourself</Description>
		<FieldErrors />
	</Field>

	<button type="submit" class="submit-button"> Create Account </button>
</form>

{#if form.remoteForm.result?.success}
	<div class="success-message">
		<p>✅ User created successfully!</p>
		<p>User ID: {form.remoteForm.result.userId}</p>
	</div>
{/if}
```

## Automatic Type Inference

Remoform automatically infers input types from your schema! When you provide a schema to `createForm`, the library will:
- Detect `number` types and use `type="number"`
- Detect `boolean` types and use checkboxes
- Detect `File` types and use file inputs
- Default to `type="text"` for strings

No need to specify `type` on your fields in most cases:

```svelte
<Field {form} name="age">  <!-- Automatically infers type="number" -->
  <Label>Age</Label>
  <Control>
    {#snippet children({ props })}
      <input {...props} />
    {/snippet}
  </Control>
</Field>
```

You can still override the inferred type when needed:

```svelte
<Field {form} name="email" type="email">  <!-- Override to use email input -->
  <Label>Email</Label>
  <Control>
    {#snippet children({ props })}
      <input {...props} />
    {/snippet}
  </Control>
</Field>
```

## Query Functions for Data Fetching

Remoform also supports query functions for reactive data fetching:

```svelte
<script>
	import { getUsers, getUserById } from "./demo.remote.js";
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
	preflight: true, // Validate on client before sending
	includeUntouched: true, // Include untouched fields in validation
	schema, // Client-side validation schema
	validationMethod: "oninput", // When to validate ('oninput', 'onblur', etc.)
	scrollToError: "smooth", // Scroll behavior on validation errors
});
```

## Accessing Field Data

You can access individual field data using the `fields` API from the form:

```svelte
<script>
	const form = createForm(createUser, options);

	// Access a specific field
	const emailField = $derived(form.fields.email);
	
	// Get field value
	const emailValue = $derived(emailField?.value());
	
	// Get field validation issues
	const emailIssues = $derived(emailField?.issues() || []);
	
	// Check if field has errors
	const hasEmailError = $derived(emailIssues.length > 0);
</script>

{#if hasEmailError}
	<p>Email has errors: {emailIssues[0].message}</p>
{/if}
```

## Working with Different Input Types

### Radio Buttons and Checkboxes

For radio and checkbox inputs that belong to the same field, pass the value as a second parameter to the `type` prop:

```svelte
<script>
	import { createForm, Field, Control, Label } from "remoform";
	import { survey } from "./demo.remote.js";

	const form = createForm(survey);
</script>

<form {...form.remoteForm}>
	<h2>Which operating system do you use?</h2>
	{#each ['windows', 'mac', 'linux'] as os}
		<Field {form} name="operatingSystem">
			<Label>
				<Control type="radio" value={os}>
					{#snippet children({ props })}
						<input {...props} />
					{/snippet}
				</Control>
				{os}
			</Label>
		</Field>
	{/each}

	<h2>Which languages do you write code in?</h2>
	{#each ['html', 'css', 'js'] as language}
		<Field {form} name="languages">
			<Label>
				<Control type="checkbox" value={language}>
					{#snippet children({ props })}
						<input {...props} />
					{/snippet}
				</Control>
				{language}
			</Label>
		</Field>
	{/each}

	<button>Submit</button>
</form>
```

### Select Inputs

```svelte
<Field {form} name="operatingSystem">
	<Label>Operating System</Label>
	<Control type="select">
		{#snippet children({ props })}
			<select {...props}>
				<option>windows</option>
				<option>mac</option>
				<option>linux</option>
			</select>
		{/snippet}
	</Control>
</Field>

<!-- Multiple select -->
<Field {form} name="languages">
	<Label>Programming Languages</Label>
	<Control type="select multiple">
		{#snippet children({ props })}
			<select {...props} multiple>
				<option>html</option>
				<option>css</option>
				<option>js</option>
			</select>
		{/snippet}
	</Control>
</Field>
```

### File Inputs

```svelte
<Field {form} name="photo">
	<Label>Profile Photo</Label>
	<Control type="file">
		{#snippet children({ props })}
			<input {...props} />
		{/snippet}
	</Control>
</Field>

<!-- Don't forget to add enctype to the form -->
<form {...form.remoteForm} enctype="multipart/form-data">
	<!-- fields -->
</form>
```

Check out the [documentation](https://remoform.dev) for more advanced usage and examples.
