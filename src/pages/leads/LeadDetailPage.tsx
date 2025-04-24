import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, UserPlus } from "lucide-react";
import LeadStatusBadge from "@/components/leads/LeadStatusBadge";
import LeadForm from "@/components/leads/LeadForm";
import ConvertLeadForm from "@/components/leads/ConvertLeadForm";
import { Container } from "@/components/ui/container";
import { FormLayout } from "@/components/ui/form-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const lead = useQuery(api.leads.getLead, { id: id as any });
  const deleteLead = useMutation(api.leads.deleteLead);

  if (!lead) {
    return (
      <Container padding="md">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Loading lead details...</p>
          </CardContent>
        </Card>
      </Container>
    );
  }

  const handleDelete = async () => {
    try {
      await deleteLead({ id: lead._id });
      navigate("/leads");
    } catch (error) {
      console.error("Error deleting lead:", error);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (isEditing) {
    return (
      <Container padding="md">
        <FormLayout
          title="Edit Lead"
          description="Update the lead information"
          backLink="#"
          backLinkText="Cancel"
          backLinkOnClick={() => setIsEditing(false)}
        >
          <LeadForm
            lead={lead}
            onSuccess={() => setIsEditing(false)}
          />
        </FormLayout>
      </Container>
    );
  }

  if (isConverting) {
    return (
      <Container size="xl" padding="md">
        <FormLayout
          title="Convert Lead to Contact"
          description="Convert this lead into a contact"
          backLink="#"
          backLinkText="Cancel"
          backLinkOnClick={() => setIsConverting(false)}
        >
          <ConvertLeadForm
            lead={lead}
            onSuccess={() => navigate("/contacts")}
            onCancel={() => setIsConverting(false)}
          />
        </FormLayout>
      </Container>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Lead Details</h1>
        <div className="flex space-x-2">
          {lead.status !== "Converted" && (
            <Button
              variant="outline"
              onClick={() => setIsConverting(true)}
            >
              <UserPlus className="mr-2 h-4 w-4" /> Convert to Contact
            </Button>
          )}
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
              <h2 className="text-xl font-semibold">{lead.name}</h2>
              <div className="mt-1">
                <LeadStatusBadge status={lead.status} />
              </div>
            </div>
            <div className="text-sm text-gray-500">
              <div>Created: {formatDate(lead.createdAt)}</div>
              <div>Updated: {formatDate(lead.updatedAt)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
              <div className="mt-2 space-y-1">
                {lead.email && (
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Email:</span>
                    <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                      {lead.email}
                    </a>
                  </div>
                )}
                {lead.phone && (
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Phone:</span>
                    <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">
                      {lead.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Lead Information</h3>
              <div className="mt-2 space-y-1">
                <div className="flex items-center">
                  <span className="font-medium mr-2">Source:</span>
                  <span>{lead.source || "—"}</span>
                </div>
              </div>
            </div>
          </div>

          {lead.notes && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500">Notes</h3>
              <div className="mt-2 p-3 bg-gray-50 rounded-md whitespace-pre-wrap">
                {lead.notes}
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
              Are you sure you want to delete this lead? This action cannot be undone.
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
