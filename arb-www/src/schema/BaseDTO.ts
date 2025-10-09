/**
 * Base abstract class for all Data Transfer Objects (DTOs)
 * Provides fromJSON and toJSON methods for serialization/deserialization
 */
export abstract class BaseDTO {
  /**
   * Create a DTO instance from JSON data
   * @param json - Raw JSON data
   * @returns DTO instance
   */
  static fromJSON<T extends BaseDTO>(this: new () => T, json: any): T {
    const instance = new this();
    Object.assign(instance, json);
    return instance;
  }

  /**
   * Convert DTO instance to JSON
   * @returns JSON representation of the DTO
   */
  toJSON(): any {
    return { ...this };
  }

  /**
   * Create multiple DTO instances from JSON array
   * @param jsonArray - Array of JSON data
   * @returns Array of DTO instances
   */
  static fromJSONArray<T extends BaseDTO>(
    this: new () => T,
    jsonArray: any[]
  ): T[] {
    return jsonArray.map((json) => (this as any).fromJSON(json));
  }
}
