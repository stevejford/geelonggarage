import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { debounce } from 'lodash';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

// Define types for search filters and results
type EntityType = 'all' | 'invoices' | 'quotes' | 'workOrders' | 'contacts' | 'accounts' | 'leads';
type FieldFilter = 'any' | 'name' | 'number' | 'amount' | 'date' | 'status' | 'address' | 'email' | 'phone';

interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  metadata: string;
  status?: string;
  matchField?: string;
  matchContext?: string;
  url: string;
}

interface SearchContextType {
  globalSearch: string;
  setGlobalSearch: (search: string) => void;
  entityType: { value: EntityType; label: string };
  setEntityType: (type: { value: EntityType; label: string }) => void;
  fieldFilter: { value: FieldFilter; label: string };
  setFieldFilter: (filter: { value: FieldFilter; label: string }) => void;
  results: SearchResult[];
  isLoading: boolean;
  showResults: boolean;
  setShowResults: (show: boolean) => void;
  performSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [globalSearch, setGlobalSearch] = useState('');
  const [entityType, setEntityType] = useState({ value: 'all' as EntityType, label: 'All Types' });
  const [fieldFilter, setFieldFilter] = useState({ value: 'any' as FieldFilter, label: 'Any Field' });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce the search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(globalSearch);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [globalSearch]);

  // Query parameters for search
  const searchParams = debouncedSearch.length >= 2
    ? {
        search: debouncedSearch,
        type: entityType.value,
        field: fieldFilter.value,
        limit: 10 // Limit results for performance
      }
    : 'skip';

  // Fetch search results from Convex backend
  const invoiceResults = useQuery(api.invoices.searchInvoices, searchParams);
  const quoteResults = useQuery(api.quotes.searchQuotes, searchParams);
  const workOrderResults = useQuery(api.workOrders.searchWorkOrders, searchParams);
  const contactResults = useQuery(api.contacts.searchContacts, searchParams);
  const accountResults = useQuery(api.accounts.searchAccounts, searchParams);
  const leadResults = useQuery(api.leads.searchLeads, searchParams);

  // Format results for display
  const formatInvoiceResult = (invoice: any): SearchResult => ({
    id: invoice._id,
    type: 'invoices',
    title: `Invoice #${invoice.invoiceNumber}`,
    subtitle: `$${invoice.total.toFixed(2)}`,
    metadata: invoice.contactName || '',
    status: invoice.status,
    matchField: invoice.matchField || '',
    matchContext: invoice.matchContext || '',
    url: `/invoices/${invoice._id}`,
  });

  const formatQuoteResult = (quote: any): SearchResult => ({
    id: quote._id,
    type: 'quotes',
    title: `Quote #${quote.quoteNumber}`,
    subtitle: `$${quote.total.toFixed(2)}`,
    metadata: quote.contactName || '',
    status: quote.status,
    url: `/quotes/${quote._id}`,
  });

  const formatWorkOrderResult = (workOrder: any): SearchResult => ({
    id: workOrder._id,
    type: 'workOrders',
    title: `Work Order #${workOrder.workOrderNumber}`,
    subtitle: workOrder.scheduledDate ? `Scheduled: ${new Date(workOrder.scheduledDate).toLocaleDateString()}` : '',
    metadata: workOrder.notes || '',
    status: workOrder.status,
    url: `/work-orders/${workOrder._id}`,
  });

  const formatContactResult = (contact: any): SearchResult => {
    console.log('Contact with match info:', contact);
    return {
      id: contact._id,
      type: 'contacts',
      title: `${contact.firstName} ${contact.lastName}`,
      subtitle: contact.phone || '',
      metadata: contact.email || '',
      matchField: contact.matchField || '',
      matchContext: contact.matchContext || '',
      url: `/contacts/${contact._id}`,
    };
  };

  const formatAccountResult = (account: any): SearchResult => ({
    id: account._id,
    type: 'accounts',
    title: account.name,
    subtitle: account.type,
    metadata: account.address || '',
    url: `/accounts/${account._id}`,
  });

  const formatLeadResult = (lead: any): SearchResult => ({
    id: lead._id,
    type: 'leads',
    title: lead.name,
    subtitle: lead.source || '',
    metadata: lead.email || lead.phone || '',
    status: lead.status,
    url: `/leads/${lead._id}`,
  });

  // Combine and process results when search data changes
  useEffect(() => {
    if (debouncedSearch.length >= 2) {
      setIsLoading(true);

      // Wait for all queries to complete
      if (
        invoiceResults !== undefined &&
        quoteResults !== undefined &&
        workOrderResults !== undefined &&
        contactResults !== undefined &&
        accountResults !== undefined &&
        leadResults !== undefined
      ) {
        // Filter by entity type if specified
        let combinedResults: SearchResult[] = [];

        if (entityType.value === 'all' || entityType.value === 'invoices') {
          combinedResults = [...combinedResults, ...(invoiceResults || []).map(formatInvoiceResult)];
        }

        if (entityType.value === 'all' || entityType.value === 'quotes') {
          combinedResults = [...combinedResults, ...(quoteResults || []).map(formatQuoteResult)];
        }

        if (entityType.value === 'all' || entityType.value === 'workOrders') {
          combinedResults = [...combinedResults, ...(workOrderResults || []).map(formatWorkOrderResult)];
        }

        if (entityType.value === 'all' || entityType.value === 'contacts') {
          combinedResults = [...combinedResults, ...(contactResults || []).map(formatContactResult)];
        }

        if (entityType.value === 'all' || entityType.value === 'accounts') {
          combinedResults = [...combinedResults, ...(accountResults || []).map(formatAccountResult)];
        }

        if (entityType.value === 'all' || entityType.value === 'leads') {
          combinedResults = [...combinedResults, ...(leadResults || []).map(formatLeadResult)];
        }

        setResults(combinedResults);
        setShowResults(combinedResults.length > 0);
        setIsLoading(false);
      }
    } else {
      setResults([]);
      setShowResults(false);
      setIsLoading(false);
    }
  }, [
    debouncedSearch,
    entityType.value,
    invoiceResults,
    quoteResults,
    workOrderResults,
    contactResults,
    accountResults,
    leadResults
  ]);

  // Function to trigger a search
  const performSearch = useCallback(() => {
    // Force a refresh of the search results
    if (globalSearch.length >= 2) {
      setIsLoading(true);
      // The actual search is handled by the useEffect and useQuery hooks
      // This just ensures the UI shows loading state and refreshes

      // If the search term hasn't changed, we need to force a refresh
      // by temporarily changing debouncedSearch and then setting it back
      if (globalSearch === debouncedSearch) {
        setDebouncedSearch('');
        setTimeout(() => {
          setDebouncedSearch(globalSearch);
        }, 10);
      }
    }
  }, [globalSearch, debouncedSearch]);

  return (
    <SearchContext.Provider
      value={{
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
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}
