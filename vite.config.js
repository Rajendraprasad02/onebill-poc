import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [tailwindcss()],
  // server: {
  //   host: "0.0.0.0", // Bind to all network interfaces
  //   port: 5173, // Optional: Specify the desired port
  // },
});
