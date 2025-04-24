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
  Paintbrush,
  BarChart3,
  CheckSquare,
  PieChart,
  Wrench,
  DollarSign,
  MessageSquare
} from "lucide-react";

interface SidebarProps {
  collapsed?: boolean;
}

export default function Sidebar({ collapsed = false }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useClerk();

  // Define links without role filtering
  const links = [
    // Main navigation
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { href: "/leads", label: "Leads", icon: <Users size={18} /> },
    { href: "/contacts", label: "Contacts", icon: <UserCircle size={18} /> },
    { href: "/accounts", label: "Accounts", icon: <Building2 size={18} /> },
    { href: "/quotes", label: "Quotes", icon: <FileText size={18} /> },
    { href: "/work-orders", label: "Work Orders", icon: <ClipboardList size={18} /> },
    { href: "/invoices", label: "Invoices", icon: <Receipt size={18} /> },
    { href: "/tasks", label: "Tasks", icon: <CheckSquare size={18} /> },
    { href: "/communication", label: "Communication", icon: <MessageSquare size={18} /> },

    // Reports
    { href: "/reports", label: "Reports", icon: <BarChart3 size={18} /> },
    { href: "/reports/sales-performance", label: "Sales Performance", icon: <DollarSign size={18} /> },
    { href: "/reports/accounts-receivable", label: "AR Aging", icon: <PieChart size={18} /> },

    // Settings and Testing
    { href: "/settings", label: "Settings", icon: <Settings size={18} /> },
    { href: "/testing/workflow2", label: "Workflow Test", icon: <TestTube size={18} /> },
    { href: "/testing/chart-data", label: "Chart Data Test", icon: <BarChart3 size={18} /> },
    { href: "/testing/ui-consistency", label: "UI Consistency", icon: <Paintbrush size={18} /> },
  ];

  // Group links by category
  const mainLinks = links.slice(0, 9);
  const reportLinks = links.slice(9, 12);
  const settingsAndTestingLinks = links.slice(12);

  // Function to render a group of links
  const renderLinkGroup = (groupLinks: typeof links) => {
    return groupLinks.map((link) => (
      <Link
        key={link.href}
        to={link.href}
        className={`flex items-center ${collapsed ? 'justify-center' : 'px-4'} py-3 rounded-md transition-colors text-white ${
          location.pathname.startsWith(link.href)
            ? "bg-blue-700 text-white font-medium"
            : "text-blue-100 hover:bg-blue-700/50"
        }`}
        title={collapsed ? link.label : undefined}
      >
        <span className={collapsed ? '' : 'mr-3'}>{link.icon}</span>
        {!collapsed && <span>{link.label}</span>}
      </Link>
    ));
  };

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-gradient-to-b from-blue-900 to-blue-800 h-full shadow-lg flex flex-col transition-all duration-300 ease-in-out -mt-16`}>
      {/* Main navigation area with scrolling */}
      <nav className="p-2 flex-1 overflow-y-auto">
        {/* Main Navigation */}
        <div className="space-y-1 mb-4">
          {renderLinkGroup(mainLinks)}
        </div>

        {/* Reports Section */}
        {!collapsed && <div className="px-4 py-2 text-xs font-semibold text-blue-300 uppercase tracking-wider">Reports</div>}
        <div className="space-y-1 mb-4">
          {renderLinkGroup(reportLinks)}
        </div>

        {/* Settings & Testing Section */}
        {!collapsed && <div className="px-4 py-2 text-xs font-semibold text-blue-300 uppercase tracking-wider">Settings & Testing</div>}
        <div className="space-y-1">
          {renderLinkGroup(settingsAndTestingLinks)}
        </div>
      </nav>
    </aside>
  );
}
