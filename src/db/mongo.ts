// We'll use a placeholder for the MongoDB operations
// In a real-world scenario, you'd use an API to interact with the database

interface GroceryItem {
  _id?: string;
  name: string;
  quantity: number;
}

let groceryItems: GroceryItem[] = [];

export async function getGroceryItems(): Promise<GroceryItem[]> {
  // In a real app, this would fetch from an API
  return Promise.resolve(groceryItems);
}

export async function addGroceryItem(item: { name: string; quantity: number }): Promise<GroceryItem> {
  const newItem = { ...item, _id: Date.now().toString() };
  groceryItems.push(newItem);
  return Promise.resolve(newItem);
}

export async function removeGroceryItem(id: string): Promise<boolean> {
  const initialLength = groceryItems.length;
  groceryItems = groceryItems.filter(item => item._id !== id);
  return Promise.resolve(groceryItems.length < initialLength);
}
