# Grocery Price Comparison App

This application allows users to create and manage a grocery list, with the added functionality of persisting the list between sessions and recommending dishes based on the current grocery items.

## Setup

1. Make sure you have Node.js installed on your system.

2. Install the project dependencies by running the following command in the project root directory:

   ```
   npm install
   ```

   If you encounter any issues, try removing the `node_modules` folder and the `package-lock.json` file, then run `npm install` again:

   ```
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Create a `.env` file in the project root directory and add your OpenAI API key:

   ```
   OPENAI_API_KEY=your_api_key_here
   ```

## Running the Application

To run both the React frontend and the Express backend concurrently, use the following command:

```
npm start
```

This will start the Vite development server for the React app and the Express server for handling API requests.

The React app will be available at `http://localhost:3000` (or another port if 3000 is in use).
The Express server will run on `http://localhost:3001`.

## Features

- Create and manage a grocery list
- Persist the grocery list between sessions using local storage and server-side storage
- Fetch recommended items based on the current grocery list
- Recommend dishes based on the current grocery items and add their ingredients to the list

## How to Use

1. Add items to your grocery list using the input field and the "+" button.
2. Use the "Add recommended item" button to add a suggested item based on your current list.
3. Use the "Add ingredients for recommended dish" button to get a dish suggestion based on your current items and add its ingredients to your list.
4. Remove items from your list by clicking the trash icon next to each item.

## File Structure

- `src/components/GroceryList.tsx`: Main component for the grocery list functionality
- `src/components/DishRecommendation.tsx`: Component for dish recommendations
- `server.js`: Express server for handling API requests and saving the grocery list
- `groceryList.json`: JSON file for storing the grocery list on the server

## Notes

- The grocery list is saved both in the browser's local storage and on the server.
- If there are any issues with saving to the server, the list will still be available in local storage.
- Make sure to keep your OpenAI API key secure and do not share it publicly.
- The dish recommendation feature uses OpenAI's API to suggest dishes and their ingredients based on your current grocery list.

## Troubleshooting

If you encounter any issues with running the application, try the following steps:

1. Ensure all dependencies are correctly installed by running:
   ```
   npm install
   ```

2. If the issue persists, try removing the `node_modules` folder and `package-lock.json` file, then reinstall:
   ```
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Make sure your Node.js version is compatible with the project. This project was tested with Node.js version 14.x and above.

4. If you're having issues with the OpenAI API, check that your API key is correctly set in the `.env` file and that you have sufficient credits on your OpenAI account.

If you continue to experience problems, please open an issue on the project repository with details about the error and your environment.
