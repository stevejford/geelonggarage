import { Settings as SettingsIcon, Users, Bell, Shield, Database, CreditCard } from "lucide-react";
import { useUser } from "@clerk/clerk-react";

export default function Settings() {
  const { user } = useUser();

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account and application settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-medium">Settings</h2>
            </div>
            <nav className="p-2">
              {[
                { icon: <Users size={18} />, label: "Profile", active: true },
                { icon: <Bell size={18} />, label: "Notifications" },
                { icon: <Shield size={18} />, label: "Security" },
                { icon: <Database size={18} />, label: "Data Management" },
                { icon: <CreditCard size={18} />, label: "Billing" },
              ].map((item, index) => (
                <a
                  key={index}
                  href="#"
                  className={`flex items-center px-4 py-3 rounded-md transition-colors ${item.active
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-medium">Profile Settings</h2>
            </div>
            <div className="p-6 space-y-6">
              <section>
                <h3 className="text-lg font-medium mb-4">Your Profile</h3>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold">
                    {user?.firstName?.charAt(0) || "U"}
                  </div>
                  <div>
                    <p className="font-medium">{user?.fullName || "User"}</p>
                    <p className="text-sm text-gray-500">{user?.primaryEmailAddress?.emailAddress || "No email"}</p>
                    <p className="text-xs text-gray-400 mt-1">User</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-md p-4">
                    <h4 className="font-medium mb-2">Personal Settings</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Update your profile information and preferences.
                    </p>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                      Edit Profile
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-md p-4">
                    <h4 className="font-medium mb-2">Notification Preferences</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Customize how and when you receive notifications.
                    </p>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                      Manage Notifications
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
