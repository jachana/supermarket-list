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

const DishContainer: React.FC<{
  recommendedDish: string;
  dishImage: string;
  isLoading: boolean;
  addDishIngredients: () => void;
}> = ({ recommendedDish, dishImage, isLoading, addDishIngredients }) => {
  const [newDish, setNewDish] = useState('');

  const handleAddDish = () => {
    // Logic to add the new dish
    console.log('Adding dish:', newDish);
    setNewDish('');
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-4">
      <h3 className="text-lg font-semibold mb-2">Recommended Dish</h3>
      <div className="flex flex-col items-center mb-4">
        {dishImage && (
          <img src={dishImage} alt={recommendedDish} className="w-32 h-32 object-cover rounded-full mb-2" />
        )}
        <p className="text-center">{recommendedDish}</p>
        <button
          onClick={addDishIngredients}
          disabled={!recommendedDish || isLoading}
          className="bg-purple-500 text-white p-2 rounded mt-2 disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : `Add ingredients for ${recommendedDish || 'recommended dish'}`}
        </button>
      </div>
      <div className="flex">
        <input
          type="text"
          value={newDish}
          onChange={(e) => setNewDish(e.target.value)}
          placeholder="Add new dish"
          className="flex-grow p-2 border rounded-l"
        />
        <button
          onClick={handleAddDish}
          className="bg-blue-500 text-white px-4 py-2 rounded-r"
        >
          Add
        </button>
      </div>
    </div>
  );
};

const DishRecommendation: React.FC<DishRecommendationProps> = ({ groceryItems, setGroceryItems }) => {
  const [recommendedDish, setRecommendedDish] = useState('');
  const [dishImage, setDishImage] = useState('');
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
          { role: 'user', content: `Based on the current grocery list: ${groceryItems.map(item => item.name).join(', ')}, suggest a dish that can be made with some of these ingredients, pay extra atention to the ingredients that have not being bought yet` }
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

  const addDishIngredients = async () => {
    if (recommendedDish) {
      setIsLoading(true);
      setError('');
      try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a helpful assistant that provides ingredients for dishes. Respond with a comma-separated list of ingredients.' },
            { role: 'user', content: `Provide a list of ingredients for ${recommendedDish}. Only include ingredients that are not already in this list: ${groceryItems.map(item => item.name).join(', ')}. and only include ingredients that should be bought in the supermarket` }
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
        fetchRecommendedDish(); // Fetch a new dish recommendation
      } catch (error) {
        console.error('Error adding dish ingredients:', error);
        setError('Failed to add dish ingredients. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <DishContainer
        recommendedDish={recommendedDish}
        dishImage={dishImage}
        isLoading={isLoading}
        addDishIngredients={addDishIngredients}
      />
    </div>
  );
};

export default DishRecommendation;
