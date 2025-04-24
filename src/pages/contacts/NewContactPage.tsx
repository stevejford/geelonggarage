import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import ContactForm from "@/components/contacts/ContactForm";
import { Container } from "@/components/ui/container";
import { FormLayout } from "@/components/ui/form-layout";

export default function NewContactPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const accountId = searchParams.get("accountId");

  // If accountId is provided, fetch the account to show in the form
  const account = accountId ? useQuery(api.accounts.getAccount, { id: accountId as any }) : null;

  // Determine the back link based on where we came from
  const backLink = accountId ? `/accounts/${accountId}` : "/contacts";
  const backLinkText = accountId ? "Back to Account" : "Back to Contacts";

  // Handle successful contact creation
  const handleSuccess = (contactId: string) => {
    if (accountId) {
      // If we came from an account, go back to that account
      navigate(`/accounts/${accountId}`);
    } else {
      // Otherwise go to the contacts list
      navigate("/contacts");
    }
  };

  return (
    <Container padding="md">
      <FormLayout
        title="Create New Contact"
        description={accountId && account ?
          `Add a new contact for ${account.name}` :
          "Enter the details for the new contact"}
        backLink={backLink}
        backLinkText={backLinkText}
      >
        <ContactForm
          accountId={accountId as any}
          onSuccess={handleSuccess}
        />
      </FormLayout>
    </Container>
  );
}
