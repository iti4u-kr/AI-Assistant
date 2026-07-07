import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#171A1F",
        paper: "#F6F7F5",
        line: "#E3E6E1",
        pine: { DEFAULT: "#0F6B5C", dark: "#0B5348", soft: "#E4F1EE" },
        amber: { signal: "#D98E04" }
      },
      fontFamily: {
        sans: ["Pretendard Variable", "Pretendard", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
export default config;
