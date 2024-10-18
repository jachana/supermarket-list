import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { addGroceryItem, getGroceryItems } from '../db/mongo';

interface GroceryItem {
  _id: string;
  name: string;
  completed: boolean;
}

interface DishRecommendationProps {
  groceryItems: GroceryItem[];
  setGroceryItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
}

const DishRecommendation: React.FC<DishRecommendationProps> = ({ groceryItems, setGroceryItems }) => {
  const [recommendedDish, setRecommendedDish] = useState('');
  const [dishImage, setDishImage] = useState('');
  const [newDishName, setNewDishName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecommendedDish();
  }, [groceryItems]);

  useEffect(() => {
    if (recommendedDish) {
      fetchDishImage();
    }
  }, [recommendedDish]);

  const fetchRecommendedDish = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that recommends dishes based on available ingredients. Respond with only the name of a single dish.' },
          { role: 'user', content: `Based on the current grocery list: ${groceryItems.map(item => item.name).join(', ')}, suggest a dish that can be made with some of these ingredients, pay extra attention to the ingredients that have not been bought yet` }
        ],
      }, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      setRecommendedDish(response.data.choices[0].message.content.trim());
    } catch (error) {
      console.error('Error fetching recommended dish:', error);
      setError('Failed to fetch recommended dish. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDishImage = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.post('https://api.openai.com/v1/images/generations', {
        prompt: `A delicious ${recommendedDish}, food photography`,
        n: 1,
        size: "256x256"
      }, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      setDishImage(response.data.data[0].url);
    } catch (error) {
      console.error('Error fetching dish image:', error);
      setError('Failed to fetch dish image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const addDishIngredients = async (dishName: string) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that provides ingredients for dishes. Respond with a comma-separated list of ingredients.' },
          { role: 'user', content: `Provide a list of ingredients for ${dishName}. Only include ingredients that are not already in this list: ${groceryItems.map(item => item.name).join(', ')}. and only include ingredients that should be bought in the supermarket` }
        ],
      }, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      
      const ingredients = response.data.choices[0].message.content.split(',').map((item: string) => item.trim());
      
      for (const ingredient of ingredients) {
        await addGroceryItem({ name: ingredient, completed: false });
      }
      
      const updatedItems = await getGroceryItems();
      setGroceryItems(updatedItems);
      if (dishName === recommendedDish) {
        fetchRecommendedDish();
      }
      setNewDishName('');
    } catch (error) {
      console.error('Error adding dish ingredients:', error);
      setError('Failed to add dish ingredients. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRecommendedDish = () => {
    if (recommendedDish) {
      addDishIngredients(recommendedDish);
    }
  };

  const handleAddCustomDish = () => {
    if (newDishName.trim().length > 2) {
      addDishIngredients(newDishName.trim());
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleAddCustomDish();
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-4">
      <h3 className="text-lg font-semibold mb-2">Dish Recommendation</h3>
      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="flex flex-col items-center mb-4">
        {dishImage && (
          <img src={dishImage} alt={recommendedDish} className="w-32 h-32 object-cover rounded-full mb-2" />
        )}
        <p className="text-center">{recommendedDish || 'Loading...'}</p>
        <button
          onClick={handleAddRecommendedDish}
          disabled={!recommendedDish || isLoading}
          className="bg-purple-500 text-white px-4 py-2 rounded mt-2 w-full disabled:opacity-50"
        >
          Add ingredients for {recommendedDish || 'recommended dish'}
        </button>
      </div>
      <div className="flex mt-4">
        <input
          type="text"
          value={newDishName}
          onChange={(e) => setNewDishName(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter dish name"
          className="flex-grow mr-2 p-2 border rounded"
        />
        <button
          onClick={handleAddCustomDish}
          disabled={newDishName.trim().length < 2 || isLoading}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default DishRecommendation;
