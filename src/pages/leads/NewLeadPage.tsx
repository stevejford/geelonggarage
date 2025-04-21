import LeadForm from "@/components/leads/LeadForm";

export default function NewLeadPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Create New Lead</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <LeadForm />
      </div>
    </div>
  );
}
