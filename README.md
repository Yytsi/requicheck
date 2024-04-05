# Realm of the Mad God Raid Requirement Checker

This tool is designed to help players of Realm of the Mad God (RotMG) calculate gear requirements for participating in Discord runs.

It can check for each character based on IGN whether it has sufficient gear for an exalted lost halls server run (8/8 + other requirements) and a separate convenient interface for selecting your character's equipment and automatically calculating if your setup meets the raid requirements.

# Main App Setup Instructions

This section outlines the steps to set up the main React application and integrate it with the backend.

If you're only concerned with the backend setup, refer to [here](https://github.com/Yytsi/requicheck/blob/main/documentation/user-data-server.md).

## Setup Steps

1. **Install Main App Dependencies**
   Navigate to the root folder of your React app and run:
   ```sh
   npm install
   ```

2. **Set Environment Variables**
   In the root folder, create a `.env` file and include a necessary environment variable (if you want to fetch player's character data by IGN), for example:
   ```plaintext
   VITE_USER_FETCH_LOCATION=http://localhost:3000/get_player_data
   ```
   Adjust the URL based on your backend configuration, but by default it's that (port 3000).

3. **Install Backend Dependencies**
   Navigate to the `fetch-player-data-backend` folder and install its dependencies:
   ```sh
   cd fetch-player-data-backend && npm install
   ```

4. **Start the Backend Server**
   In the `fetch-player-data-backend` folder, start the backend server:
   ```sh
   npm start
   ```

5. **Run the Main App**
   Return to the root folder and start your React app:
   ```sh
   cd .. && npm run dev
   ```

## Automation Script

For convenience, you can use the following script to automate the setup process. Save it as `setup.sh` and run it from the root folder:

```sh
#!/bin/bash

# Install main app dependencies
npm install

# Navigate to the backend folder and install its dependencies
cd fetch-player-data-backend && npm install

# Start the backend server in the background
npm start &

# Return to the root folder and start the React app
cd .. && npm run dev
```

Make the script executable with `chmod +x setup.sh` and run it using `./setup.sh`.

## Code Styling with Prettier

This project uses [Prettier](https://prettier.io) for code formatting. Ensure Prettier is set up in your editor for auto-formatting or run `npx prettier --write .` before commits (or not).


## Disclaimer

This app is not officially endorsed or affiliated with Realm of the Mad God, Deca Games, or any related entities. All images, data, and other content related to Realm of the Mad God used within this app are the property of their respective copyright owners. This app is intended for educational and informational purposes only, under fair use guidelines. We do not claim ownership of any copyrighted materials used in this app.

This project is hosted on [GitHub Pages](https://pages.github.com/).

## License

This project is made available under the MIT License. See the [LICENSE](LICENSE) file for more details. Please note that while this license applies to the code, it does not grant rights to use copyrighted materials owned by others. Users of this tool are responsible for ensuring their compliance with all relevant copyright laws and regulations.

## Contributing

Contributions to this project are welcome. Please feel free to fork the repository, make your changes, and submit a pull request. If you plan to use any additional copyrighted material, ensure you have the right to use it or that it falls under fair use.

## Contact

If you have any questions or suggestions, please feel free to [open an issue](https://github.com/yourgithubusername/yourrepositoryname/issues) on GitHub.
