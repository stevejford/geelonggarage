import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, UserPlus } from "lucide-react";
import AccountForm from "@/components/accounts/AccountForm";
import EnhancedStreetView from "@/components/common/EnhancedStreetView";
import GoogleMap from "@/components/common/GoogleMap";
import GoogleMapsProvider from "@/components/common/GoogleMapsProvider";

export default function AccountDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const account = useQuery(api.accounts.getAccount, { id: id as any });
  const deleteAccount = useMutation(api.accounts.deleteAccount);
  const unlinkContact = useMutation(api.accounts.unlinkContactFromAccount);

  if (!account) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <p className="text-center text-gray-500">Loading account details...</p>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    try {
      await deleteAccount({ id: account._id });
      navigate("/accounts");
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  const handleUnlinkContact = async (contactId: string) => {
    try {
      await unlinkContact({
        contactId: contactId as any,
        accountId: account._id,
      });
    } catch (error) {
      console.error("Error unlinking contact:", error);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (isEditing) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Edit Account</h1>
        <div className="bg-white shadow-md rounded-lg p-6">
          <AccountForm
            account={account}
            onSuccess={() => setIsEditing(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Account Details</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/contacts/new?accountId=${account._id}`)}
          >
            <UserPlus className="mr-2 h-4 w-4" /> Add Contact
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
          >
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold">{account.name}</h2>
              <div className="mt-1 text-sm text-gray-500">{account.type}</div>
            </div>
            <div className="text-sm text-gray-500">
              <div>Created: {formatDate(account.createdAt)}</div>
              <div>Updated: {formatDate(account.updatedAt)}</div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500">Address</h3>
            <div className="mt-2">
              {account.unit && <div>{account.unit}</div>}
              <div>{account.address}</div>
              <div>
                {account.city && `${account.city}, `}
                {account.state && `${account.state} `}
                {account.zip}
              </div>
              {account.country && <div>{account.country}</div>}
            </div>
          </div>

          {/* Business Details Section - Only shown for Commercial/Industrial accounts */}
          {(account.type === "Commercial" || account.type === "Industrial") && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Business Information */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Business Information</h3>
                <div className="bg-gray-50 rounded-md p-4">
                  {account.businessCategory && (
                    <div className="mb-2">
                      <span className="text-xs text-gray-500">Category:</span>
                      <div className="text-sm capitalize">{account.businessCategory.replace(/_/g, ' ')}</div>
                    </div>
                  )}

                  {account.phoneNumber && (
                    <div className="mb-2">
                      <span className="text-xs text-gray-500">Phone:</span>
                      <div className="text-sm">
                        <a href={`tel:${account.phoneNumber}`} className="text-blue-600 hover:underline">
                          {account.phoneNumber}
                        </a>
                      </div>
                    </div>
                  )}

                  {account.website && (
                    <div className="mb-2">
                      <span className="text-xs text-gray-500">Website:</span>
                      <div className="text-sm">
                        <a href={account.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {account.website.replace(/^https?:\/\//i, '')}
                        </a>
                      </div>
                    </div>
                  )}

                  {account.businessStatus && (
                    <div>
                      <span className="text-xs text-gray-500">Status:</span>
                      <div className="text-sm capitalize">{account.businessStatus.toLowerCase().replace(/_/g, ' ')}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Business Hours */}
              {account.openingHours && account.openingHours.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Business Hours</h3>
                  <div className="bg-gray-50 rounded-md p-4">
                    <ul className="text-sm space-y-1">
                      {account.openingHours.map((hours: string, index: number) => (
                        <li key={index} className="flex">
                          <span className="w-28 font-medium">{hours.split(': ')[0]}:</span>
                          <span>{hours.split(': ')[1]}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Business Photos - Only shown if available */}
          {console.log('Account photo data:', {
            placeId: account.placeId,
            photoCount: account.photoCount,
            photoMetadata: account.photoMetadata,
            photoReferences: (account as any).photoReferences
          })}
          {/* Support both old and new photo data structures */}
          {account.placeId && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Business Location</h3>
              {/* Display Street View and Map side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Street View */}
                <div className="aspect-video rounded-md overflow-hidden">
                  <EnhancedStreetView
                    latitude={account.latitude || 0}
                    longitude={account.longitude || 0}
                    heading={0}
                    className="h-full w-full"
                  />
                </div>

                {/* Map */}
                <div className="aspect-video rounded-md overflow-hidden bg-gray-100">
                  <GoogleMap
                    latitude={account.latitude}
                    longitude={account.longitude}
                    address={account.address}
                    city={account.city}
                    state={account.state}
                    zip={account.zip}
                    country={account.country}
                    className="h-full w-full"
                  />
                </div>
              </div>
              {/* Link to view on Google Maps */}
              <div className="mt-2 text-xs text-gray-500">
                <a
                  href={`https://www.google.com/maps/place/?q=place_id:${account.placeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View on Google Maps
                </a>
              </div>
            </div>
          )}

          {/* Linked Contacts */}
          {account.contacts && account.contacts.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Linked Contacts</h3>
              <div className="bg-gray-50 rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact Info
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Relationship
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {account.contacts.map((contact: any) => (
                      <tr
                        key={contact._id.toString()}
                        className="hover:bg-gray-100"
                      >
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div
                            className="text-sm font-medium text-blue-600 hover:underline cursor-pointer"
                            onClick={() => navigate(`/contacts/${contact._id}`)}
                          >
                            {contact.firstName} {contact.lastName}
                          </div>
                          {contact.isPrimary && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Primary
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {contact.email && <div>{contact.email}</div>}
                            {contact.phone && <div>{contact.phone}</div>}
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{contact.relationship || "—"}</div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnlinkContact(contact._id.toString())}
                          >
                            Unlink
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {account.notes && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500">Notes</h3>
              <div className="mt-2 p-3 bg-gray-50 rounded-md whitespace-pre-wrap">
                {account.notes}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
            <p className="mb-6">
              Are you sure you want to delete this account? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
