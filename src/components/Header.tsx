import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Store, BarChart2 } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">GroceryCompare</Link>
          <ul className="flex space-x-4 items-center">
            <li>
              <Link to="/" className="flex items-center hover:text-blue-200">
                <ShoppingCart className="mr-1" size={18} />
                Grocery List
              </Link>
            </li>
            <li>
              <Link to="/supermarkets" className="flex items-center hover:text-blue-200">
                <Store className="mr-1" size={18} />
                Supermarkets
              </Link>
            </li>
            <li>
              <Link to="/compare" className="flex items-center hover:text-blue-200">
                <BarChart2 className="mr-1" size={18} />
                Compare Prices
              </Link>
            </li>
            <li>
              <label htmlFor="country" className="mr-2">Country:</label>
              <select id="country" className="bg-blue-500 text-white p-1 rounded">
                <option value="Sweden">Sweden</option>
              </select>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
