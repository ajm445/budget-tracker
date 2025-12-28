/**
 * Storage Adapter Interface
 * Platform-agnostic storage abstraction for web (localStorage) and mobile (AsyncStorage)
 */
export interface StorageAdapter {
  /**
   * Get an item from storage
   * @param key - The key to retrieve
   * @returns The stored value or null if not found
   */
  getItem(key: string): Promise<string | null>;

  /**
   * Set an item in storage
   * @param key - The key to store
   * @param value - The value to store
   */
  setItem(key: string, value: string): Promise<void>;

  /**
   * Remove an item from storage
   * @param key - The key to remove
   */
  removeItem(key: string): Promise<void>;

  /**
   * Clear all items from storage (optional)
   */
  clear?(): Promise<void>;

  /**
   * Get all keys from storage (optional)
   */
  getAllKeys?(): Promise<readonly string[]>;
}
