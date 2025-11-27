/**
 * User Factory
 * Generates realistic user data for testing
 */

import { BaseFactory } from './BaseFactory';
import { supabaseAdmin } from '@/lib/supabase';

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'admin' | 'interviewer' | 'viewer';
  status: 'active' | 'inactive';
  organization?: string;
  jobTitle?: string;
}

export class UserFactory extends BaseFactory<User> {
  private static emailCounter = 1;

  /**
   * Create an interviewer
   */
  public interviewer(): this {
    return this.with({ 
      role: 'interviewer',
      jobTitle: 'Field Interviewer'
    });
  }

  /**
   * Create a viewer
   */
  public viewer(): this {
    return this.with({ 
      role: 'viewer',
      jobTitle: 'Data Analyst'
    });
  }

  /**
   * Create an admin
   */
  public admin(): this {
    return this.with({ 
      role: 'admin',
      jobTitle: 'System Administrator'
    });
  }

  protected definition(): User {
    const firstNames = ['Maria', 'Juan', 'Ana', 'Pedro', 'Rosa', 'Carlos', 'Elena', 'Miguel'];
    const lastNames = ['Santos', 'Cruz', 'Reyes', 'Garcia', 'Ramos', 'Torres', 'Flores', 'Mendoza'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${UserFactory.emailCounter++}@sigla.com`;

    return {
      firstName,
      lastName,
      email,
      password: 'password123',
      role: 'interviewer',
      status: 'active',
      organization: 'SIGLA Survey Team',
      jobTitle: 'Field Interviewer'
    };
  }

  public async create(): Promise<User | User[]> {
    const data = this.make();
    const users = Array.isArray(data) ? data : [data];

    // Create users via API endpoint
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const created: User[] = [];

    for (const user of users) {
      try {
        const response = await fetch(`${baseUrl}/api/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user)
        });

        if (response.ok) {
          const result = await response.json();
          created.push(result);
        } else {
          console.warn(`Failed to create user ${user.email}`);
        }
      } catch (error) {
        console.error(`Error creating user ${user.email}:`, error);
      }
    }

    this.reset();
    return Array.isArray(data) ? created : created[0];
  }
}

// Factory helper function
export function userFactory(): UserFactory {
  return new UserFactory();
}
