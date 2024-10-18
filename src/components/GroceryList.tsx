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

const RecommendedItemContainer: React.FC<{
  recommendedItem: string;
  addItem: (itemName: string) => void;
}> = ({ recommendedItem, addItem }) => {
  const [newItemName, setNewItemName] = useState('');

  const handleAddRecommendedItem = () => {
    if (recommendedItem) {
      addItem(recommendedItem);
    }
  };

  const handleAddCustomItem = () => {
    if (newItemName.trim().length > 2) {
      addItem(newItemName.trim());
      setNewItemName('');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleAddCustomItem();
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-4">
      <h3 className="text-lg font-semibold mb-2">Recommended Item</h3>
      <div className="flex flex-col items-center mb-4">
        <div className="w-32 h-32 bg-gray-300 rounded-full mb-2 flex items-center justify-center">
          <span className="text-4xl">🛒</span>
        </div>
        <p className="text-center">{recommendedItem || 'Loading...'}</p>
        <button
          onClick={handleAddRecommendedItem}
          disabled={!recommendedItem}
          className="bg-green-500 text-white px-4 py-2 rounded mt-2 w-full disabled:opacity-50"
        >
          Add {recommendedItem || 'recommended item'}
        </button>
      </div>
      <div className="flex mt-4">
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter item name"
          className="flex-grow mr-2 p-2 border rounded"
        />
        <button
          onClick={handleAddCustomItem}
          disabled={newItemName.trim().length < 2}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
};

const GroceryList: React.FC<GroceryListProps> = ({ groceryItems, setGroceryItems }) => {
  const [recommendedItem, setRecommendedItem] = useState('');

  useEffect(() => {
    fetchRecommendedItem();
  }, [groceryItems]);

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

  const addItem = async (itemName: string) => {
    const newItem = {
      name: itemName,
      completed: false,
    };
    const updatedItems = await addGroceryItem(newItem);
    setGroceryItems(updatedItems);
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
          <RecommendedItemContainer
            recommendedItem={recommendedItem}
            addItem={addItem}
          />
          <DishRecommendation groceryItems={groceryItems} setGroceryItems={setGroceryItems} />
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
