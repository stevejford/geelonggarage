import { Button } from '@/components/ui/button';
import { Building, User, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DuplicateWarningProps {
  type: 'account' | 'contact' | 'lead';
  duplicates: any[];
  onIgnore: () => void;
  onSelectDuplicate?: (duplicate: any) => void;
}

export default function DuplicateWarning({
  type,
  duplicates,
  onIgnore,
  onSelectDuplicate,
}: DuplicateWarningProps) {
  const navigate = useNavigate();
  
  const getIcon = () => {
    switch (type) {
      case 'account':
        return <Building className="h-5 w-5 text-yellow-500" />;
      case 'contact':
      case 'lead':
        return <User className="h-5 w-5 text-yellow-500" />;
    }
  };
  
  const getTitle = () => {
    switch (type) {
      case 'account':
        return 'Potential Duplicate Accounts Found';
      case 'contact':
        return 'Potential Duplicate Contacts Found';
      case 'lead':
        return 'Potential Duplicate Leads Found';
    }
  };
  
  const getItemDetails = (item: any) => {
    switch (type) {
      case 'account':
        return {
          title: item.name,
          subtitle: item.type,
          details: item.formattedAddress || item.address,
          url: `/accounts/${item._id}`,
        };
      case 'contact':
        return {
          title: `${item.firstName} ${item.lastName}`,
          subtitle: item.email || item.phone,
          details: item.formattedAddress || item.address,
          url: `/contacts/${item._id}`,
        };
      case 'lead':
        return {
          title: item.name,
          subtitle: item.email || item.phone,
          details: item.source,
          url: `/leads/${item._id}`,
        };
    }
  };
  
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mt-4">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-yellow-500" />
        <div className="ml-3">
          <h3 className="text-yellow-800 font-medium">{getTitle()}</h3>
          <p className="text-yellow-700 text-sm mt-1">
            We found existing {type}s that might be duplicates.
            {type === 'account' && ' If this is a different location of the same business, consider marking it as a franchise.'}
          </p>
        </div>
      </div>
      
      <div className="mt-3 space-y-2">
        {duplicates.map(item => {
          const details = getItemDetails(item);
          return (
            <div key={item._id} className="flex justify-between items-center p-2 bg-white rounded border">
              <div>
                <div className="font-medium">{details.title}</div>
                <div className="text-sm text-gray-500">{details.subtitle}</div>
                {details.details && (
                  <div className="text-xs text-gray-400">{details.details}</div>
                )}
              </div>
              <div className="flex space-x-2">
                {onSelectDuplicate && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectDuplicate(item)}
                  >
                    Select
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(details.url)}
                >
                  View
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-3 flex justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-yellow-800"
          onClick={() => window.open('https://support.google.com/business/answer/7506150?hl=en', '_blank')}
        >
          Why am I seeing this?
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200"
          onClick={onIgnore}
        >
          Create Anyway
        </Button>
      </div>
    </div>
  );
}
