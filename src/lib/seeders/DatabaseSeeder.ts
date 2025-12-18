/**
 * Database Seeder
 * Main seeder that orchestrates all other seeders
 */

import { BaseSeeder } from './BaseSeeder';
import { UserSeeder } from './UserSeeder';
import { SpotSeeder } from './SpotSeeder';
import { AssignmentSeeder } from './AssignmentSeeder';

export class DatabaseSeeder extends BaseSeeder {
  public async run(): Promise<void> {
    console.log('\n🌱 Starting Database Seeding...\n');

    try {
      // Seed users first (interviewers needed for assignments)
      await this.call(UserSeeder);
      console.log('');

      // Seed spots (needed for assignments)
      await this.call(SpotSeeder);
      console.log('');

      // Seed assignments (assign spots to interviewers)
      await this.call(AssignmentSeeder);
      console.log('');

      console.log('🎉 Database Seeding Complete!\n');
    } catch (error) {
      console.error('\n💥 Database Seeding Failed:', error);
      throw error;
    }
  }
}
