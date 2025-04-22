import React, { useState, useEffect } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';

interface StreetViewProps {
  latitude: number;
  longitude: number;
  heading?: number;
  pitch?: number;
  zoom?: number;
  className?: string;
}

export default function EnhancedStreetView({
  latitude,
  longitude,
  heading = 0,
  pitch = 0,
  zoom = 1,
  className = ""
}: StreetViewProps) {
  const map = useMap();
  const streetViewLib = useMapsLibrary('streetView');

  const [panorama, setPanorama] = useState<google.maps.StreetViewPanorama | null>(null);
  const [hasStreetView, setHasStreetView] = useState<boolean | null>(null);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  // Initialize Street View when libraries are loaded
  useEffect(() => {
    if (!streetViewLib || !containerRef || !map) return;

    try {
      // Create a Street View service
      const streetViewService = new streetViewLib.StreetViewService();

      // Check if Street View is available at this location using exact coordinates
      streetViewService.getPanorama({
        location: { lat: latitude, lng: longitude },
        radius: 200, // Look for Street View within 200 meters
        source: streetViewLib.StreetViewSource.DEFAULT
      })
        .then((data) => {
          // Access the nested data structure correctly
          const svData = data.data || data;

          try {
            // Set container dimensions explicitly
            if (containerRef) {
              containerRef.style.height = '100%';
              containerRef.style.width = '100%';
            }

            // Create a minimal panorama first
            const pano = new streetViewLib.StreetViewPanorama(containerRef, {
              visible: true
            });

            // Configure the panorama
            if (pano) {
              // If we have a panorama ID, use it directly
              if (svData.location?.pano) {
                pano.setPano(svData.location.pano);
              } else {
                // Otherwise use coordinates
                pano.setPosition({ lat: latitude, lng: longitude });
              }

              // Set other options
              pano.setPov({ heading, pitch });
              pano.setZoom(zoom);
              pano.setOptions({
                addressControl: false,
                showRoadLabels: false,
                zoomControl: true,
                linksControl: true,
                panControl: true,
                enableCloseButton: false,
                motionTracking: false,
                motionTrackingControl: false,
                fullscreenControl: false,
              });

              // Update state
              setPanorama(pano);
              setHasStreetView(true);
            }
          } catch (initError) {
            console.error('Error initializing panorama:', initError);
            setHasStreetView(false);
          }
        })
        .catch((error) => {
          // Try with OUTDOOR source as fallback using exact coordinates
          streetViewService.getPanorama({
            location: { lat: latitude, lng: longitude },
            radius: 500, // Increase radius for outdoor search
            source: streetViewLib.StreetViewSource.OUTDOOR
          })
            .then((data) => {
              // Access the nested data structure correctly
              const svData = data.data || data;

              try {
                // Set container dimensions explicitly
                if (containerRef) {
                  containerRef.style.height = '100%';
                  containerRef.style.width = '100%';
                }

                // Create a minimal panorama first
                const pano = new streetViewLib.StreetViewPanorama(containerRef, {
                  visible: true
                });

                // Configure the panorama
                if (pano) {
                  // If we have a panorama ID, use it directly
                  if (svData.location?.pano) {
                    pano.setPano(svData.location.pano);
                  } else {
                    // Otherwise use coordinates
                    pano.setPosition({ lat: latitude, lng: longitude });
                  }

                  // Set other options
                  pano.setPov({ heading, pitch });
                  pano.setZoom(zoom);
                  pano.setOptions({
                    addressControl: false,
                    showRoadLabels: false,
                    zoomControl: true,
                    linksControl: true,
                    panControl: true,
                    enableCloseButton: false,
                    motionTracking: false,
                    motionTrackingControl: false,
                    fullscreenControl: false,
                  });

                  // Update state
                  setPanorama(pano);
                  setHasStreetView(true);
                }
              } catch (initError) {
                console.error('Error initializing panorama (fallback):', initError);
                setHasStreetView(false);
              }
            })
            .catch(() => {
              // No Street View available
              setHasStreetView(false);
            });
        });
    } catch (error) {
      console.error('Error initializing Street View:', error);
      setHasStreetView(false);
    }

    // Cleanup function
    return () => {
      // No explicit cleanup needed for panorama in this library
    };
  }, [streetViewLib, containerRef, map, latitude, longitude, heading, pitch, zoom]);

  // If we know Street View is not available
  if (hasStreetView === false) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center p-4">
          <p className="text-gray-500">Street View not available at this location</p>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm mt-2 inline-block"
          >
            View on Google Maps
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setContainerRef}
      className={`${className} ${hasStreetView === null ? 'flex items-center justify-center bg-gray-100' : ''}`}
    >
      {hasStreetView === null && <div className="text-gray-500">Loading Street View...</div>}
    </div>
  );
}
