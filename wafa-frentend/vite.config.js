import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
 server: {
  host: true,
  port: 4010,
  allowedHosts: ["wafa.albech.me"],
  hmr: {
    host: "wafa.albech.me",
    protocol: "wss"
  }
}
})