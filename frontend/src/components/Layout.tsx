
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { BarChart3, LineChart, PieChart, Table } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  
  const navItems = [
    { name: "Overview", path: "/", icon: <PieChart className="w-5 h-5" /> },
    { name: "Segmentation", path: "/segmentation", icon: <Table className="w-5 h-5" /> },
    { name: "Prediction", path: "/prediction", icon: <LineChart className="w-5 h-5" /> },
    { name: "Similar Offers", path: "/prescriptive", icon: <BarChart3 className="w-5 h-5" /> }
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 shadow-sm">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-900">Laptop Analytics</h1>
        </div>
        <div className="flex flex-col flex-1 py-4">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-md group transition-colors",
                  location.pathname === item.path
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                )}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">
        {/* Mobile header */}
        <div className="md:hidden border-b border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Laptop Analytics</h1>
          </div>
        </div>
        
        {/* Mobile navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 z-10">
          <div className="flex justify-around">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center p-2 rounded-md",
                  location.pathname === item.path
                    ? "text-blue-700"
                    : "text-gray-700"
                )}
              >
                {item.icon}
                <span className="text-xs mt-1">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
