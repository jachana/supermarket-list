import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface Supermarket {
  id: number;
  name: string;
}

const SupermarketList: React.FC = () => {
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
  const [newSupermarketName, setNewSupermarketName] = useState('');

  useEffect(() => {
    const savedSupermarkets = localStorage.getItem('supermarkets');
    if (savedSupermarkets) {
      setSupermarkets(JSON.parse(savedSupermarkets));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('supermarkets', JSON.stringify(supermarkets));
  }, [supermarkets]);

  const addSupermarket = () => {
    if (newSupermarketName.trim() !== '') {
      const newSupermarket: Supermarket = {
        id: Date.now(),
        name: newSupermarketName.trim(),
      };
      setSupermarkets([...supermarkets, newSupermarket]);
      setNewSupermarketName('');
    }
  };

  const removeSupermarket = (id: number) => {
    setSupermarkets(supermarkets.filter(supermarket => supermarket.id !== id));
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Supermarket List</h2>
        <div className="flex mb-4">
          <input
            type="text"
            value={newSupermarketName}
            onChange={(e) => setNewSupermarketName(e.target.value)}
            placeholder="Enter supermarket name"
            className="flex-grow mr-2 p-2 border rounded"
          />
          <button
            onClick={addSupermarket}
            className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
          >
            <Plus size={24} />
          </button>
        </div>
        <ul>
          {supermarkets.map((supermarket) => (
            <li key={supermarket.id} className="flex justify-between items-center mb-2 p-2 bg-gray-100 rounded">
              <span>{supermarket.name}</span>
              <button
                onClick={() => removeSupermarket(supermarket.id)}
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

export default SupermarketList;