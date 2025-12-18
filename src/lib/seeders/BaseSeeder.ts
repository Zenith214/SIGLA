/**
 * Base Seeder Class
 * Inspired by Laravel's seeder pattern
 */

export abstract class BaseSeeder {
  /**
   * Run the seeder
   */
  public abstract run(): Promise<void>;

  /**
   * Log seeding progress
   */
  protected log(message: string, emoji: string = '📝'): void {
    console.log(`${emoji} ${message}`);
  }

  /**
   * Log success
   */
  protected success(message: string): void {
    this.log(message, '✅');
  }

  /**
   * Log warning
   */
  protected warn(message: string): void {
    this.log(message, '⚠️');
  }

  /**
   * Log error
   */
  protected error(message: string): void {
    this.log(message, '❌');
  }

  /**
   * Call another seeder
   */
  protected async call(SeederClass: new () => BaseSeeder): Promise<void> {
    const seeder = new SeederClass();
    await seeder.run();
  }
}
