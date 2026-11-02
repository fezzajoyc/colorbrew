import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ColorBrew — color tools for designers and developers",
    short_name: "ColorBrew",
    description:
      "Free color tools that run entirely in your browser: gradients, contrast, palettes, converters and color-blindness simulation.",
    start_url: "/en",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
