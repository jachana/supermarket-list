import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import axios from 'axios';
import { addGroceryItem, removeGroceryItem, getGroceryItems, updateGroceryItem } from '../db/mongo';
import DishRecommendation from './DishRecommendation';

interface GroceryItem {
  _id: string;
  name: string;
  completed: boolean;
}

interface GroceryListProps {
  groceryItems: GroceryItem[];
  setGroceryItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
}

const GroceryList: React.FC<GroceryListProps> = ({ groceryItems, setGroceryItems }) => {
  const [newItemName, setNewItemName] = useState('');
  const [recommendedItem, setRecommendedItem] = useState('');

  useEffect(() => {
    fetchRecommendedItem();
  }, [groceryItems]);

  const addItem = async () => {
    if (newItemName.trim().length > 2) {
      const newItem = {
        name: newItemName.trim(),
        completed: false,
      };
      const updatedItems = await addGroceryItem(newItem);
      setGroceryItems(updatedItems);
      setNewItemName('');
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
          { role: 'system', content: 'You are a helpful assistant that helps choose grocery items to add to a list. Respond with only the name of a single grocery item.' },
          { role: 'user', content: `Based on the current grocery list: ${groceryItems.map(item => item.name).join(', ')}, suggest a recommended item.` }
        ],
      }, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      setRecommendedItem(response.data.choices[0].message.content.trim());
    } catch (error) {
      console.error('Error fetching recommended item:', error);
    }
  };

  const addRecommendedItem = async () => {
    if (recommendedItem) {
      const newItem = {
        name: recommendedItem,
        completed: false,
      };
      const updatedItems = await addGroceryItem(newItem);
      setGroceryItems(updatedItems);
    }
  };

  const removeItem = async (id: string) => {
    await removeGroceryItem(id);
    const updatedItems = await getGroceryItems();
    setGroceryItems(updatedItems);
  };

  const toggleItemCompletion = async (id: string) => {
    const item = groceryItems.find(item => item._id === id);
    if (item) {
      const updatedItems = await updateGroceryItem(id, { completed: !item.completed });
      setGroceryItems(updatedItems);
    }
  };

  // Sort items: incomplete items first, then completed items
  const sortedItems = [...groceryItems].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Grocery List</h2>
        <div className="flex space-x-2 mb-4">
          <button
            onClick={addRecommendedItem}
            disabled={!recommendedItem}
            className="bg-green-500 text-white p-2 rounded disabled:opacity-50 flex-1"
          >
            Add {recommendedItem || 'recommended item'}
          </button>
          <DishRecommendation groceryItems={groceryItems} setGroceryItems={setGroceryItems} />
        </div>
        <div className="flex mb-4">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter item name"
            className="flex-grow mr-2 p-2 border rounded"
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
          {sortedItems.map((item) => (
            <li key={item._id} className="mb-2">
              <div className="flex justify-between items-center p-2 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer">
                <span 
                  className={`flex-grow ${item.completed ? 'line-through text-gray-500' : ''}`}
                  onClick={() => toggleItemCompletion(item._id)}
                >
                  {item.name}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(item._id);
                  }}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GroceryList;
