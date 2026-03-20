import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
    server: {
        host: "::",
        port: 8081,
    },
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "../src"),
            "react/jsx-runtime": path.resolve(__dirname, "../../node_modules/react/jsx-runtime.js"),
            "react/jsx-dev-runtime": path.resolve(__dirname, "../../node_modules/react/jsx-dev-runtime.js"),
            "react": path.resolve(__dirname, "../../node_modules/react"),
            "react-dom": path.resolve(__dirname, "../../node_modules/react-dom"),
        },
        dedupe: ["react", "react-dom"],
    },
});
