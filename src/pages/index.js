
import LogoCustomizer from "@/components/LogoCustomizer";

const ClearIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1.5em"
    height="1.5em"
    viewBox="0 0 24 24"
    style={{ marginLeft: ".5rem" }}
  >
    <path
      fill="#120D96"
      d="M12 6v3l4-4l-4-4v3a8 8 0 0 0-8 8c0 1.57.46 3.03 1.24 4.26L6.7 14.8A5.9 5.9 0 0 1 6 12a6 6 0 0 1 6-6m6.76 1.74L17.3 9.2c.44.84.7 1.8.7 2.8a6 6 0 0 1-6 6v-3l-4 4l4 4v-3a8 8 0 0 0 8-8c0-1.57-.46-3.03-1.24-4.26"
    ></path>
  </svg>
);

export default function Home() {
  return (
    // <div>TEST</div>
    <LogoCustomizer />
  )
}