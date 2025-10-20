import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/why',
          '/legals/',
          '/legals/privacy-policy',
          '/legals/terms',
          '/legals/cookie-policy',
          '/blogs',
          '/blogs/',
          '/blogs/*',
          '/watch/',
          '/watch/*',
          '/shorts',
          '/shorts/',
          '/shorts/*',
          '/channels/',
          '/channels/*',
          '/search',
        ],
        disallow: [
          '/auth/',
          '/auth/*',
          '/create/',
          '/create/*',
          '/admin/',
          '/admin/*',
          '/saved',
          '/history',
        ],
      },
    ],
    sitemap: 'https://www.niajee.com/sitemap.xml',
    host: 'https://www.niajee.com',
  };
}