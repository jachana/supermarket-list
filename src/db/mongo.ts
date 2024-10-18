// We'll use localStorage for data persistence
// In a real-world scenario, you'd use an API to interact with the database

interface GroceryItem {
  _id: string;
  name: string;
  completed: boolean;
}

const STORAGE_KEY = 'groceryItems';

function saveToLocalStorage(items: GroceryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function getFromLocalStorage(): GroceryItem[] {
  const items = localStorage.getItem(STORAGE_KEY);
  return items ? JSON.parse(items) : [];
}

export async function getGroceryItems(): Promise<GroceryItem[]> {
  const items = getFromLocalStorage();
  // Ensure all items have the 'completed' property
  return Promise.resolve(items.map(item => ({
    ...item,
    completed: item.completed ?? false
  })));
}

function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function addGroceryItem(item: { name: string; completed?: boolean }): Promise<GroceryItem[]> {
  const items = getFromLocalStorage();
  const newItem: GroceryItem = { 
    ...item, 
    _id: generateUniqueId(),
    completed: item.completed ?? false
  };
  const updatedItems = [...items, newItem];
  saveToLocalStorage(updatedItems);
  return Promise.resolve(updatedItems);
}

export async function removeGroceryItem(id: string): Promise<boolean> {
  const items = getFromLocalStorage();
  const initialLength = items.length;
  const updatedItems = items.filter(item => item._id !== id);
  saveToLocalStorage(updatedItems);
  return Promise.resolve(updatedItems.length < initialLength);
}

export async function updateGroceryItem(id: string, updates: Partial<GroceryItem>): Promise<GroceryItem[]> {
  const items = getFromLocalStorage();
  const updatedItems = items.map(item => 
    item._id === id ? { ...item, ...updates } : item
  );
  saveToLocalStorage(updatedItems);
  return Promise.resolve(updatedItems);
}
