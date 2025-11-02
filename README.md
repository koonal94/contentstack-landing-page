# ContentStack Landing Page

A modern, interactive React.js landing page inspired by ContentStack.com, built with enhanced design and user experience.

## Features

- 🎨 **Modern Design**: Beautiful, professional UI with gradient effects and smooth animations
- ⚡ **Fast Performance**: Built with Vite for lightning-fast development and production builds
- 📱 **Fully Responsive**: Looks perfect on desktop, tablet, and mobile devices
- 🎭 **Interactive Animations**: Smooth scroll animations powered by Framer Motion
- 🎯 **Clean Code**: Well-structured components with reusable patterns
- 🚀 **Production Ready**: Optimized for performance and SEO

## Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Next-generation frontend tooling
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library for React
- **Lucide React** - Beautiful icon library

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git (for version control - [download here](https://git-scm.com/downloads))

### Installation

1. **If cloning from GitHub:**
```bash
git clone <repository-url>
cd Project_two
```

   **Or if setting up a new project locally:**
```bash
# Navigate to your project folder
cd Project_two
```

2. **Connect to GitHub (if not already connected):**
   - See [`QUICK_START_GITHUB.md`](./QUICK_START_GITHUB.md) for quick setup
   - Or [`GITHUB_SETUP.md`](./GITHUB_SETUP.md) for detailed instructions

3. Install dependencies:
```bash
npm install
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Connect to Contentstack

Create these content types in your Contentstack stack (suggested minimal setup):

1) homepage (singleton)
- is_default: Boolean (set true on the entry you want live)
- navigation: Group
  - brand_name: Text
  - nav_items: Group (Multiple)
    - label: Text
    - href: Text
- hero: Group
  - eyebrow: Text
  - heading: Rich Text or Text (single line)
  - subheading: Text (multi line)
  - primary_cta: Text
  - secondary_cta: Text
  - stats: Group (Multiple)
    - value: Text
    - label: Text
- features: Group
  - items: Reference (Multiple) -> feature
- benefits: Group
  - title: Text
  - subtitle: Text
  - cards: Reference (Multiple) -> benefit_card
  - stats: Group (Multiple)
    - value: Text
    - label: Text
- testimonials: Group
  - items: Reference (Multiple) -> testimonial
- cta: Group
  - title: Text
  - subtitle: Text
  - primary_text: Text
  - secondary_text: Text
- footer: Group
  - link_groups: Reference (Multiple) -> footer_group

2) feature
- title: Text
- description: Text (multi line)
- icon: Text (use one of: Zap, Shield, Globe, Code, Layers, Infinity)
- color: Text (e.g., "from-blue-400 to-cyan-500")

3) benefit_card
- title: Text
- description: Text (multi line)
- bullets: Text (Multiple)

4) testimonial
- name: Text
- role: Text
- avatar_emoji: Text (e.g., "👩‍💼")
- rating: Number
- content: Text (multi line)

5) footer_group
- title: Text
- links: Group (Multiple)
  - label: Text
  - href: Text

Environment variables (create a `.env` file or copy from `.env.example`):

```
VITE_CONTENTSTACK_API_KEY=your_api_key
VITE_CONTENTSTACK_DELIVERY_TOKEN=your_delivery_token
VITE_CONTENTSTACK_ENVIRONMENT=your_environment
# Optional: US (default) | EU | AZURE_NA
VITE_CONTENTSTACK_REGION=US
# Optional: locale (defaults to en-us)
VITE_CONTENTSTACK_LOCALE=en-us
# Optional: content type UID and entry UID override
VITE_CONTENTSTACK_CONTENT_TYPE_UID=homepage
VITE_CONTENTSTACK_ENTRY_UID=

# Live Preview
# Set to true to enable, requires stack Live Preview config below
VITE_CONTENTSTACK_LIVE_PREVIEW=false
# If you want to preview unpublished changes via Preview API
VITE_CONTENTSTACK_USE_PREVIEW=false
VITE_CONTENTSTACK_PREVIEW_TOKEN=
```

How it works
- On load, the app fetches the `homepage` entry with `is_default = true` and includes references.
- Data is mapped in `src/cms/homepage.js` and passed as props into components.
- If any CMS field is missing, components fall back to built‑in defaults.

## Enable Live Preview

1) In Contentstack (Stack Settings → Live Preview)
- Site URL: `http://localhost:5173`
- Preview URL: `http://localhost:5173`
- Add content type paths if required (e.g., `/` for homepage)

2) In Delivery Tokens (if using Preview API for instant updates)
- Create a Preview token (not Delivery) and set:
  - Allowed domains: `http://localhost:5173`
  - Allowed environments: your environment (e.g., production)

3) In `.env`
- `VITE_CONTENTSTACK_LIVE_PREVIEW=true`
- If previewing unpublished changes, also set:
  - `VITE_CONTENTSTACK_USE_PREVIEW=true`
  - `VITE_CONTENTSTACK_PREVIEW_TOKEN=your_preview_token`

4) Restart dev server
- `npm run dev`, then open your entry in the Contentstack editor and use Live Preview. Edits will trigger a refresh in the app.

## Building for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## Deploying to Contentstack Launch

To deploy this website to Contentstack Launch, follow the detailed guide in [`DEPLOYMENT.md`](./DEPLOYMENT.md).

### Quick Summary:

1. **Push your code to GitHub/GitLab/Bitbucket**
2. **Create a project in Contentstack Launch**
   - Connect your Git repository
   - Set Build Command: `npm run build`
   - Set Output Directory: `dist`
   - Add all environment variables from your `.env` file
3. **Configure environments** (production, staging, etc.)
4. **Deploy** and get your Launch URL
5. **Configure Live Preview** in Contentstack to point to your Launch URL

### Required Environment Variables for Launch:

Add these in Launch's Environment Variables section:

```
VITE_CONTENTSTACK_API_KEY=your_api_key
VITE_CONTENTSTACK_DELIVERY_TOKEN=your_delivery_token
VITE_CONTENTSTACK_PREVIEW_TOKEN=your_preview_token
VITE_CONTENTSTACK_ENVIRONMENT=production
VITE_CONTENTSTACK_REGION=US
VITE_CONTENTSTACK_LOCALE=en-us
VITE_CONTENTSTACK_CONTENT_TYPE_UID=homepage
VITE_CONTENTSTACK_LIVE_PREVIEW=true
VITE_CONTENTSTACK_USE_PREVIEW=false
```

**See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for complete step-by-step instructions.**

## Project Structure

```
src/
├── components/
│   ├── Navigation.jsx    # Header navigation with responsive menu
│   ├── Hero.jsx          # Hero section with call-to-action
│   ├── Features.jsx      # Key features showcase
│   ├── Benefits.jsx      # Benefits and stats section
│   ├── Testimonials.jsx  # Customer testimonials
│   ├── CTA.jsx           # Call-to-action section
│   └── Footer.jsx        # Footer with links and social media
├── App.jsx               # Main application component
├── main.jsx              # Application entry point
└── index.css             # Global styles and Tailwind directives
```

## Features Overview

- **Navigation**: Sticky header with smooth scroll transitions
- **Hero Section**: Eye-catching hero with animated elements and CTAs
- **Features**: 6 key features with icons and hover effects
- **Benefits**: Detailed benefits with checkmarks and statistics
- **Testimonials**: Customer reviews with ratings
- **CTA Section**: Compelling call-to-action with gradient background
- **Footer**: Comprehensive footer with links and social media

## Customization

### Colors

Edit the `tailwind.config.js` file to customize the color scheme:

```js
colors: {
  primary: {
    // Your custom colors
  }
}
```

### Content

All content can be customized in the respective component files in the `src/components/` directory.

## License

This project is open source and available for your use.

## Contributing

Feel free to submit issues or pull requests if you have suggestions for improvements!
