// We'll use localStorage for data persistence
// In a real-world scenario, you'd use an API to interact with the database

interface GroceryItem {
  _id: string;
  name: string;
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
  return Promise.resolve(getFromLocalStorage());
}

export async function addGroceryItem(item: { name: string }): Promise<GroceryItem[]> {
  const items = getFromLocalStorage();
  const newItem = { ...item, _id: Date.now().toString() };
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
