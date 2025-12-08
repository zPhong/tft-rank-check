# TFT Profiles - IGN & Rank Display

A web application that fetches and displays Teamfight Tactics (TFT) player profiles including IGN (In-Game Name) and rank information from the MetaTFT API.

## Features

- 📊 Display multiple TFT player profiles
- 🎮 Show IGN, current rank, games played, rating, and peak rating
- 📈 Summary statistics across all profiles
- 🔄 Refresh functionality to update all profiles
- 📱 Responsive design for all devices
- ⚡ Fast parallel API fetching

## Setup

1. Clone this repository
2. Open `index.html` in a web browser, or
3. Deploy to GitHub Pages (see below)

## Configuration

Edit the `IGN_LIST` array in `index.html` to add or modify player profiles:

```javascript
const IGN_LIST = [
    {
        region: 'VN2',
        gameName: 'M%E1%BA%ADp%20M%C4%83m%20M%C4%83m', // URL-encoded game name
        tagLine: 'Pici0',
        displayName: 'Mập Măm Măm#Pici0'
    }
    // Add more profiles here...
];
```

**Note:** For special characters (like Vietnamese), you need to URL-encode the `gameName` field.

## GitHub Pages Deployment

This repository is configured for automatic deployment to GitHub Pages:

1. Go to your repository Settings
2. Navigate to Pages
3. Select the source branch (usually `main` or `master`)
4. The site will be available at `https://<username>.github.io/<repository-name>`

The GitHub Actions workflow will automatically deploy the site when you push changes to the main branch.

## API

This application uses the [MetaTFT API](https://api.metatft.com):
- Endpoint: `https://api.metatft.com/public/profile/refresh_by_riotid/{region}/{gameName}/{tagLine}`
- Method: GET

## License

MIT License - feel free to use and modify as needed.

