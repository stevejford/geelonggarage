import React from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';

// Google Maps API key from environment variables
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

interface GoogleMapsProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component for Google Maps API
 * Wraps the application with the APIProvider from @vis.gl/react-google-maps
 *
 * This component ensures that the Google Maps API is loaded only once
 * and provides the API to all child components.
 */
export default function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
  // Check if the script is already loaded by another component
  const scriptAlreadyLoaded = typeof window !== 'undefined' &&
    window.google &&
    window.google.maps;

  return (
    <APIProvider
      apiKey={GOOGLE_MAPS_API_KEY}
      // Only load the places library
      libraries={['places', 'streetView']}
      // Prevent loading if already loaded
      preventGoogleFontsLoading={scriptAlreadyLoaded}
    >
      {children}
    </APIProvider>
  );
}
