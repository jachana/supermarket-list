import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { addGroceryItem, getGroceryItems } from '../db/mongo';

interface GroceryItem {
  _id: string;
  name: string;
}

interface DishRecommendationProps {
  groceryItems: GroceryItem[];
  setGroceryItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
}

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
          { role: 'user', content: `Based on the current grocery list: ${groceryItems.map(item => item.name).join(', ')}, suggest a dish that can be made with some of these ingredients. pay extra focus to the latest ones` }
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
            { role: 'user', content: `Provide a list of ingredients for ${recommendedDish}. Only include ingredients that are not already in this list: ${groceryItems.map(item => item.name).join(', ')}.` }
          ],
        }, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        });
        
        const ingredients = response.data.choices[0].message.content.split(',').map((item: string) => item.trim());
        
        for (const ingredient of ingredients) {
          await addGroceryItem({ name: ingredient });
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
      {dishImage && (
        <img src={dishImage} alt={recommendedDish} className="w-32 h-32 object-cover rounded-full mb-4" />
      )}
      <button
        onClick={addDishIngredients}
        disabled={!recommendedDish || isLoading}
        className="bg-purple-500 text-white p-2 rounded mb-4 disabled:opacity-50 flex items-center justify-center"
      >
        {dishImage && <img src={dishImage} alt={recommendedDish} className="w-8 h-8 object-cover rounded-full mr-2" />}
        {isLoading ? 'Loading...' : `Add ingredients for ${recommendedDish || 'recommended dish'}`}
      </button>
    </div>
  );
};

export default DishRecommendation;
