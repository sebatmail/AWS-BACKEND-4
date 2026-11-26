import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  PawPrint,
  CalendarDays,
  FileHeart,
  BellRing,
  CreditCard,
  Stethoscope,
  ShieldAlert,
  Database,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";

export function AppSidebar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const auth = useAuth();
  const role = auth.role;

  // Senior RBAC - Definición de grupos de menú por perfil
  let groups: Array<{
    label: string;
    items: Array<{
      title: string;
      url: string;
      icon: any;
      external?: boolean;
    }>;
  }> = [];

  if (role === "superadmin" || role === "admin") {
    // 👑 ADMINISTRADOR & DOCENTE EVALUADOR (ACCESO TOTAL)
    groups = [
      {
        label: "General",
        items: [{ title: "Dashboard Global", url: "/", icon: LayoutDashboard }],
      },
      {
        label: "Clínica Veterinaria",
        items: [
          { title: "Tutores / Dueños", url: "/tutores", icon: Users },
          { title: "Mascotas / Pacientes", url: "/mascotas", icon: PawPrint },
          { title: "Agenda Médica", url: "/agenda", icon: CalendarDays },
          { title: "Profesionales", url: "/profesionales", icon: Stethoscope },
          { title: "Fichas Clínicas", url: "/fichas", icon: FileHeart },
        ],
      },
      {
        label: "Operación & Cobros",
        items: [
          { title: "Recordatorios Vacunas", url: "/recordatorios", icon: BellRing },
          { title: "Pasarelas de Pago", url: "/pagos", icon: CreditCard },
        ],
      },
      {
        label: "Backend & Evaluación",
        items: [
          { title: "Django Admin (Profe)", url: "/admin/", icon: ShieldAlert, external: true },
          { title: "API RESTful (DRF)", url: "/api/mascotas/", icon: Database, external: true },
          {
            title: "Evidencia IA (Prompts)",
            url: "https://github.com/sebatmail/AWS-BACKEND-4/blob/main/backend/docs/prompts_ia.md",
            icon: Sparkles,
            external: true,
          },
        ],
      },
    ];
  } else if (role === "vet") {
    // 🩺 MÉDICO VETERINARIO (ENFOQUE CLÍNICO MÉDICO)
    // Sin acceso a pasarelas financieras, administración global ni backend AWS
    groups = [
      {
        label: "Gestión Médica",
        items: [{ title: "Dashboard Clínico", url: "/", icon: LayoutDashboard }],
      },
      {
        label: "Atención Pacientes",
        items: [
          { title: "Mascotas / Pacientes", url: "/mascotas", icon: PawPrint },
          { title: "Fichas Clínicas", url: "/fichas", icon: FileHeart },
          { title: "Agenda de Turnos", url: "/agenda", icon: CalendarDays },
          { title: "Directorio Tutores", url: "/tutores", icon: Users },
        ],
      },
      {
        label: "Controles y Salud",
        items: [
          { title: "Recordatorios Vacunas", url: "/recordatorios", icon: BellRing },
        ],
      },
    ];
  } else if (role === "tutor") {
    // 👤 TUTORA RESPONSABLE / CLIENTE (PORTAL PRIVADO DEL TUTOR)
    // Estrictamente restringido: solo ve sus mascotas, sus recetas, sus citas y sus pagos
    groups = [
      {
        label: "Mi Portal PetCare",
        items: [
          { title: "Mi Resumen", url: "/", icon: LayoutDashboard },
          { title: "Mis Mascotas", url: "/mascotas", icon: PawPrint },
          { title: "Mis Fichas & Recetas", url: "/fichas", icon: FileHeart },
          { title: "Mis Citas Médicas", url: "/agenda", icon: CalendarDays },
          { title: "Mis Pagos & Boletas", url: "/pagos", icon: CreditCard },
        ],
      },
    ];
  } else {
    // 👁️ INVITADO / GUEST
    groups = [
      {
        label: "Catálogo Público",
        items: [
          { title: "Inicio", url: "/", icon: LayoutDashboard },
          { title: "Servicios y Pacientes", url: "/mascotas", icon: PawPrint },
          { title: "Equipo Médico", url: "/profesionales", icon: Stethoscope },
        ],
      },
    ];
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <PawPrint className="size-5" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="font-display text-lg font-semibold leading-none text-sidebar-accent-foreground">
              PetCare
            </p>
            <p className="text-xs text-sidebar-foreground/70">
              {role === "tutor" ? "Portal del Tutor" : role === "vet" ? "Módulo Clínico" : "Gestión Clínica INACAP"}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((g) => (
          <SidebarGroup key={g.label}>
            <SidebarGroupLabel>{g.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((i) => (
                  <SidebarMenuItem key={i.url}>
                    {"external" in i && i.external ? (
                      <SidebarMenuButton asChild tooltip={i.title}>
                        <a
                          href={i.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between"
                        >
                          <span className="flex items-center gap-2">
                            <i.icon className="size-4 text-primary" />
                            <span>{i.title}</span>
                          </span>
                          <ExternalLink className="size-3 text-muted-foreground ml-auto opacity-70" />
                        </a>
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton asChild isActive={path === i.url} tooltip={i.title}>
                        <Link to={i.url}>
                          <i.icon />
                          <span>{i.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer de Infraestructura AWS - VISIBLE ÚNICAMENTE PARA SUPERADMIN Y ADMIN */}
      {(role === "superadmin" || role === "admin") && (
        <SidebarFooter>
          <div className="px-2 pb-2 text-[11px] text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden space-y-1 border-t pt-2">
            <p className="font-semibold text-emerald-600 dark:text-emerald-400">
              ● RDS PostgreSQL 16.9 (KMS Privada)
            </p>
            <p className="text-muted-foreground font-mono">EC2 Front: 32.202.76.247</p>
            <p className="text-muted-foreground font-mono">EC2 Back: 54.162.236.160</p>
            <p className="text-muted-foreground font-mono">API Gateway: vj6thiz42d</p>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
