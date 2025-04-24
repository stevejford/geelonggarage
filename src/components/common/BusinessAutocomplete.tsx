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

interface BusinessAutocompleteProps {
  label?: string;
  required?: boolean;
  value?: {
    name: string;
    unit?: string;
    address: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    placeId?: string;
    formattedAddress?: string;
    latitude?: number;
    longitude?: number;
    // Additional business details
    businessCategory?: string;
    businessStatus?: string;
    phoneNumber?: string;
    email?: string;
    website?: string;
    openingHours?: string[];
    isFranchise?: boolean;
  };
  onChange: (businessData: {
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
    // Additional business details
    businessCategory?: string;
    businessStatus?: string;
    phoneNumber?: string;
    email?: string;
    website?: string;
    openingHours?: string[];
    isFranchise?: boolean;
  }) => void;
  onDuplicateCheck?: (placeId: string, formattedAddress: string) => void;
  className?: string;
}

export default function BusinessAutocomplete({
  label = 'Business Name',
  required = false,
  value,
  onChange,
  onDuplicateCheck,
  className = '',
}: BusinessAutocompleteProps) {
  // Always initialize with just the business name
  const [inputValue, setInputValue] = useState(() => {
    return value?.name || '';
  });
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load the Google Maps script
  useEffect(() => {
    loadGoogleMapsScript(() => {
      setScriptLoaded(true);
    });
  }, []);

  // Update input value when value prop changes
  useEffect(() => {
    // Always use just the business name
    if (value?.name) {
      setInputValue(value.name);
    }
  }, [value?.name]);

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
        'business_status',
        'opening_hours',
        'types',
        'website',
        'formatted_phone_number',
        'international_phone_number'
      ],
      types: ['establishment'],
      componentRestrictions: { country: 'au' } // Restrict results to Australia only
    };

    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, options);

    const listener = autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();

      if (!place || !place.address_components) return;

      // Extract the business name
      const businessName = place.name || '';

      // Extract the full formatted address
      const formattedAddress = place.formatted_address || '';

      // Extract just the street address (everything before the first comma)
      const streetAddress = formattedAddress.split(',')[0].trim();

      // Extract address components we need
      let unitInfo = '';
      let streetNumber = '';
      let route = '';
      let city = '';
      let state = '';
      let postcode = '';
      let country = '';

      // Extract components we need
      for (const component of place.address_components) {
        const types = component.types;

        if (types.includes('subpremise')) {
          unitInfo = component.long_name;
        }

        if (types.includes('street_number')) {
          streetNumber = component.long_name;
        }

        if (types.includes('route')) {
          route = component.short_name;
        }

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

      // Check for unit number in street number (e.g., "1/123" or "Unit 1, 123")
      if (streetNumber && !unitInfo) {
        // Check for slash format (e.g., "1/123")
        const slashMatch = streetNumber.match(/^(\d+[A-Za-z]?)\/(.+)$/);
        if (slashMatch) {
          unitInfo = slashMatch[1];
          streetNumber = slashMatch[2];
        }

        // Check for unit prefix (e.g., "Unit 1, 123")
        const unitPrefixMatch = streetNumber.match(/^(Unit|Apt|Apartment|Suite|Shop|Flat)\s+(\w+)[,\s]+(\d+.*)$/i);
        if (unitPrefixMatch) {
          unitInfo = `${unitPrefixMatch[1]} ${unitPrefixMatch[2]}`;
          streetNumber = unitPrefixMatch[3];
        }
      }

      // If we have both street_number and route, use them to create a clean street address
      let cleanStreetAddress = streetAddress;
      if (streetNumber && route) {
        cleanStreetAddress = `${streetNumber} ${route}`;
      }

      // Only show the business name in the input field
      setInputValue(businessName);

      // Extract business category from types
      let businessCategory = '';
      if (place.types && place.types.length > 0) {
        // Use the first type that's not generic
        const nonGenericTypes = place.types.filter((type: string) =>
          !['establishment', 'point_of_interest', 'premise', 'political', 'geocode'].includes(type)
        );
        businessCategory = nonGenericTypes.length > 0 ? nonGenericTypes[0] : place.types[0];
      }

      // Extract business hours
      let openingHours: string[] = [];
      if (place.opening_hours && place.opening_hours.weekday_text) {
        openingHours = place.opening_hours.weekday_text;
      }

      // Create the business data object with the business name and address
      const businessData = {
        name: businessName,
        unit: unitInfo || value?.unit, // Use extracted unit info or preserve existing value
        address: cleanStreetAddress,
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
        businessStatus: place.business_status || '',
        phoneNumber: place.formatted_phone_number || place.international_phone_number || '',
        email: '', // Google Places API doesn't provide email, but we add the field for manual entry
        website: place.website || '',
        openingHours,
        isFranchise: false, // Default value, would need additional API to determine this
      };

      // Force update the unit field in the UI
      if (unitInfo) {
        // This is a hack to ensure the unit field is updated in the UI
        setTimeout(() => {
          const unitInput = document.getElementById('business-unit') as HTMLInputElement;
          if (unitInput && !unitInput.value && unitInfo) {
            unitInput.value = unitInfo;
            // Trigger a change event to update the form state
            const event = new Event('input', { bubbles: true });
            unitInput.dispatchEvent(event);
          }
        }, 100);
      }

      onChange(businessData);

      // Check for duplicates if callback provided
      if (onDuplicateCheck && place.place_id) {
        onDuplicateCheck(place.place_id, place.formatted_address || '');
      }
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
  }, [scriptLoaded, onChange, onDuplicateCheck, value?.unit]);

  // Handle manual input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    // If user clears the input, reset the business data but preserve the unit
    if (!e.target.value) {
      onChange({
        name: '',
        unit: value?.unit, // Preserve the unit field
        address: '',
        city: '',
        state: '',
        postcode: '',
        country: '',
        placeId: '',
        formattedAddress: '',
        latitude: 0,
        longitude: 0,
      });
    }
  };

  // Handle unit field change
  const handleUnitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const unitValue = e.target.value;
    onChange({
      ...value,
      name: value?.name || '',
      unit: unitValue,
      address: value?.address || '',
      city: value?.city || '',
      state: value?.state || '',
      postcode: value?.postcode || '',
      country: value?.country || '',
      placeId: value?.placeId || '',
      formattedAddress: value?.formattedAddress || '',
      latitude: value?.latitude || 0,
      longitude: value?.longitude || 0,
    });
  };

  return (
    <div className={className}>
      {/* Business Name field - full width */}
      <div className="space-y-2 mb-4">
        <Label htmlFor="business-name" className="text-base">{label}{required && ' *'}</Label>
        {!scriptLoaded ? (
          <Input
            id="business-name"
            placeholder="Loading business search..."
            disabled
            className="text-base h-12"
          />
        ) : (
          <div className="space-y-1">
            <Input
              ref={inputRef}
              id="business-name"
              name="business-name"
              value={inputValue}
              onChange={handleInputChange}
              required={required}
              placeholder="Start typing a business name..."
              className="business-autocomplete text-base h-12 font-medium"
            />
            <p className="text-xs text-gray-500">Search for Australian businesses only</p>
          </div>
        )}
      </div>

      {/* Unit and Address fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Unit/Suite/Floor field */}
        <div className="space-y-2">
          <Label htmlFor="business-unit">Unit/Suite/Floor</Label>
          <Input
            id="business-unit"
            name="business-unit"
            value={value?.unit || ''}
            onChange={handleUnitChange}
            placeholder="Unit 3, Suite 101, Level 5, etc."
            className="text-base"
          />
        </div>

        {/* Display the extracted address after selection */}
        <div className="space-y-2">
          <Label htmlFor="business-address">Business Address</Label>
          <Input
            id="business-address"
            value={value?.address || ''}
            readOnly
            className="bg-gray-50 text-base"
            placeholder="Address will appear here after selection"
          />
        </div>
      </div>
    </div>
  );
}
