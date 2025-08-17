import path from "path";
import AutoImport from "unplugin-auto-import/vite";
import { defineConfig } from "vite";

// vite plugins
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import Fonts from "unplugin-fonts/vite";
// @ts-ignore
import imagemin from "unplugin-imagemin/vite";
import { compression } from "vite-plugin-compression2";
import Inspect from "vite-plugin-inspect";

export default defineConfig({
    plugins: [
        react(),
        Inspect(),
        compression(),
        imagemin(),
        tailwindcss(),
        Fonts(),
        AutoImport({
            imports: ["react", "react-router"],
            dts: "./auto-imports.d.ts",
            eslintrc: { filepath: "./eslint.config.js" },
            dirs: ["./src/components/ui"],
        }),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        host: true,
        port: 5173,
    },
    define: {
        __SERVER_ENV__: JSON.stringify(process.env.SERVER_ENV || "remote"),
    },
});
