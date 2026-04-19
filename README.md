# portfolio_v3

A minimalistic web portfolio built for high performance and clean aesthetics.

## Technology Stack
- React
- Vite
- Tailwind CSS
- TypeScript

## Local Development
1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## Deployment
This project is configured for seamless deployment on Vercel. 
The build process compiles all React components and Tailwind utilities into static HTML/CSS/JS, removing the need for a Node.js runtime in production.

## Why Node.js during development?
Although this is a static frontend application, Node.js (`node_modules`) is required strictly for local development tools. It powers the Vite bundler, local dev server, and Tailwind CSS compiler. Once built (`npm run build`), no backend or Node environment is necessary to serve the site.
