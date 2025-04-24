import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import Select from 'react-select';
import { useSearch } from '../contexts/SearchContext';
import { SearchField } from './ui/search-field';
import { Button } from './ui/button';

// Options for entity type dropdown
const entityTypeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'invoices', label: 'Invoices' },
  { value: 'quotes', label: 'Quotes' },
  { value: 'workOrders', label: 'Work Orders' },
  { value: 'contacts', label: 'Contacts' },
  { value: 'accounts', label: 'Accounts' },
  { value: 'leads', label: 'Leads' },
];

// Get field options based on selected entity type
const getFieldOptions = (entityType: string) => {
  const commonOptions = [
    { value: 'any', label: 'Any Field' },
  ];

  switch (entityType) {
    case 'invoices':
      return [
        ...commonOptions,
        { value: 'number', label: 'Invoice #' },
        { value: 'amount', label: 'Amount' },
        { value: 'name', label: 'Customer' },
        { value: 'date', label: 'Date' },
        { value: 'status', label: 'Status' },
      ];
    case 'quotes':
      return [
        ...commonOptions,
        { value: 'number', label: 'Quote #' },
        { value: 'amount', label: 'Amount' },
        { value: 'name', label: 'Customer' },
        { value: 'date', label: 'Date' },
        { value: 'status', label: 'Status' },
      ];
    case 'workOrders':
      return [
        ...commonOptions,
        { value: 'number', label: 'WO #' },
        { value: 'service', label: 'Service' },
        { value: 'name', label: 'Customer' },
        { value: 'date', label: 'Date' },
        { value: 'status', label: 'Status' },
      ];
    case 'contacts':
      return [
        ...commonOptions,
        { value: 'name', label: 'Name' },
        { value: 'email', label: 'Email' },
        { value: 'phone', label: 'Phone' },
        { value: 'address', label: 'Address' },
      ];
    case 'accounts':
      return [
        ...commonOptions,
        { value: 'name', label: 'Name' },
        { value: 'type', label: 'Type' },
        { value: 'address', label: 'Address' },
      ];
    case 'leads':
      return [
        ...commonOptions,
        { value: 'name', label: 'Name' },
        { value: 'source', label: 'Source' },
        { value: 'status', label: 'Status' },
      ];
    default:
      return commonOptions;
  }
};

export default function NavbarSearch() {
  const navigate = useNavigate();
  const {
    globalSearch,
    setGlobalSearch,
    entityType,
    setEntityType,
    fieldFilter,
    setFieldFilter,
    results,
    isLoading,
    showResults,
    setShowResults,
    performSearch
  } = useSearch();

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalSearch(e.target.value);
    performSearch();
  };

  // Handle key press in search input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If Enter/Return key is pressed
    if (e.key === 'Enter') {
      e.preventDefault();
      // Just refresh the search without navigating
      performSearch();
    }
  };

  // Handle result click
  const handleResultClick = (result: any) => {
    setShowResults(false);
    setGlobalSearch('');
    navigate(result.url);
  };

  // Get field options based on selected entity type
  const fieldOptions = getFieldOptions(entityType.value);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setShowResults]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key closes results
      if (e.key === 'Escape' && showResults) {
        setShowResults(false);
      }

      // Enter key navigates to first result
      if (e.key === 'Enter' && showResults && results.length > 0) {
        handleResultClick(results[0]);
      }

      // Keyboard shortcut to focus search (Ctrl+K or Cmd+K)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('.navbar-search-input') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showResults, results, setShowResults]);

  // Update dropdown width to match search bar width
  useEffect(() => {
    if (showResults && searchBarRef.current && resultsRef.current) {
      const updateWidth = () => {
        const searchBarWidth = searchBarRef.current?.offsetWidth;
        if (searchBarWidth && resultsRef.current) {
          resultsRef.current.style.width = `${searchBarWidth}px`;
        }
      };

      updateWidth();
      window.addEventListener('resize', updateWidth);

      return () => {
        window.removeEventListener('resize', updateWidth);
      };
    }
  }, [showResults]);

  // Get icon for result type
  const getIcon = (type: string) => {
    switch (type) {
      case 'invoices': return '📄';
      case 'quotes': return '💰';
      case 'workOrders': return '🔧';
      case 'contacts': return '👤';
      case 'accounts': return '🏢';
      case 'leads': return '🎯';
      default: return '📋';
    }
  };

  // Get status badge
  const getStatusBadge = (status?: string) => {
    if (!status) return null;

    let bgColor = 'bg-gray-100';
    let textColor = 'text-gray-800';

    switch (status.toLowerCase()) {
      case 'paid':
      case 'completed':
      case 'accepted':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'pending':
      case 'scheduled':
      case 'presented':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        break;
      case 'overdue':
      case 'declined':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
      case 'draft':
      case 'in progress':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        break;
    }

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${bgColor} ${textColor}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="relative w-full" ref={searchContainerRef}>
      {/* Search Bar - matches content width */}
      <div
        ref={searchBarRef}
        className="flex items-center w-full bg-white border rounded-md overflow-hidden shadow-sm"
      >
        {/* Entity Type Dropdown */}
        <Select
          value={entityType}
          onChange={setEntityType}
          options={entityTypeOptions}
          className="min-w-[110px] border-r"
          classNamePrefix="search-select"
          isSearchable={false}
          menuPortalTarget={document.body}
          styles={{
            control: (base) => ({
              ...base,
              minHeight: '36px',
              border: 'none',
              boxShadow: 'none'
            }),
            valueContainer: (base) => ({
              ...base,
              padding: '0 8px'
            }),
            indicatorsContainer: (base) => ({
              ...base,
              height: '36px'
            })
          }}
        />

        {/* Field Filter Dropdown */}
        <Select
          value={fieldFilter}
          onChange={setFieldFilter}
          options={fieldOptions}
          className="min-w-[110px] border-r"
          classNamePrefix="search-select"
          isSearchable={false}
          menuPortalTarget={document.body}
          styles={{
            control: (base) => ({
              ...base,
              minHeight: '36px',
              border: 'none',
              boxShadow: 'none'
            }),
            valueContainer: (base) => ({
              ...base,
              padding: '0 8px'
            }),
            indicatorsContainer: (base) => ({
              ...base,
              height: '36px'
            })
          }}
        />

        {/* Search Input */}
        <div className="relative flex-grow">
          <SearchField
            value={globalSearch}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="Search... (Ctrl+K)"
            className="navbar-search-input border-0 h-9 focus-visible:ring-0 focus-visible:ring-offset-0"
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Results Dropdown - dynamically matches search bar width */}
      {showResults && (
        <div
          ref={resultsRef}
          className="absolute z-50 mt-1 bg-white border rounded-md shadow-lg max-h-[400px] overflow-hidden left-0 right-0"
          style={{ width: searchBarRef.current ? searchBarRef.current.offsetWidth : '100%' }}
        >
          <div className="p-2 border-b flex justify-between items-center bg-gray-50">
            <span className="text-sm text-gray-600">
              Results (showing {Math.min(results.length, 5)} of {results.length})
            </span>
            {results.length > 5 && (
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto"
                onClick={() => {
                  setShowResults(false);
                  navigate(`/search?q=${encodeURIComponent(globalSearch)}&type=${entityType.value}&field=${fieldFilter.value}`);
                }}
              >
                View all results &gt;
              </Button>
            )}
          </div>

          <div className="overflow-y-auto max-h-[350px]">
            {results.map((result) => (
              <div
                key={result.id}
                className="p-3 border-b hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => handleResultClick(result)}
              >
                <div className="flex items-center w-full">
                  {/* Icon and Title */}
                  <div className="flex items-center flex-grow-0 flex-shrink-0 w-1/3">
                    <span className="mr-2 text-lg">{getIcon(result.type)}</span>
                    <div>
                      <div className="font-medium text-gray-900">{result.title}</div>
                      <div className="text-sm text-gray-500">{result.metadata}</div>
                    </div>
                  </div>

                  {/* Match Context Column */}
                  <div className="flex-grow flex-shrink w-1/3 px-4">
                    {result.matchField ? (
                      <div className="text-sm">
                        <span className="text-gray-500">Found in: </span>
                        <span className="font-medium text-blue-600">{result.matchField}</span>
                        {result.matchContext && (
                          <div className="text-xs text-gray-500 mt-0.5 italic">
                            "{result.matchContext}"
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500 italic">Match found</span>
                    )}
                  </div>

                  {/* Details and Status */}
                  <div className="flex-grow-0 flex-shrink-0 w-1/3 text-right">
                    <span className="font-medium">{result.subtitle}</span>
                    {result.status && (
                      <div className="mt-1">
                        {getStatusBadge(result.status)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
