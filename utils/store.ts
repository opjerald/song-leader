import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Save data to AsyncStorage
 * @param key - The key under which the data is stored
 * @param value - The value to store (stringified for non-strings)
 */
export async function createData(key: string, value: any): Promise<void> {
  try {
    const stringValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, stringValue);
    console.log(`Saved data: ${key} = ${stringValue}`);
  } catch (error) {
    console.error(`Error saving data: ${error}`);
    throw error;
  }
}

/**
 * Retrieve data from AsyncStorage
 * @param key - The key to retrieve the data for
 * @returns The parsed data (if JSON) or raw string, or null if not found
 */
export async function readData<T>(key: string): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch (error) {
    console.error(`Error reading data: ${error}`);
    throw error;
  }
}

/**
 * Update data in AsyncStorage
 * @param key - The key to update the data for
 * @param newValue - The new value to store
 */
export async function updateData(key: string, newValue: any): Promise<void> {
  try {
    const existingData = await AsyncStorage.getItem(key);
    if (existingData === null) {
      throw new Error(`Cannot update non-existent data for key: ${key}`);
    }
    const stringValue = JSON.stringify(newValue);
    await AsyncStorage.setItem(key, stringValue);
    console.log(`Updated data: ${key} = ${stringValue}`);
  } catch (error) {
    console.error(`Error updating data: ${error}`);
    throw error;
  }
}

/**
 * Delete data from AsyncStorage
 * @param key - The key to delete
 */
export async function deleteData(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
    console.log(`Deleted data for key: ${key}`);
  } catch (error) {
    console.error(`Error deleting data: ${error}`);
    throw error;
  }
}

/**
 * Clear all data from AsyncStorage
 */
export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.clear();
    console.log('Cleared all AsyncStorage data.');
  } catch (error) {
    console.error(`Error clearing AsyncStorage: ${error}`);
    throw error;
  }
}
