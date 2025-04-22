import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Building } from "lucide-react";
import ContactForm from "@/components/contacts/ContactForm";
import AccountLinkForm from "@/components/accounts/AccountLinkForm";
import EnhancedStreetView from "@/components/common/EnhancedStreetView";
import GoogleMap from "@/components/common/GoogleMap";
import GoogleMapsProvider from "@/components/common/GoogleMapsProvider";

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLinkingAccount, setIsLinkingAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const contact = useQuery(api.contacts.getContact, { id: id as any });
  const deleteContact = useMutation(api.contacts.deleteContact);

  if (!contact) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <p className="text-center text-gray-500">Loading contact details...</p>
        </div>
      </div>
    );
  }

  // Coordinates are now properly handled by the map components

  const handleDelete = async () => {
    try {
      await deleteContact({ id: contact._id });
      navigate("/contacts");
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (isEditing) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Edit Contact</h1>
        <div className="bg-white shadow-md rounded-lg p-6">
          <ContactForm
            contact={contact}
            onSuccess={() => setIsEditing(false)}
          />
        </div>
      </div>
    );
  }

  if (isLinkingAccount) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Link Account to Contact</h1>
        <div className="bg-white shadow-md rounded-lg p-6">
          <AccountLinkForm
            contactId={contact._id}
            onSuccess={() => setIsLinkingAccount(false)}
            onCancel={() => setIsLinkingAccount(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contact Details</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsLinkingAccount(true)}
          >
            <Building className="mr-2 h-4 w-4" /> Link Account
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
              <h2 className="text-xl font-semibold">{contact.firstName} {contact.lastName}</h2>
            </div>
            <div className="text-sm text-gray-500">
              <div>Created: {formatDate(contact.createdAt)}</div>
              <div>Updated: {formatDate(contact.updatedAt)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
              <div className="mt-2 space-y-1">
                {contact.email && (
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Email:</span>
                    <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                      {contact.email}
                    </a>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Phone:</span>
                    <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline">
                      {contact.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Address</h3>
              <div className="mt-2 space-y-1">
                {contact.address && (
                  <div>
                    <div>{contact.address}</div>
                    <div>
                      {contact.city && `${contact.city}, `}
                      {contact.state && `${contact.state} `}
                      {contact.zip}
                      {contact.country && `, ${contact.country}`}
                    </div>
                  </div>
                )}
                {!contact.address && (
                  <div className="text-gray-400">No address provided</div>
                )}
              </div>
            </div>
          </div>

          {/* Display Street View and Map side by side if address is available */}
          {contact.address && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Business Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Street View */}
                <div className="aspect-video rounded-md overflow-hidden">
                  {contact.latitude && contact.longitude ? (
                    <EnhancedStreetView
                      latitude={contact.latitude}
                      longitude={contact.longitude}
                      heading={0}
                      className="h-full w-full"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-100">
                      <p className="text-gray-500">Street View not available</p>
                    </div>
                  )}
                </div>

                {/* Map */}
                <div className="aspect-video rounded-md overflow-hidden bg-gray-100">
                  <GoogleMap
                    latitude={contact.latitude}
                    longitude={contact.longitude}
                    address={contact.address}
                    city={contact.city}
                    state={contact.state}
                    zip={contact.zip}
                    country={contact.country}
                    className="h-full w-full"
                  />
                </div>
              </div>
              {/* Link to view on Google Maps */}
              <div className="mt-2 text-xs text-gray-500">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${contact.address}, ${contact.city || ''}, ${contact.state || ''} ${contact.zip || ''} ${contact.country || ''}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View on Google Maps
                </a>
              </div>
            </div>
          )}

          {/* Linked Accounts */}
          {contact.accounts && contact.accounts.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Linked Accounts</h3>
              <div className="bg-gray-50 rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Address
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Relationship
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {contact.accounts.map((account: any) => (
                      <tr
                        key={account._id.toString()}
                        className="hover:bg-gray-100 cursor-pointer"
                        onClick={() => navigate(`/accounts/${account._id}`)}
                      >
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{account.name}</div>
                          {account.isPrimary && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Primary
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{account.type}</div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{account.address}</div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{account.relationship || "—"}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {contact.notes && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500">Notes</h3>
              <div className="mt-2 p-3 bg-gray-50 rounded-md whitespace-pre-wrap">
                {contact.notes}
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
              Are you sure you want to delete this contact? This action cannot be undone.
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
