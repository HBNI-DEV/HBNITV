const path = require('path');
const fs = require('fs');
const glob = require('glob');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { GenerateSW } = require('workbox-webpack-plugin');

const entries = {};
const pagesDir = path.join(__dirname, 'src/pages');
const pageFolders = fs.readdirSync(pagesDir);

pageFolders.forEach(folder => {
    const entryFile = path.join(pagesDir, folder, `${folder}.ts`);
    if (fs.existsSync(entryFile)) {
        entries[folder] = entryFile;
    } else {
        console.warn(`⚠️ No entry file found for: ${folder}`);
    }
});

console.log("📦 Webpack entries:", entries);

// Dynamically create HTML plugins for each entry
const htmlPlugins = Object.keys(entries).map(name => {
    const templatePath = path.join(pagesDir, name, `${name}.html`);
    if (fs.existsSync(templatePath)) {
        return new HtmlWebpackPlugin({
            template: templatePath,
            filename: `html/${name}.html`,
            chunks: [name],
            minify: true,
        });
    } else {
        console.warn(`⚠️ No HTML template found for: ${name}`);
        return null;
    }
}).filter(Boolean);


module.exports = {
    mode: 'production', // or 'development' if needed
    entry: entries,
    output: {
        filename: 'js/[name].bundle.js',
        path: path.resolve(__dirname, 'public/dist'),
        publicPath: '/public/dist/',
        clean: true, // ✅ Cleans output dir before each build (no need to manually delete old files)
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        alias: {
            '@components': path.resolve(__dirname, 'src/components'),
            '@pages': path.resolve(__dirname, 'src/pages'),
            '@utils': path.resolve(__dirname, 'src/utils'),
            '@styles': path.resolve(__dirname, 'src/styles'),
        },
    },
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
        ...htmlPlugins,
        new GenerateSW({
            swDest: 'service-worker.js',
            clientsClaim: true,
            skipWaiting: true,
            runtimeCaching: [
                {
                    urlPattern: ({ request }) => request.mode === 'navigate',
                    handler: 'NetworkFirst',
                    options: {
                        cacheName: 'html-pages',
                    },
                },
                {
                    urlPattern: /\.(?:js|css|png|jpg|jpeg|svg|woff2?)$/,
                    handler: 'StaleWhileRevalidate',
                    options: {
                        cacheName: 'static-assets',
                    },
                },
                {
                    urlPattern: ({ url }) =>
                        url.hostname === 'accounts.google.com' ||
                        url.href.startsWith('https://accounts.google.com/gsi/'),
                    handler: 'NetworkOnly',
                },
            ],
        }),
    ],
};
