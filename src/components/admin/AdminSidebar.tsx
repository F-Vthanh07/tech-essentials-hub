import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3,
  ChevronLeft,
  Menu,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const menuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Sản phẩm", url: "/admin/products", icon: Package },
  { title: "Đơn hàng", url: "/admin/orders", icon: ShoppingCart },
  { title: "Báo cáo", url: "/admin/reports", icon: BarChart3 },
];

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("Đã đăng xuất");
  };

  return (
    <aside className={cn(
      "bg-card border-r border-border min-h-screen transition-all duration-300 flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!collapsed && (
          <h1 className="text-xl font-bold text-primary">Admin Panel</h1>
        )}
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>
      
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.title}>
              <NavLink
                to={item.url}
                end={item.url === "/admin"}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  "hover:bg-muted",
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full justify-start gap-3 px-3 py-2 text-destructive hover:text-destructive",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Đăng xuất</span>}
        </Button>
        <NavLink 
          to="/" 
          className={cn(
            "flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground transition-colors",
            collapsed && "justify-center px-0"
          )}
        >
          <ChevronLeft className="h-5 w-5" />
          {!collapsed && <span>Về trang chủ</span>}
        </NavLink>
      </div>
    </aside>
  );
};

export default AdminSidebar;
