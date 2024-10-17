import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, DollarSign } from 'lucide-react';

interface GroceryItem {
  id: number;
  name: string;
  quantity: number;
}

interface Supermarket {
  id: number;
  name: string;
}

interface Price {
  supermarketId: number;
  itemId: number;
  price: number;
}

const PriceComparison: React.FC = () => {
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
  const [prices, setPrices] = useState<Price[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedItems = localStorage.getItem('groceryItems');
    const savedSupermarkets = localStorage.getItem('supermarkets');
    if (savedItems) setGroceryItems(JSON.parse(savedItems));
    if (savedSupermarkets) setSupermarkets(JSON.parse(savedSupermarkets));
  }, []);

  const fetchPrices = async () => {
    setLoading(true);
    setError(null);
    try {
      // In a real application, this would be an API call to your backend
      // For this example, we'll simulate the API call with a timeout and random prices
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newPrices: Price[] = [];
      groceryItems.forEach(item => {
        supermarkets.forEach(supermarket => {
          newPrices.push({
            supermarketId: supermarket.id,
            itemId: item.id,
            price: parseFloat((Math.random() * 10 + 1).toFixed(2))
          });
        });
      });
      setPrices(newPrices);
    } catch (err) {
      setError('Failed to fetch prices. Please try again.');
    }
    setLoading(false);
  };

  const calculateTotal = (supermarketId: number) => {
    return groceryItems.reduce((total, item) => {
      const price = prices.find(p => p.supermarketId === supermarketId && p.itemId === item.id);
      return total + (price ? price.price * item.quantity : 0);
    }, 0);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Price Comparison</h2>
        <button
          onClick={fetchPrices}
          disabled={loading}
          className="mb-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? 'Fetching Prices...' : 'Fetch Latest Prices'}
        </button>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2">Item</th>
                {supermarkets.map(supermarket => (
                  <th key={supermarket.id} className="p-2">{supermarket.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groceryItems.map(item => (
                <tr key={item.id} className="border-b">
                  <td className="p-2">{item.name} (x{item.quantity})</td>
                  {supermarkets.map(supermarket => {
                    const price = prices.find(p => p.supermarketId === supermarket.id && p.itemId === item.id);
                    return (
                      <td key={supermarket.id} className="p-2 text-center">
                        {price ? `$${(price.price * item.quantity).toFixed(2)}` : '-'}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="font-bold bg-gray-100">
                <td className="p-2">Total</td>
                {supermarkets.map(supermarket => (
                  <td key={supermarket.id} className="p-2 text-center">
                    ${calculateTotal(supermarket.id).toFixed(2)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <h3 className="text-xl font-bold mb-2">Best Deal:</h3>
          {supermarkets.length > 0 && (
            <div className="bg-green-100 p-4 rounded-lg flex items-center justify-between">
              <div className="flex items-center">
                <ShoppingCart className="mr-2" size={24} />
                <span className="text-lg font-semibold">
                  {supermarkets.reduce((best, supermarket) => 
                    calculateTotal(supermarket.id) < calculateTotal(best.id) ? supermarket : best
                  ).name}
                </span>
              </div>
              <div className="flex items-center">
                <DollarSign className="mr-1" size={20} />
                <span className="text-xl font-bold">
                  {Math.min(...supermarkets.map(s => calculateTotal(s.id))).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceComparison;