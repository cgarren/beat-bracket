module.exports = {
  siteMetadata: {
    title: `Song Colosseum`,
    siteUrl: `https://www.yourdomain.tld`,
  },
  plugins: ['gatsby-plugin-postcss', 'gatsby-plugin-react-helmet', {
    resolve: "gatsby-plugin-react-svg",
    options: {
      rule: {
        include: /svgs/ // Including svgs in image folder for now
      }
    }
  }],
  pathPrefix: "/song-colosseum"
}
