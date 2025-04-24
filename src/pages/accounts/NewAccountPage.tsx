import AccountForm from "@/components/accounts/AccountForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormLayout } from "@/components/ui/form-layout";
import { Container } from "@/components/ui/container";

export default function NewAccountPage() {
  return (
    <Container padding="md">
      <FormLayout
        title="Create New Account"
        description="Enter the details for the new account"
        backLink="/accounts"
        backLinkText="Back to Accounts"
      >
        <AccountForm />
      </FormLayout>
    </Container>
  );
}
