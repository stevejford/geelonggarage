# Geelong Garage Global Search Documentation

This document provides comprehensive information about the global search functionality implemented in the Geelong Garage application.

## Overview

The global search feature allows users to search across all entity types (Invoices, Quotes, Work Orders, Contacts, Accounts, Leads) from any page in the application. The search bar is located in the navbar and provides:

- Type-ahead search results as the user types
- Filtering by entity type and specific fields
- Keyboard shortcuts for quick access
- Direct navigation to record detail pages

## Implementation Details

### Components

1. **SearchContext** (`src/contexts/SearchContext.tsx`)
   - Manages global search state
   - Handles search queries and results
   - Provides context for search functionality across the application

2. **NavbarSearch** (`src/components/NavbarSearch.tsx`)
   - UI component for the search bar and results dropdown
   - Integrated with filter dropdowns
   - Handles user interactions and keyboard shortcuts

3. **Layout Integration** (`src/components/Layout.tsx`)
   - Integrates the search bar into the navbar
   - Ensures the search bar width matches the content width

### Key Features

- **Content-Matching Width**: The search bar and dropdown match the width of the page content
- **Real-time Results**: Results appear as the user types (after 2 characters)
- **Filtering Capabilities**: Filter by entity type and specific fields
- **Keyboard Navigation**: Supports keyboard shortcuts and navigation
- **Overlay Behavior**: Results appear in a dropdown that overlays the current page
- **Match Context**: Shows where the search term was found in each result

## Usage

### Basic Search

1. Click on the search bar in the navbar or press `Ctrl+K` / `Cmd+K`
2. Type your search query (at least 2 characters)
3. Results will appear in a dropdown below the search bar
4. Click on a result to navigate to its detail page

### Filtered Search

1. Click on the entity type dropdown (default: "All Types") to filter by specific entity
2. Click on the field dropdown (default: "Any Field") to filter by specific field
3. Type your search query to see filtered results

### Keyboard Shortcuts

- `Ctrl+K` / `Cmd+K`: Focus the search bar
- `Escape`: Close the results dropdown
- `Enter`: Navigate to the first result (when results are shown)
- `Tab`: Navigate between dropdowns and search input

## Technical Implementation

### Search Context

The `SearchContext` provides the following state and functions:

```typescript
interface SearchContextType {
  globalSearch: string;                                      // Current search query
  setGlobalSearch: (search: string) => void;                 // Update search query
  entityType: { value: EntityType; label: string };          // Selected entity type filter
  setEntityType: (type: { value: EntityType; label: string }) => void;  // Update entity type filter
  fieldFilter: { value: FieldFilter; label: string };        // Selected field filter
  setFieldFilter: (filter: { value: FieldFilter; label: string }) => void;  // Update field filter
  results: SearchResult[];                                   // Search results
  isLoading: boolean;                                        // Loading state
  showResults: boolean;                                      // Whether to show results dropdown
  setShowResults: (show: boolean) => void;                   // Toggle results dropdown
  performSearch: () => void;                                 // Trigger search
}
```

### Backend Integration

The search functionality connects to the Convex backend using query functions for each entity type:

```typescript
// Example of how search queries are structured
const searchInvoices = useQuery(api.invoices.searchInvoices,
  query.length >= 2 ? { search: query, type: entityType.value, field: fieldFilter.value } : 'skip');
```

## Extending the Search Functionality

### Adding New Entity Types

To add a new entity type to the search:

1. **Update the EntityType type definition**:

```typescript
// In SearchContext.tsx
type EntityType = 'all' | 'invoices' | 'quotes' | 'workOrders' | 'contacts' | 'accounts' | 'leads' | 'newEntityType';
```

2. **Add the new entity type to the dropdown options**:

```typescript
// In NavbarSearch.tsx
const entityTypeOptions = [
  { value: 'all', label: 'All Types' },
  // ... existing options
  { value: 'newEntityType', label: 'New Entity Type' },
];
```

3. **Add field options for the new entity type**:

```typescript
// In NavbarSearch.tsx, update getFieldOptions function
const getFieldOptions = (entityType) => {
  // ... existing code

  switch (entityType) {
    // ... existing cases
    case 'newEntityType':
      return [
        ...commonOptions,
        { value: 'field1', label: 'Field 1' },
        { value: 'field2', label: 'Field 2' },
        // Add relevant fields
      ];
    default:
      return commonOptions;
  }
};
```

4. **Add an icon for the new entity type**:

```typescript
// In NavbarSearch.tsx, update getIcon function
const getIcon = (type) => {
  switch (type) {
    // ... existing cases
    case 'newEntityType': return '🆕'; // Choose appropriate emoji or icon
    default: return '📋';
  }
};
```

5. **Create a backend search function for the new entity type**:

```typescript
// In convex/newEntityType.ts
export const searchNewEntityType = query({
  args: {
    search: v.optional(v.string()),
    type: v.optional(v.string()),
    field: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Implement search logic similar to other entity types
    // ...
  },
});
```

6. **Add the new search function to the SearchContext**:

```typescript
// In SearchContext.tsx
const searchNewEntityType = useQuery(api.newEntityType.searchNewEntityType,
  query.length >= 2 ? { search: query, type: entityType.value, field: fieldFilter.value } : 'skip');

// Add to results processing
const allResults: SearchResult[] = [
  // ... existing results
  ...(searchNewEntityType || []).map(formatNewEntityTypeResult),
];
```

### Adding New Fields to Existing Entity Types

To add new searchable fields to existing entity types:

1. **Update the field options**:

```typescript
// In NavbarSearch.tsx, update getFieldOptions function
case 'existingEntityType':
  return [
    ...commonOptions,
    // ... existing fields
    { value: 'newField', label: 'New Field Label' },
  ];
```

2. **Update the backend search function**:

```typescript
// In convex/existingEntityType.ts
// Modify the search function to include the new field in the search criteria
if (args.field === 'newField') {
  // Add specific filtering for this field
} else if (args.field === 'any') {
  // Include the new field in the "any field" search
}
```

### Match Context Feature

The search functionality includes a match context feature that shows users where the search term was found in each result. This helps users understand why a particular result appeared in their search and makes it easier to find the most relevant results.

### How It Works

1. When performing a search, the backend tracks which field(s) contained the match for each result
2. This information is returned along with the search results
3. The UI displays the field name and a snippet of text surrounding the match

### Implementation Details

#### Backend Search Functions

```typescript
// Example from searchContacts function
if (contact.firstName.toLowerCase().includes(searchTerm)) {
  matchInfo = {
    field: 'First Name',
    context: highlightMatchContext(contact.firstName, searchTerm)
  };
  return true;
}
```

#### Result Formatting

```typescript
// In SearchContext.tsx
const formatContactResult = (contact: any, matchInfo: any): SearchResult => ({
  id: contact._id,
  type: 'contacts',
  title: `${contact.firstName} ${contact.lastName}`,
  subtitle: contact.phone || '',
  metadata: contact.email || '',
  matchField: matchInfo?.field || '',
  matchContext: matchInfo?.context || '',
  url: `/contacts/${contact._id}`,
});
```

#### Result Display

```tsx
// In NavbarSearch.tsx
<div className="flex flex-col items-end">
  <span className="font-medium">{result.subtitle}</span>
  {result.matchField && (
    <div className="text-xs text-gray-500 italic mt-1">
      Found in: <span className="text-blue-600">{result.matchField}</span>
      {result.matchContext && (
        <span className="ml-1">("{result.matchContext}")</span>
      )}
    </div>
  )}
  {getStatusBadge(result.status)}
</div>
```

## Customizing Result Display

To customize how search results are displayed:

1. **Update the result item component**:

```typescript
// In NavbarSearch.tsx
<div className="flex justify-between items-center">
  {/* Customize the layout and information shown for each result */}
  <div className="flex items-center">
    <span className="mr-2 text-lg">{getIcon(result.type)}</span>
    <div>
      <div className="font-medium text-gray-900">{result.title}</div>
      <div className="text-sm text-gray-500">{result.metadata}</div>
      {/* Add additional fields or formatting here */}
    </div>
  </div>
  <div className="flex items-center gap-2">
    <span className="font-medium">{result.subtitle}</span>
    {getStatusBadge(result.status)}
    {/* Add additional badges or indicators here */}
  </div>
</div>
```

## Performance Considerations

### Debouncing

The search input is debounced to prevent excessive API calls while typing:

```typescript
const debouncedSearch = useCallback(
  debounce(() => {
    // Search logic
  }, 300),
  [dependencies]
);
```

### Result Limiting

Search results are limited to prevent performance issues:

- Only the first 5 results are shown in the dropdown
- A "View all results" button navigates to a dedicated search page for more results

### Search Indexing

For optimal performance, ensure your Convex backend has appropriate indexes for search fields:

```typescript
// Example schema with search index
export default defineSchema({
  entityType: defineTable({
    field1: v.string(),
    field2: v.string(),
    // ... other fields
  })
  .index("by_field1", ["field1"])
  .index("by_field2", ["field2"])
  // Consider adding full-text search indexes for text fields
});
```

## Styling Customization

The search component uses Tailwind CSS for styling. To customize the appearance:

### Search Bar

```tsx
// In NavbarSearch.tsx
<div className="flex items-center w-full bg-white border rounded-md overflow-hidden">
  {/* Customize border, background, etc. */}
</div>
```

### Results Dropdown

```tsx
// In NavbarSearch.tsx
<div className="absolute z-50 mt-1 bg-white border rounded-md shadow-lg max-h-[400px] overflow-hidden">
  {/* Customize shadow, border, etc. */}
</div>
```

### Result Items

```tsx
// In NavbarSearch.tsx
<div className="p-3 border-b hover:bg-blue-50 cursor-pointer transition-colors">
  {/* Customize hover state, padding, etc. */}
</div>
```

## Troubleshooting

### Common Issues

1. **Search results not appearing**:
   - Check that the search query is at least 2 characters
   - Verify that the backend search functions are working correctly
   - Check for console errors related to the search API calls

2. **Dropdown positioning issues**:
   - Check that the search container has the correct z-index
   - Verify that the dropdown width calculation is working correctly

3. **Performance issues**:
   - Ensure debouncing is working correctly
   - Check that backend queries are optimized and using indexes
   - Consider limiting the number of results returned from the backend

## Future Enhancements

Potential improvements to consider:

1. **Advanced Filtering**: Add more complex filtering options (date ranges, numeric comparisons)
2. **Search History**: Save recent searches for quick access
3. **Saved Searches**: Allow users to save and name common searches
4. **Voice Search**: Add voice input capability
5. **Fuzzy Matching**: Implement fuzzy search for typo tolerance
6. **Search Analytics**: Track common search terms to improve the application

## Conclusion

The global search functionality provides a powerful way for users to find information across the entire application. By following this documentation, you can maintain, extend, and customize the search experience to meet evolving requirements.
