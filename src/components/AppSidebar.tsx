
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
import { Package, ArrowRightLeft, Calendar, BarChart3, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useInventory } from "@/contexts/InventoryContext";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const { currentUser, users, setUser } = useInventory();
  const location = useLocation();

  // Menu items com rotas
  const menuItems = [
    {
      title: "Inventário",
      icon: Package,
      url: "/"
    },
    {
      title: "Movimentações",
      icon: ArrowRightLeft,
      url: "/movimentacoes"
    },
    {
      title: "Empréstimos",
      icon: Calendar,
      url: "/emprestimos"
    },
    {
      title: "Relatórios",
      icon: BarChart3,
      url: "/relatorios"
    }
  ];

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
                    active={location.pathname === item.url}
                  >
                    <Link to={item.url} className="flex items-center">
                      <item.icon className="mr-2 h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Administração</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-4 py-2">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4" />
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
