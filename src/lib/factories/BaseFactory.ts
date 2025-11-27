/**
 * Base Factory Class
 * Inspired by Laravel's factory pattern
 */

export abstract class BaseFactory<T> {
  protected count: number = 1;
  protected attributes: Partial<T> = {};

  /**
   * Set the number of models to create
   */
  public times(count: number): this {
    this.count = count;
    return this;
  }

  /**
   * Override default attributes
   */
  public with(attributes: Partial<T>): this {
    this.attributes = { ...this.attributes, ...attributes };
    return this;
  }

  /**
   * Generate a single model's data
   */
  protected abstract definition(): T;

  /**
   * Create and return model data (without persisting)
   */
  public make(): T | T[] {
    if (this.count === 1) {
      return { ...this.definition(), ...this.attributes };
    }

    return Array.from({ length: this.count }, () => ({
      ...this.definition(),
      ...this.attributes
    }));
  }

  /**
   * Create and persist model(s) to database
   */
  public abstract create(): Promise<T | T[]>;

  /**
   * Reset factory state
   */
  protected reset(): void {
    this.count = 1;
    this.attributes = {};
  }
}
