module.exports = {
  siteMetadata: {
    title: `Beat Bracket`,
    siteUrl: `https://www.beatbracket.com`,
  },
  plugins: ['gatsby-plugin-postcss', {
    resolve: "gatsby-plugin-react-svg",
    options: {
      rule: {
        include: /svgs/ // Including svgs in image folder for now
      }
    }
  },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: "Beat Bracket",
        short_name: "Beat Bracket",
        start_url: "/",
        background_color: "#000000",
        theme_color: "#ffffff",
        // Enables "Add to Homescreen" prompt and disables browser UI (including back button)
        // see https://developers.google.com/web/fundamentals/web-app-manifest/#display
        display: "standalone",
        icon: "src/assets/images/beat_bracket_logo.png", // This path is relative to the root of the site.
      },
    },]
}
