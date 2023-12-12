import React from "react";

import useSiteMetadata from "../hooks/useSiteMetadata";

export default function Seo({ title, description, pathname, children }) {
  const {
    title: defaultTitle,
    description: defaultDescription,
    // image,
    siteUrl,
  } = useSiteMetadata();

  const seo = {
    siteName: defaultTitle,
    title: title ? `${title} | ${defaultTitle}` : defaultTitle,
    pageTitle: title ? `${title}` : defaultTitle,
    description: description || defaultDescription,
    // image: `${siteUrl}${image}`,
    url: `${siteUrl}${pathname || ``}`,
  };

  return (
    <>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />

      <meta itemProp="name" content={seo.pageTitle} />
      {/* <meta itemProp="description" content={seo.description} /> */}

      <meta name="og:title" content={seo.pageTitle} />
      {/* <meta name="og:description" content={seo.description} /> */}
      <meta name="og:site_name" content={seo.siteName} />
      <meta name="og:type" content="website" />
      {children}
    </>
  );
}
