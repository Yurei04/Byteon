'use client'; // This makes the component a Client Component

import dynamic from 'next/dynamic';

const Footer = dynamic(() => import('./footer'), {
  ssr: false, // This is now allowed because it is in a Client Component
});

export default function ClientFooterLoader() {
  return <Footer />;
}