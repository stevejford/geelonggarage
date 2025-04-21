import ContactForm from "@/components/contacts/ContactForm";

export default function NewContactPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Create New Contact</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <ContactForm />
      </div>
    </div>
  );
}
