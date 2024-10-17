import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface GroceryItem {
  id: number;
  name: string;
  quantity: number;
}

const GroceryList: React.FC = () => {
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);

  useEffect(() => {
    const savedItems = localStorage.getItem('groceryItems');
    if (savedItems) {
      setGroceryItems(JSON.parse(savedItems));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('groceryItems', JSON.stringify(groceryItems));
  }, [groceryItems]);

  const addItem = () => {
    if (newItemName.trim() !== '') {
      const newItem: GroceryItem = {
        id: Date.now(),
        name: newItemName.trim(),
        quantity: newItemQuantity,
      };
      setGroceryItems([...groceryItems, newItem]);
      setNewItemName('');
      setNewItemQuantity(1);
    }
  };

  const removeItem = (id: number) => {
    setGroceryItems(groceryItems.filter(item => item.id !== id));
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Grocery List</h2>
        <div className="flex mb-4">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Enter item name"
            className="flex-grow mr-2 p-2 border rounded"
          />
          <input
            type="number"
            value={newItemQuantity}
            onChange={(e) => setNewItemQuantity(parseInt(e.target.value))}
            min="1"
            className="w-20 mr-2 p-2 border rounded"
          />
          <button
            onClick={addItem}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            <Plus size={24} />
          </button>
        </div>
        <ul>
          {groceryItems.map((item) => (
            <li key={item.id} className="flex justify-between items-center mb-2 p-2 bg-gray-100 rounded">
              <span>{item.name} (x{item.quantity})</span>
              <button
                onClick={() => removeItem(item.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={18} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GroceryList;