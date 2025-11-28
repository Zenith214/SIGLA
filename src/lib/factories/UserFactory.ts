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
  role: 'admin' | 'interviewer' | 'officer' | 'fs';
  status: 'Active' | 'Inactive';
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
   * Create an officer
   */
  public officer(): this {
    return this.with({ 
      role: 'officer',
      jobTitle: 'Survey Officer'
    });
  }

  /**
   * Create a field supervisor
   */
  public fs(): this {
    return this.with({ 
      role: 'fs',
      jobTitle: 'Field Supervisor'
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
      status: 'Active',
      organization: 'SIGLA Survey Team',
      jobTitle: 'Field Interviewer'
    };
  }

  public async create(): Promise<User | User[]> {
    const data = this.make();
    const users = Array.isArray(data) ? data : [data];

    // Create users directly in database using Supabase admin client
    const created: User[] = [];

    for (const user of users) {
      try {
        const { data: createdUser, error } = await supabaseAdmin
          .from('user')
          .insert({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            password: user.password, // Note: In production, this should be hashed
            role: user.role,
            status: user.status,
            organization: user.organization,
            jobTitle: user.jobTitle,
            createdAt: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          console.warn(`Failed to create user ${user.email}:`, error.message);
        } else if (createdUser) {
          created.push(createdUser as User);
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
