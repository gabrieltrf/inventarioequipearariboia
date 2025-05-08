import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter
} from "@/components/ui/sidebar";
import { Package, ArrowRightLeft, Calendar, BarChart3, Users, Moon, Sun, Bell } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useInventory } from "@/contexts/InventoryContext";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { toast } from "@/hooks/use-toast";
import { useNotifications } from "@/contexts/NotificationsContext";

export function AppSidebar() {
  const { currentUser, users, setUser } = useInventory();
  const { unreadCount } = useNotifications();
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  // Menu items com rotas
  const menuItems = [
    {
      title: "Inventário",
      icon: Package,
      url: "/",
      ariaLabel: "Página de inventário"
    },
    {
      title: "Movimentações",
      icon: ArrowRightLeft,
      url: "/movimentacoes",
      ariaLabel: "Página de movimentações"
    },
    {
      title: "Empréstimos",
      icon: Calendar,
      url: "/emprestimos",
      ariaLabel: "Página de empréstimos"
    },
    {
      title: "Relatórios",
      icon: BarChart3,
      url: "/relatorios",
      ariaLabel: "Página de relatórios"
    }
  ];

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    toast({
      title: `Modo ${newTheme === "dark" ? "escuro" : "claro"} ativado`,
      description: `O tema foi alterado para o modo ${newTheme === "dark" ? "escuro" : "claro"}.`,
    });
  };

  const hasUnreadNotifications = unreadCount > 0;

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-5">
        <h2 className="text-xl font-bold">Inventário Fácil</h2>
        <p className="text-xs text-muted-foreground">Sistema de gerenciamento</p>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                  >
                    <Link 
                      to={item.url} 
                      className={`flex items-center ${location.pathname === item.url ? 'text-primary font-medium' : ''}`}
                      aria-label={item.ariaLabel}
                    >
                      <item.icon className="mr-2 h-5 w-5" aria-hidden="true" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                >
                  <Link 
                    to="/notificacoes" 
                    className={`flex items-center ${location.pathname === "/notificacoes" ? 'text-primary font-medium' : ''}`}
                    aria-label="Notificações"
                  >
                    <div className="relative mr-2">
                      <Bell className="h-5 w-5" aria-hidden="true" />
                      {hasUnreadNotifications && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
                      )}
                    </div>
                    <span>Notificações</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Administração</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-4 py-2">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4" aria-hidden="true" />
                <Label htmlFor="user-select">Usuário</Label>
              </div>
              <Select
                value={currentUser.id}
                onValueChange={(value) => setUser(value)}
              >
                <SelectTrigger id="user-select" className="w-full">
                  <SelectValue placeholder="Selecionar usuário" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.role === 'admin' ? 'Admin' : 'Membro'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="px-4 py-2 flex justify-between items-center">
              <div className="flex items-center gap-2">
                {theme === "dark" ? (
                  <Moon className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Sun className="h-4 w-4" aria-hidden="true" />
                )}
                <Label>Tema</Label>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleTheme}
                aria-label={`Alternar para modo ${theme === "dark" ? "claro" : "escuro"}`}
              >
                {theme === "dark" ? "Claro" : "Escuro"}
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t p-6">
        <div className="flex flex-col">
          <div className="font-medium">{currentUser.name}</div>
          <div className="text-xs text-muted-foreground">
            {currentUser.email}
          </div>
          <div className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 mt-1 inline-block w-min whitespace-nowrap">
            {currentUser.role === 'admin' ? 'Administrador' : 'Membro'}
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
