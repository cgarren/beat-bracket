require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});

module.exports = {
  siteMetadata: {
    title: `Beat Bracket`,
    description: `Make music brackets for your favorite artists and playlists! It's easy to generate, customize, fill, and share your bracket with a free Spotify account.`,
    siteUrl: `https://www.beatbracket.com`,
  },
  plugins: [
    "gatsby-plugin-postcss",
    {
      resolve: "gatsby-plugin-svgr-loader",
      options: {
        rule: {
          include: /assets\/svgs/,
        },
        svgrOptions: {
          expandProps: false,
          dimensions: false,
        },
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: "Beat Bracket",
        short_name: "Beat Bracket",
        description: `Make music brackets for your favorite artists and playlists! It's easy to generate, customize, fill, and share your bracket with a free Spotify account.`,
        start_url: "/",
        background_color: "#BBBBBB",
        theme_color: "#BBBBBB",
        // Enables "Add to Homescreen" prompt and disables browser UI (including back button)
        // see https://developers.google.com/web/fundamentals/web-app-manifest/#display
        display: "standalone",
        icon: "src/assets/images/logo.svg", // This path is relative to the root of the site.
        icons: [
          {
            src: "icons/icon-48x48.png",
            sizes: "48x48",
            type: "image/png",
          },
          {
            src: "icons/icon-72x72.png",
            sizes: "72x72",
            type: "image/png",
          },
          {
            src: "icons/icon-96x96.png",
            sizes: "96x96",
            type: "image/png",
          },
          {
            src: "icons/icon-144x144.png",
            sizes: "144x144",
            type: "image/png",
          },
          {
            src: "icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/icon-256x256.png",
            sizes: "256x256",
            type: "image/png",
          },
          {
            src: "icons/icon-384x384.png",
            sizes: "384x384",
            type: "image/png",
          },
          {
            src: "icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "icons/icon-maskable.png",
            sizes: "1024x1024",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    },
  ],
};
