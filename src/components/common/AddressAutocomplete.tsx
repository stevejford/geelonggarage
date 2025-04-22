import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

interface AddressAutocompleteProps {
  label?: string;
  required?: boolean;
  value?: {
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
  };
  onChange: (addressData: {
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
  onDuplicateCheck?: (placeId: string, formattedAddress: string) => void;
  className?: string;
}

export default function AddressAutocomplete({
  label = 'Address',
  required = false,
  value,
  onChange,
  onDuplicateCheck,
  className = '',
}: AddressAutocompleteProps) {
  // Always initialize with just the street part of the address
  const [inputValue, setInputValue] = useState('');

  // Initialize the input value when the component mounts
  useEffect(() => {
    setInputValue(value?.address || '');
  }, []);
  const placesLib = useMapsLibrary('places');
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update input value when value prop changes
  useEffect(() => {
    // Always use just the address field, which should contain only the street part
    if (value?.address) {
      setInputValue(value.address);
    }
  }, [value?.address]);

  // Initialize autocomplete when places library is loaded
  useEffect(() => {
    if (!placesLib || !inputRef.current) return;

    const options = {
      fields: ['address_components', 'formatted_address', 'geometry', 'place_id'],
      types: ['address'],
      componentRestrictions: { country: 'au' } // Restrict results to Australia only
    };

    autocompleteRef.current = new placesLib.Autocomplete(inputRef.current, options);

    const listener = autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();

      if (!place || !place.address_components) return;

      // Extract the full formatted address
      const formattedAddress = place.formatted_address || '';

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

      // Extract just the street address (everything before the first comma)
      const streetAddressFull = formattedAddress.split(',')[0].trim();

      // Set default street address
      let streetAddress = streetAddressFull;

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
      if (streetNumber && route) {
        streetAddress = `${streetNumber} ${route}`;
      }

      // If no unit info found yet, try to extract from street address using patterns
      if (!unitInfo) {
        // Common unit/suite patterns
        const unitPatterns = [
          /^(Unit|Apt|Apartment|Suite|Shop|Flat)\s+(\w+)[,\s]+(.+)$/i,
          /^(\d+\/\d+)\s+(.+)$/,  // For formats like "1/123 Main Street"
          /^(\d+[A-Za-z]?\/\d+[A-Za-z]?)\s+(.+)$/,  // For formats like "1A/123B Main Street"
          /^(Level\s+\d+[,\s]+(?:Suite|Unit|Shop)?\s*\w+)[,\s]+(.+)$/i,  // For formats like "Level 1, Suite 4, 123 Main Street"
          /^(#\s*\w+)[,\s]+(.+)$/i,  // For formats like "# 101, 123 Main Street"
          /^(\w+\s*-\s*\w+)[,\s]+(.+)$/i,  // For formats like "A-101, 123 Main Street"
        ];

        for (const pattern of unitPatterns) {
          const match = streetAddressFull.match(pattern);
          if (match) {
            if (match[1]) unitInfo = match[1];
            if (match[2] && match[1].match(/^\d+\/\d+/)) {
              // For "1/123 Main Street" format, we want to keep the number with the street
              streetAddress = match[2];
            } else if (match[3]) {
              // For other formats like "Unit 1, 123 Main Street"
              streetAddress = match[3];
            } else if (match[2]) {
              // Fallback for other patterns
              streetAddress = match[2];
            }
            break;
          }
        }
      }

      // If we still don't have unit info, check if there's a secondary number in the address
      if (!unitInfo) {
        // Look for patterns like "123-456 Main Street" where 456 might be a unit number
        const secondaryMatch = streetAddressFull.match(/^(\d+)\s*-\s*(\d+)\s+(.+)$/i);

        if (secondaryMatch) {
          unitInfo = secondaryMatch[2]; // The second number is likely the unit
          streetAddress = `${secondaryMatch[1]} ${secondaryMatch[3]}`; // Keep the primary number with the street
        }
      }

      // We've already extracted all the components we need above

      // Only show the street address in the input field, not the full formatted address
      setInputValue(streetAddress);

      // Create the address data object with the street address
      const addressData = {
        unit: unitInfo || value?.unit, // Use extracted unit info or preserve existing value
        address: streetAddress,
        city,
        state,
        postcode,
        country,
        placeId: place.place_id || '',
        formattedAddress: place.formatted_address || '',
        latitude: place.geometry?.location?.lat() || 0,
        longitude: place.geometry?.location?.lng() || 0,
      };

      // Force update the unit field in the UI
      if (unitInfo) {
        // This is a hack to ensure the unit field is updated in the UI
        setTimeout(() => {
          const unitInput = document.getElementById('unit') as HTMLInputElement;
          if (unitInput && !unitInput.value && unitInfo) {
            unitInput.value = unitInfo;
            // Trigger a change event to update the form state
            const event = new Event('input', { bubbles: true });
            unitInput.dispatchEvent(event);
          }
        }, 100);
      }

      onChange(addressData);

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
          if (google && google.maps && google.maps.event) {
            google.maps.event.removeListener(listener);
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
  }, [placesLib, onChange, onDuplicateCheck, value?.unit]);

  // This useEffect is no longer needed as we have a more specific one above
  // that handles the address field changes

  // Handle manual input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    // If user clears the input, reset the address data but preserve the unit
    if (!e.target.value) {
      onChange({
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

  // Handle city field change
  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cityValue = e.target.value;
    onChange({
      ...value,
      city: cityValue,
      unit: value?.unit || '',
      address: value?.address || '',
      state: value?.state || '',
      postcode: value?.postcode || '',
      country: value?.country || '',
      placeId: value?.placeId || '',
      formattedAddress: value?.formattedAddress || '',
      latitude: value?.latitude || 0,
      longitude: value?.longitude || 0,
    });
  };

  // Handle state field change
  const handleStateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const stateValue = e.target.value;
    onChange({
      ...value,
      state: stateValue,
      unit: value?.unit || '',
      address: value?.address || '',
      city: value?.city || '',
      postcode: value?.postcode || '',
      country: value?.country || '',
      placeId: value?.placeId || '',
      formattedAddress: value?.formattedAddress || '',
      latitude: value?.latitude || 0,
      longitude: value?.longitude || 0,
    });
  };

  // Handle postcode field change
  const handlePostcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const postcodeValue = e.target.value;
    onChange({
      ...value,
      postcode: postcodeValue,
      unit: value?.unit || '',
      address: value?.address || '',
      city: value?.city || '',
      state: value?.state || '',
      country: value?.country || '',
      placeId: value?.placeId || '',
      formattedAddress: value?.formattedAddress || '',
      latitude: value?.latitude || 0,
      longitude: value?.longitude || 0,
    });
  };

  // Handle country field change
  const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const countryValue = e.target.value;
    onChange({
      ...value,
      country: countryValue,
      unit: value?.unit || '',
      address: value?.address || '',
      city: value?.city || '',
      state: value?.state || '',
      postcode: value?.postcode || '',
      placeId: value?.placeId || '',
      formattedAddress: value?.formattedAddress || '',
      latitude: value?.latitude || 0,
      longitude: value?.longitude || 0,
    });
  };

  return (
    <div className={className}>
      {/* Unit, Address, City fields side by side */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Unit/Suite/Floor field */}
        <div className="space-y-2">
          <Label htmlFor="unit">Unit/Suite/Floor</Label>
          <Input
            id="unit"
            name="unit"
            value={value?.unit || ''}
            onChange={handleUnitChange}
            placeholder="Unit 3, Suite 101, etc."
          />
        </div>

        {/* Street address field */}
        <div className="space-y-2">
          <Label htmlFor="address">{label}{required && ' *'}</Label>
          {!placesLib ? (
            <Input
              id="address"
              placeholder="Loading address search..."
              disabled
            />
          ) : (
            <div className="space-y-1">
              <Input
                ref={inputRef}
                id="address"
                name="address"
                value={inputValue}
                onChange={handleInputChange}
                required={required}
                placeholder="Start typing an address..."
                className="address-autocomplete"
              />
              <p className="text-xs text-gray-500">Search for Australian addresses only</p>
            </div>
          )}
        </div>

        {/* City field */}
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            name="city"
            value={value?.city || ''}
            onChange={handleCityChange}
            placeholder="Melbourne"
          />
        </div>
      </div>

      <p className="text-xs text-gray-500 -mt-2 mb-4">
        Search for an address or enter manually. Format: Street number + street name (e.g., "10 Main Street")
      </p>

      {/* State, Postcode, Country fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            name="state"
            value={value?.state || ''}
            onChange={handleStateChange}
            placeholder="VIC"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="postcode">Postcode</Label>
          <Input
            id="postcode"
            name="postcode"
            value={value?.postcode || ''}
            onChange={handlePostcodeChange}
            placeholder="3000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            name="country"
            value={value?.country || ''}
            onChange={handleCountryChange}
            placeholder="Australia"
          />
        </div>
      </div>
    </div>
  );
}
