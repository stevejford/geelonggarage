import React from 'react';
import { Map } from '@vis.gl/react-google-maps';

interface GoogleMapProps {
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  className?: string;
  zoom?: number;
}

export default function GoogleMap({
  address,
  city,
  state,
  zip,
  country,
  latitude,
  longitude,
  className = '',
  zoom = 15
}: GoogleMapProps) {
  // No need for debug logging in production

  // If we have coordinates, use them directly
  if (latitude && longitude) {
    return (
      <div className={className}>
        <Map
          defaultCenter={{ lat: latitude, lng: longitude }}
          defaultZoom={zoom}
          gestureHandling={'cooperative'}
          disableDefaultUI={false}
          mapId="DEMO_MAP_ID"
          style={{ width: '100%', height: '100%' }}
          mapTypeControl={true}
          fullscreenControl={false}
          streetViewControl={true}
          zoomControl={true}
          scaleControl={true}
          rotateControl={true}
        />
      </div>
    );
  }

  // If we don't have coordinates but have an address, use an iframe with the address
  if (address) {
    const formattedAddress = [
      address,
      city,
      state,
      zip,
      country
    ].filter(Boolean).join(',');

    return (
      <div className={className}>
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0 }}
          src={`https://maps.google.com/maps?q=${encodeURIComponent(formattedAddress)}&t=m&z=15&output=embed&iwloc=near`}
          allowFullScreen
        ></iframe>
      </div>
    );
  }

  // If we have neither coordinates nor address
  return (
    <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
      <p className="text-gray-500">No location data available</p>
    </div>
  );
}
