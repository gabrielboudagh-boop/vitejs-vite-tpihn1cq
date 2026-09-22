import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, pathname }) {
  // Build canonical URL from pathname
  const canonicalUrl = `https://vimavima.online${pathname}`;

  return (
    <Helmet>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={canonicalUrl} />
    </Helmet>
  );
}
