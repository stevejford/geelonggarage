import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Plus, Search, UserCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

export default function ContactsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  // Fetch contacts with optional filtering
  const contactsData = useQuery(api.contacts.getContacts, {
    search: search || undefined,
    sortBy: "lastName",
    sortOrder: "asc",
  });

  // Ensure contacts is always an array
  const contacts = Array.isArray(contactsData) ? contactsData : [];

  // Handle creating a new contact
  const handleCreateContact = () => {
    navigate("/contacts/new");
  };

  // Handle viewing a contact
  const handleViewContact = (contactId: string) => {
    navigate(`/contacts/${contactId}`);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Contacts</h1>
          <p className="text-gray-500 mt-1">Manage your customer contacts</p>
        </div>
        <Button onClick={handleCreateContact} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> New Contact
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search contacts..."
              className="pl-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contacts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center">
                  <div className="flex flex-col items-center">
                    <UserCircle className="h-12 w-12 text-gray-300 mb-2" />
                    <p className="text-gray-500 mb-1">No contacts found</p>
                    <p className="text-sm text-gray-400">Create your first contact to get started</p>
                    <Button
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={handleCreateContact}
                    >
                      <Plus className="mr-2 h-4 w-4" /> New Contact
                    </Button>
                  </div>
                </td>
              </tr>
            )}

            {contacts.map((contact) => (
              <tr
                key={contact._id.toString()}
                className="hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => handleViewContact(contact._id.toString())}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {contact.firstName} {contact.lastName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {contact.email && <div>{contact.email}</div>}
                    {contact.phone && <div>{contact.phone}</div>}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {contact.address && (
                      <div>
                        {contact.address}
                        {contact.city && `, ${contact.city}`}
                        {contact.state && `, ${contact.state}`}
                        {contact.zip && ` ${contact.zip}`}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    variant="outline"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewContact(contact._id.toString());
                    }}
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
