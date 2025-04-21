import AccountForm from "@/components/accounts/AccountForm";

export default function NewAccountPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Create New Account</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <AccountForm />
      </div>
    </div>
  );
}
