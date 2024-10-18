import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { addGroceryItem } from '../db/mongo';

interface GroceryItem {
  _id: string;
  name: string;
}

interface DishRecommendationProps {
  groceryItems: GroceryItem[];
  reloadGroceryList: () => void;
}

const DishRecommendation: React.FC<DishRecommendationProps> = ({ groceryItems, reloadGroceryList }) => {
  const [recommendedDish, setRecommendedDish] = useState('');

  useEffect(() => {
    fetchRecommendedDish();
  }, [groceryItems]);

  const fetchRecommendedDish = async () => {
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
    }
  };

  const addDishIngredients = async () => {
    if (recommendedDish) {
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
        
        reloadGroceryList();
        fetchRecommendedDish(); // Fetch a new dish recommendation
      } catch (error) {
        console.error('Error adding dish ingredients:', error);
      }
    }
  };

  return (
    <div>
      <button
        onClick={addDishIngredients}
        disabled={!recommendedDish}
        className="bg-purple-500 text-white p-2 rounded mb-4 disabled:opacity-50 flex-1"
      >
        Add ingredients for {recommendedDish || 'recommended dish'}
      </button>
    </div>
  );
};

export default DishRecommendation;
