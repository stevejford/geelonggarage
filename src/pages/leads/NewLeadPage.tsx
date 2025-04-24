import LeadForm from "@/components/leads/LeadForm";
import { Container } from "@/components/ui/container";
import { FormLayout } from "@/components/ui/form-layout";

export default function NewLeadPage() {
  return (
    <Container padding="md">
      <FormLayout
        title="Create New Lead"
        description="Enter the details for the new lead"
        backLink="/leads"
        backLinkText="Back to Leads"
      >
        <LeadForm />
      </FormLayout>
    </Container>
  );
}
