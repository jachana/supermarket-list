import React, { useState, useEffect } from 'react';
import { ShoppingCart, DollarSign } from 'lucide-react';

interface GroceryItem {
  id: number;
  name: string;
  quantity?: number;
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

  useEffect(() => {
    const savedItems = localStorage.getItem('groceryItems');
    const savedSupermarkets = localStorage.getItem('supermarkets');
    if (savedItems) {
      const parsedItems: GroceryItem[] = JSON.parse(savedItems);
      setGroceryItems(parsedItems.map(item => ({...item, quantity: item.quantity || 1})));
    }
    if (savedSupermarkets) setSupermarkets(JSON.parse(savedSupermarkets));

    // Generate random prices
    const newPrices: Price[] = [];
    const items = savedItems ? JSON.parse(savedItems) : [];
    const markets = savedSupermarkets ? JSON.parse(savedSupermarkets) : [];
    
    items.forEach((item: GroceryItem) => {
      markets.forEach((supermarket: Supermarket) => {
        newPrices.push({
          supermarketId: supermarket.id,
          itemId: item.id,
          price: parseFloat((Math.random() * 10 + 1).toFixed(2))
        });
      });
    });
    setPrices(newPrices);
  }, []);

  const getPrice = (supermarketId: number, itemId: number): number => {
    const price = prices.find(p => p.supermarketId === supermarketId && p.itemId === itemId);
    return price ? price.price : 0;
  };

  const calculateTotal = (supermarketId: number): number => {
    return groceryItems.reduce((total, item) => {
      const price = getPrice(supermarketId, item.id);
      const quantity = item.quantity || 1;
      return total + (price * quantity);
    }, 0);
  };

  const formatPrice = (price: number): string => {
    return isNaN(price) ? '-' : `$${price.toFixed(2)}`;
  };

  if (groceryItems.length === 0 || supermarkets.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Price Comparison</h2>
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
              {groceryItems.map((item, index) => (
                <tr key={`item-${item.id || index}`} className="border-b">
                  <td className="p-2">{item.name} (x{item.quantity || 1})</td>
                  {supermarkets.map(supermarket => {
                    const price = getPrice(supermarket.id, item.id);
                    const totalPrice = price * (item.quantity || 1);
                    return (
                      <td key={`price-${item.id || index}-${supermarket.id}`} className="p-2 text-center">
                        {formatPrice(totalPrice)}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="font-bold bg-gray-100">
                <td className="p-2">Total</td>
                {supermarkets.map(supermarket => (
                  <td key={`total-${supermarket.id}`} className="p-2 text-center">
                    {formatPrice(calculateTotal(supermarket.id))}
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
                  {formatPrice(Math.min(...supermarkets.map(s => calculateTotal(s.id))))}
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
