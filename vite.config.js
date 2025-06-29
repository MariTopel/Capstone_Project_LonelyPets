import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: //github.com/MariTopel/Capstone_Project_LonelyPets
  plugins: [react()],
  build: {
    outDir: "docs", // optional: output directly to /docs for Pages
  },
});
