# Backend Setup Instructions

Ensure you have Node.js (v12+) installed. Follow these steps to set up the backend:

1. **Install Dependencies**
   ```sh
   npm install
   ```

2. **Set Environment Variables**
   Create a `.env` file in the project root (where `index.html` is) and add:
   ```plaintext
   VITE_USER_FETCH_LOCATION=http://localhost:3000/get_player_data
   ```
   Adjust the value if your backend will run on a different address.

3. **Start the Server**
   ```sh
   npm start
   ```

4. **Optional**
   You can change the PORT inside the code, default is 3000.

Your backend server should now be running at `http://localhost:3000`. Access it there or adjust the `.env` if deployed elsewhere.
