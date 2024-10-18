import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import GroceryList from './components/GroceryList';
import SupermarketList from './components/SupermarketList';
import PriceComparison from './components/PriceComparison';
import { getGroceryItems } from './db/mongo';

interface GroceryItem {
  _id: string;
  name: string;
}

function App() {
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);

  useEffect(() => {
    loadGroceryList();
  }, []);

  const loadGroceryList = async () => {
    try {
      const items = await getGroceryItems();
      setGroceryItems(items);
    } catch (error) {
      console.error('Error loading grocery list:', error);
    }
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<GroceryList groceryItems={groceryItems} setGroceryItems={setGroceryItems} reloadGroceryList={loadGroceryList} />} />
            <Route path="/supermarkets" element={<SupermarketList />} />
            <Route path="/compare" element={<PriceComparison />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
