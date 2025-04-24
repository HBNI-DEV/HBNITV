const path = require('path');
const fs = require('fs');
const { GenerateSW } = require("workbox-webpack-plugin");

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { register } = require('module');
const entries = {
    index: './src/pages/index.ts',
    settings: './src/pages/settings.ts',
    register: './src/pages/register.ts',
    calendar: './src/pages/calendar.ts',
    classes: './src/pages/classes.ts',
    news: './src/pages/news.ts',
    contact: './src/pages/contact.ts',
    error: './src/pages/error.ts',
    offline: './src/pages/offline.ts',
};

const htmlPlugins = Object.keys(entries).map(entryName => {
    const templatePath = path.resolve(__dirname, `./templates/${entryName}.html`);
    if (fs.existsSync(templatePath)) {
        return new HtmlWebpackPlugin({
            template: templatePath,
            filename: `html/${entryName}.html`,
            chunks: [entryName],
        });
    } else {
        console.warn(`Warning: Template for ${entryName} does not exist. Skipping...`);
        return null;
    }
}).filter(Boolean);

module.exports = {
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },
    entry: entries,
    output: {
        filename: 'js/[name].bundle.js',
        path: path.resolve(__dirname, 'public/dist'),
        publicPath: '/public/dist/',
    },
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'css/[name].bundle.css',
        }),
        ...htmlPlugins, // Include all the dynamically generated HtmlWebpackPlugin instances
        new GenerateSW({
            swDest: "service-worker.js",
            clientsClaim: true,
            skipWaiting: true,
            // navigateFallback: "/public/dist/html/offline.html", // fallback when offline
            runtimeCaching: [
                {
                    // Catch navigational HTML documents
                    urlPattern: ({ request }) => request.mode === "navigate",
                    handler: "NetworkFirst",
                    options: {
                        cacheName: "html-pages",
                    },
                },
                {
                    // Static assets like JS, CSS, images
                    urlPattern: /\.(?:js|css|png|jpg|svg|woff2?)$/,
                    handler: "StaleWhileRevalidate",
                    options: {
                        cacheName: "static-assets",
                    },
                },
                {
                    // ❌ EXCLUDE Google Identity Services scripts from caching
                    urlPattern: ({ url }) =>
                        url.hostname === "accounts.google.com" ||
                        url.href.startsWith("https://accounts.google.com/gsi/"),
                    handler: "NetworkOnly", // always fetch fresh
                },
            ],
        }),
    ],
};