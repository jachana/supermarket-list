import React, { useState, useEffect } from 'react';

interface Supermarket {
  id: number;
  name: string;
}

const defaultSupermarkets = [
  { id: 1, name: 'Willys' },
  { id: 2, name: 'Ica' },
  { id: 3, name: 'Lidl' },
  { id: 4, name: 'Coop' }
];

const SupermarketList: React.FC = () => {
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>(() => {
    const savedSupermarkets = localStorage.getItem('supermarkets');
    return savedSupermarkets ? JSON.parse(savedSupermarkets) : defaultSupermarkets;
  });

  useEffect(() => {
    localStorage.setItem('supermarkets', JSON.stringify(supermarkets));
  }, [supermarkets]);

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Supermarkets in Sweden</h2>
        <ul>
          {supermarkets.map((supermarket) => (
            <li key={supermarket.id} className="flex justify-between items-center mb-2 p-2 bg-gray-100 rounded">
              <span>{supermarket.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SupermarketList;
