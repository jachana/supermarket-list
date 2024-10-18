import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { addGroceryItem } from '../db/mongo';

interface GroceryItem {
  _id: string;
  name: string;
  completed: boolean;
}

interface ItemRecommendationProps {
  groceryItems: GroceryItem[];
  setGroceryItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
}

const ItemRecommendation: React.FC<ItemRecommendationProps> = ({ groceryItems, setGroceryItems }) => {
  const [recommendedItem, setRecommendedItem] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecommendedItem();
  }, [groceryItems]);

  const fetchRecommendedItem = async () => {
    setIsLoading(true);
    setError('');
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
      setError('Failed to fetch recommended item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async (itemName: string) => {
    setIsLoading(true);
    setError('');
    try {
      const newItem = {
        name: itemName,
        completed: false,
      };
      const updatedItems = await addGroceryItem(newItem);
      setGroceryItems(updatedItems);
      setNewItemName('');
      fetchRecommendedItem();
    } catch (error) {
      console.error('Error adding item:', error);
      setError('Failed to add item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRecommendedItem = () => {
    if (recommendedItem) {
      addItem(recommendedItem);
    }
  };

  const handleAddCustomItem = () => {
    if (newItemName.trim().length > 2) {
      addItem(newItemName.trim());
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleAddCustomItem();
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-4">
      <h3 className="text-lg font-semibold mb-2">Item Recommendation</h3>
      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="flex flex-col items-center mb-4">
        <div className="w-32 h-32 bg-gray-300 rounded-full mb-2 flex items-center justify-center">
          <span className="text-4xl">🛒</span>
        </div>
        <p className="text-center">{recommendedItem || 'Loading...'}</p>
        <button
          onClick={handleAddRecommendedItem}
          disabled={!recommendedItem || isLoading}
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
          disabled={newItemName.trim().length < 2 || isLoading}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default ItemRecommendation;
