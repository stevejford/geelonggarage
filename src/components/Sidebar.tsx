import { Link, useLocation, useNavigate } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";
import {
  LayoutDashboard,
  Users,
  UserCircle,
  Building2,
  FileText,
  ClipboardList,
  Receipt,
  Settings,
  LogOut,
  TestTube,
  Paintbrush
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useClerk();

  // Define links without role filtering
  const links = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { href: "/leads", label: "Leads", icon: <Users size={18} /> },
    { href: "/contacts", label: "Contacts", icon: <UserCircle size={18} /> },
    { href: "/accounts", label: "Accounts", icon: <Building2 size={18} /> },
    { href: "/quotes", label: "Quotes", icon: <FileText size={18} /> },
    { href: "/work-orders", label: "Work Orders", icon: <ClipboardList size={18} /> },
    { href: "/invoices", label: "Invoices", icon: <Receipt size={18} /> },
    { href: "/settings", label: "Settings", icon: <Settings size={18} /> },
    { href: "/testing/workflow2", label: "Workflow Test", icon: <TestTube size={18} /> },
    { href: "/testing/ui-consistency", label: "UI Consistency", icon: <Paintbrush size={18} /> },
  ];

  // Log links for debugging
  console.log('Rendering sidebar with links:', links);

  return (
    <aside className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 h-screen shadow-lg flex flex-col">
      <div className="p-6 border-b border-blue-700">
        <h1 className="text-2xl font-bold text-white">Service Pro</h1>
        <p className="text-blue-300 text-sm mt-1">Field Service Management</p>
      </div>
      <nav className="p-4 space-y-1 flex-1 overflow-y-auto" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {links.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className={`flex items-center px-4 py-3 rounded-md transition-colors text-white ${
              location.pathname.startsWith(link.href)
                ? "bg-blue-700 text-white font-medium"
                : "text-blue-100 hover:bg-blue-700/50"
            }`}
          >
            <span className="mr-3">{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-blue-700">
        <button
          onClick={() => {
            signOut().then(() => {
              navigate('/sign-in');
            });
          }}
          className="w-full bg-transparent border border-blue-600 text-blue-100 hover:bg-blue-700 hover:text-white flex items-center justify-center py-2 px-4 rounded-md"
        >
          <LogOut size={16} className="mr-2" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
