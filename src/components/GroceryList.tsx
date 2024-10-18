import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import axios from 'axios';

interface GroceryItem {
  id: number;
  name: string;
  quantity: number;
}

const GroceryList: React.FC = () => {
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [recommendedItem, setRecommendedItem] = useState('');

  useEffect(() => {
    loadGroceryList();
  }, []);

  useEffect(() => {
    saveGroceryList();
  }, [groceryItems]);

  const loadGroceryList = () => {
    try {
      const savedItems = localStorage.getItem('groceryList');
      if (savedItems) {
        setGroceryItems(JSON.parse(savedItems));
      }
    } catch (error) {
      console.error('Error loading grocery list:', error);
    }
  };

  const saveGroceryList = () => {
    try {
      localStorage.setItem('groceryList', JSON.stringify(groceryItems));
      // Attempt to save to server
      fetch('http://localhost:3001/api/saveGroceryList', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(groceryItems),
      }).catch(error => console.error('Error saving to server:', error));
    } catch (error) {
      console.error('Error saving grocery list:', error);
    }
  };

  const addItem = () => {
    if (newItemName.trim().length > 2) {
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

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      addItem();
    }
  };

  const fetchRecommendedItem = async () => {
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: `Based on the current grocery list: ${groceryItems.map(item => item.name).join(', ')}, suggest a recommended item.` }
        ],
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      setRecommendedItem(response.data.choices[0].message.content.trim());
    } catch (error) {
      console.error('Error fetching recommended item:', error);
    }
  };

  const addRecommendedItem = () => {
    if (recommendedItem) {
      const newItem: GroceryItem = {
        id: Date.now(),
        name: recommendedItem,
        quantity: 1,
      };
      setGroceryItems([...groceryItems, newItem]);
    }
  };

  const removeItem = (id: number) => {
    setGroceryItems(groceryItems.filter(item => item.id !== id));
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Grocery List</h2>
        <button
          onClick={fetchRecommendedItem}
          disabled={groceryItems.length < 2}
          className="bg-green-500 text-white p-2 rounded mb-4 disabled:opacity-50"
        >
          Fetch Recommended Item
        </button>
        <button
          onClick={addRecommendedItem}
          disabled={!recommendedItem}
          className="bg-green-500 text-white p-2 rounded mb-4 disabled:opacity-50"
        >
          Add Recommended Item
        </button>
        <div className="flex mb-4">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyPress={handleKeyPress}
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
            disabled={newItemName.trim().length < 2}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
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
