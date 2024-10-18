import React from 'react';
import { Trash2 } from 'lucide-react';
import { removeGroceryItem, updateGroceryItem } from '../db/mongo';
import ItemRecommendation from './ItemRecommendation';
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
  const removeItem = async (id: string) => {
    await removeGroceryItem(id);
    setGroceryItems(groceryItems.filter(item => item._id !== id));
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
        <div className="flex flex-col space-y-4 mb-4">
          <ItemRecommendation groceryItems={groceryItems} setGroceryItems={setGroceryItems} />
          <DishRecommendation groceryItems={groceryItems} setGroceryItems={setGroceryItems} />
        </div>
        <ul className="mt-4">
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
