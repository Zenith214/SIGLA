/**
 * User Seeder
 * Seeds users with different roles
 */

import { BaseSeeder } from './BaseSeeder';
import { userFactory } from '../factories';

export class UserSeeder extends BaseSeeder {
  public async run(): Promise<void> {
    this.log('Seeding Users...');

    try {
      // Create interviewers
      this.log('Creating interviewers...');
      await userFactory()
        .interviewer()
        .times(5)
        .create();
      this.success('Created 5 interviewers');

      // Create viewers
      this.log('Creating viewers...');
      await userFactory()
        .viewer()
        .times(2)
        .create();
      this.success('Created 2 viewers');

      // Create admin
      this.log('Creating admin...');
      await userFactory()
        .admin()
        .with({ 
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin.test@sigla.com'
        })
        .create();
      this.success('Created 1 admin');

      this.success('User seeding complete!');
    } catch (error) {
      this.error(`User seeding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
}
