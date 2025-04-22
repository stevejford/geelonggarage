import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Define the Google Maps script loader
const loadGoogleMapsScript = (callback: () => void) => {
  const existingScript = document.getElementById('google-maps-script');
  if (!existingScript) {
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = callback;
    document.head.appendChild(script);
  } else if (window.google && window.google.maps) {
    callback();
  } else {
    existingScript.addEventListener('load', callback);
  }
};

interface BusinessSearchProps {
  label?: string;
  required?: boolean;
  onBusinessSelect: (businessData: {
    name: string;
    unit?: string;
    address: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    placeId: string;
    formattedAddress: string;
    latitude: number;
    longitude: number;
  }) => void;
  className?: string;
}

export default function BusinessSearch({
  label = 'Business Search',
  required = false,
  onBusinessSelect,
  className = '',
}: BusinessSearchProps) {
  const [inputValue, setInputValue] = useState('');
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load the Google Maps script
  useEffect(() => {
    loadGoogleMapsScript(() => {
      setScriptLoaded(true);
    });
  }, []);

  // Initialize autocomplete when script is loaded
  useEffect(() => {
    if (!scriptLoaded || !inputRef.current || !window.google || !window.google.maps || !window.google.maps.places) return;

    const options = {
      fields: [
        'address_components',
        'formatted_address',
        'geometry',
        'place_id',
        'name',
        'photos',
        'types',
        'website',
        'formatted_phone_number',
        'opening_hours',
        'business_status'
      ],
      types: ['establishment'],
      componentRestrictions: { country: 'au' } // Restrict results to Australia only
    };

    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, options);

    const listener = autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();

      console.log('Full place object from Google Places:', place);

      if (!place || !place.address_components) return;

      // Extract the business name
      const businessName = place.name || '';
      console.log("Business name:", businessName);

      // Extract the full formatted address
      const formattedAddress = place.formatted_address || '';
      console.log("Full formatted address:", formattedAddress);

      // Extract just the street address (everything before the first comma)
      const streetAddress = formattedAddress.split(',')[0].trim();
      console.log("Street address extracted:", streetAddress);

      // Extract other components for our form
      let city = '';
      let state = '';
      let postcode = '';
      let country = '';

      // Still extract other components for the form fields
      for (const component of place.address_components) {
        const types = component.types;

        if (types.includes('locality')) {
          city = component.long_name;
        } else if (types.includes('sublocality_level_1') && !city) {
          city = component.long_name;
        } else if (types.includes('postal_town') && !city) {
          city = component.long_name;
        }

        if (types.includes('administrative_area_level_1')) {
          state = component.short_name;
        }

        if (types.includes('postal_code')) {
          postcode = component.long_name;
        }

        if (types.includes('country')) {
          country = component.long_name;
        }
      }

      // Only show the business name in the input field
      setInputValue(businessName);

      // Extract business-specific information
      const businessTypes = place.types || [];
      const businessCategory = businessTypes.length > 0 ? businessTypes[0].replace(/_/g, ' ') : '';
      const website = place.website || '';
      const phoneNumber = place.formatted_phone_number || '';

      // Extract opening hours if available
      const openingHours = place.opening_hours?.weekday_text || [];
      const businessStatus = place.business_status || '';

      // For photos, we'll just store the count and use the place_id to fetch them later
      const photoCount = place.photos ? place.photos.length : 0;
      console.log('Number of photos available:', photoCount);

      // We'll use a different approach for photos - storing metadata only
      const photoMetadata = place.photos ? place.photos.map((photo, index) => ({
        width: photo.width || 0,
        height: photo.height || 0,
        attribution: photo.html_attributions?.[0] || '',
        index: index // Store the index for later use
      })) : [];

      // Create the business data object with all details
      const businessData = {
        name: businessName,
        address: streetAddress,
        city,
        state,
        postcode,
        country,
        placeId: place.place_id || '',
        formattedAddress: place.formatted_address || '',
        latitude: place.geometry?.location?.lat() || 0,
        longitude: place.geometry?.location?.lng() || 0,
        // Additional business details
        businessCategory,
        website,
        phoneNumber,
        openingHours,
        businessStatus,
        photoCount,
        photoMetadata,
      };

      console.log('Business data retrieved:', businessData);

      onBusinessSelect(businessData);
    });

    return () => {
      // Clean up by removing the listener and autocomplete
      if (listener) {
        // Use the Google Maps API's event handling
        try {
          // Try the standard way first
          if (window.google && window.google.maps && window.google.maps.event) {
            window.google.maps.event.removeListener(listener);
          }
          // If that fails, try the direct approach
          else if (typeof listener.remove === 'function') {
            listener.remove();
          }
        } catch (error) {
          console.warn('Error cleaning up Google Maps event listener:', error);
        }
      }
      autocompleteRef.current = null;
    };
  }, [scriptLoaded, onBusinessSelect]);

  // Handle manual input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div className={className}>
      <Label htmlFor="business-search">{label}{required && ' *'}</Label>
      <div className="text-xs text-gray-500 mb-2">
        Search for a business to automatically fill name and address details
      </div>
      {!scriptLoaded ? (
        <Input
          id="business-search"
          placeholder="Loading business search..."
          disabled
        />
      ) : (
        <div className="space-y-1">
          <Input
            ref={inputRef}
            id="business-search"
            name="business-search"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Start typing a business name (e.g., McDonald's Geelong)"
            className="business-autocomplete"
          />
          <p className="text-xs text-gray-500">Search for Australian businesses only</p>
        </div>
      )}
    </div>
  );
}
