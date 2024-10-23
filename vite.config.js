import { defineConfig, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        {
            name: 'treat-js-files-as-jsx',
            async transform(code, id) {
                if (!id.match(/src\/.*\.js$/)) return null;
                return transformWithEsbuild(code, id, {
                    loader: 'jsx',
                    jsx: 'automatic',
                });
            },
        },
        react(),
    ],
    optimizeDeps: {
        force: true,
        esbuildOptions: {
            loader: {
                '.js': 'jsx',
            },
        },
    },
    resolve: {
        alias: {
            '~': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 3000,
    },
});
