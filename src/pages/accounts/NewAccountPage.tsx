import AccountForm from "@/components/accounts/AccountForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewAccountPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Create New Account</h1>
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <AccountForm />
        </CardContent>
      </Card>
    </div>
  );
}
