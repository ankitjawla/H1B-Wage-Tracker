# H1B Wage Tracker

An interactive county-level choropleth map for exploring U.S. prevailing wages by occupation and wage level using official Department of Labor data. This application helps H1B visa applicants, employers, and immigration professionals understand prevailing wage requirements across different U.S. counties.

## 🎯 Features

- 🗺️ **Interactive Map**: Explore wage levels across all U.S. counties with an intuitive choropleth visualization
- 📊 **Real-time Statistics**: View coverage statistics showing how many counties match each wage level
- 🔍 **Occupation Search**: Search by job title or SOC (Standard Occupational Classification) code with autocomplete
- 💰 **Salary Calculator**: Input your annual salary to see which wage level applies in each county
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- 🎨 **Color-coded Visualization**: Easy-to-understand color scheme for different wage levels
- 📍 **County Details**: Click on any county to see detailed wage level information

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 16 or higher) - [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Mapbox Account** - [Sign up for free](https://account.mapbox.com/auth/signup/) to get your API token

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/ankitjawla/H1B-Wage-Tracker.git
cd H1B_Wage_Tracker
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- React 18
- Mapbox GL JS
- Vite
- Vercel Analytics

### 3. Configure Mapbox Token

The application requires a Mapbox access token to display the interactive map. Follow these steps:

1. **Get your Mapbox token:**
   - Sign up for a free account at [Mapbox](https://account.mapbox.com/auth/signup/)
   - Navigate to your [Account page](https://account.mapbox.com/access-tokens/)
   - Copy your default public token or create a new one

2. **Create environment file:**
   Create a `.env` file in the root directory of the project:

   ```bash
   touch .env
   ```

3. **Add your Mapbox token:**
   Open the `.env` file and add your token:

   ```env
   VITE_MAPBOX_TOKEN=your_mapbox_token_here
   ```

   Replace `your_mapbox_token_here` with your actual Mapbox access token.

   **Note:** The `.env` file is already in `.gitignore`, so your token won't be committed to version control.

### 4. Run the Application

#### Development Mode

Start the development server with hot module replacement:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the next available port). The dev server automatically reloads when you make changes to the code.

#### Build for Production

Create an optimized production build:

```bash
npm run build
```

This generates a `dist` folder with optimized and minified files ready for deployment.

#### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

This serves the production build locally so you can test it before deploying.

## 📖 How to Use

1. **Select an Occupation**: 
   - Use the autocomplete search to find your job title or SOC code
   - The search supports both job titles (e.g., "Software Developer") and SOC codes (e.g., "15-1132")
   - If you can't find your exact job title, try searching with a broader or more common job title

2. **Enter Your Salary**: 
   - Input your annual base salary in the salary field
   - The application automatically calculates the hourly rate (assuming 2080 hours per year)

3. **Explore the Map**: 
   - Counties are color-coded based on which wage level your salary falls under
   - Click on any county to see detailed information including:
     - County name and state
     - Wage level (I, II, III, or IV)
     - Level description (Entry, Qualified, Experienced, or Fully Competent)

4. **View Statistics**: 
   - The statistics panel shows how many counties match each wage level
   - This helps you understand the geographic distribution of wage levels for your occupation and salary

## 🎨 Wage Levels

The application uses four wage levels as defined by the Department of Labor:

- **Level I (Entry)**: Entry-level wage - Yellow (`#FEF3C7`)
- **Level II (Qualified)**: Qualified wage - Orange (`#F59E0B`)
- **Level III (Experienced)**: Experienced wage - Purple (`#8B5CF6`)
- **Level IV (Fully Competent)**: Fully competent wage - Dark Purple (`#4C1D95`)

Counties without data or where your salary is below Level I are shown in gray (`#F3F4F6`).

## 📁 Project Structure

```
H1B_Wage_Tracker/
├── public/
│   ├── counties.geojson          # GeoJSON data for U.S. counties
│   └── data/
│       └── soc/                  # SOC code wage data files
│           └── [SOC_CODE].json
├── src/
│   ├── App.jsx                   # Main application component
│   ├── main.jsx                  # Application entry point
│   ├── Map.jsx                   # Main map component with controls
│   ├── Map.css                   # Map component styles
│   ├── SocAutocomplete.jsx       # Occupation search autocomplete
│   ├── stateFpToAbbr.js          # State FIPS to abbreviation mapping
│   └── index.css                 # Global styles
├── index.html                    # HTML template
├── package.json                  # Project dependencies and scripts
├── .gitignore                    # Git ignore rules
├── LICENSE                       # License information
└── README.md                     # This file
```

## 🛠️ Technology Stack

- **React 18.3.1** - Modern React with hooks and concurrent features
- **Mapbox GL JS 3.5.0** - Interactive map rendering and visualization
- **Vite 5.4.0** - Fast build tool and development server
- **Vercel Analytics 1.6.1** - Web analytics integration

## 📊 Data Source

This application uses official wage data from the [Office of Foreign Labor Certification (OFLC)](https://flag.dol.gov/wage-data/wage-search) maintained by the U.S. Department of Labor. The data includes:

- Prevailing wage information by county
- Standard Occupational Classification (SOC) codes
- Four wage levels (I, II, III, IV) as defined by the Department of Labor

The wage data is processed and organized by SOC code and county for efficient lookup and visualization.

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Key Components

- **Map.jsx**: Main component handling map initialization, wage level calculations, and user interactions
- **SocAutocomplete.jsx**: Handles occupation search with autocomplete functionality
- **stateFpToAbbr.js**: Utility for converting state FIPS codes to abbreviations

### Environment Variables

- `VITE_MAPBOX_TOKEN` - Required Mapbox access token for map rendering

## 🌐 Deployment

The application can be deployed to any static hosting service. Popular options include:

- **Vercel**: Recommended for easy deployment with automatic builds
- **Netlify**: Another popular static hosting option
- **GitHub Pages**: Free hosting for public repositories

Make sure to set the `VITE_MAPBOX_TOKEN` environment variable in your hosting platform's configuration.

## 🤝 Contributing

Contributions are welcome! If you'd like to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Notes

- The application assumes 2080 working hours per year for salary calculations
- Wage data is updated periodically from the Department of Labor
- Some counties may not have data for all occupations
- For finding more job titles and SOC codes, use [O*NET Occupational Keyword Search](https://www.onetonline.org/find/result)

## 👤 Author

Created by [ankit.jawla](https://github.com/ankitjawla)

## 📄 License

See LICENSE file for details.

## 🔗 Links

- [Live Application](https://h1b-wage-tracker.vercel.app/)
- [GitHub Repository](https://github.com/ankitjawla/H1B-Wage-Tracker)
- [OFLC Wage Data](https://flag.dol.gov/wage-data/wage-search)
- [O*NET Occupational Search](https://www.onetonline.org/find/result)

---

**Disclaimer**: This application is for informational purposes only. For official prevailing wage determinations, please consult the Department of Labor's Office of Foreign Labor Certification.
