import * as v from 'valibot';
import { form, query } from '$app/server';

let users:  { id: string; email: string; name: string; age: number; bio?: string }[] = [];


export const getUsers = query(async () => {
	return users;
});

export const getUserById = query(v.string(), async (id) => {
	const user = users.find(u => u.id === id);
	if (!user) {
		throw new Error('User not found');
	}
	return user;
});


// Simple remote form that creates a user
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
			userId: Math.random().toString(36).substr(2, 9),
			user: newUser
		};
	}
);

