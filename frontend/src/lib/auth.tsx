import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

export type Role = "superadmin" | "admin" | "vet" | "tutor" | "guest";

export interface UserProfile {
  id: string;
  name: string;
  role: Role;
  roleName: string;
  badge: string;
  badgeColor: string;
  avatar: string;
  email: string;
  tutorId?: string; // Para vincular tutores con sus mascotas en la tienda
}

export const PRESET_USERS: Record<string, UserProfile> = {
  profe: {
    id: "profe",
    name: "Prof. Marcelo Alvarado",
    role: "superadmin",
    roleName: "Docente Evaluador (Superadmin)",
    badge: "Superadmin / Docente",
    badgeColor: "bg-red-600 text-white",
    avatar: "👨‍🏫",
    email: "marcelo.alvarado@inacap.cl",
  },
  admin: {
    id: "admin",
    name: "Sebastián Torres Zamorano",
    role: "admin",
    roleName: "Administrador General de Clínica",
    badge: "Administrador",
    badgeColor: "bg-amber-600 text-white",
    avatar: "👑",
    email: "seba.torres@petcare.cl",
  },
  seba: {
    id: "seba",
    name: "Sebastián Torres",
    role: "admin",
    roleName: "Administrador General",
    badge: "Administrador",
    badgeColor: "bg-amber-600 text-white",
    avatar: "👑",
    email: "sebastian.torres33@inacapmail.cl",
  },
  vet: {
    id: "vet",
    name: "Dra. Valentina Soto",
    role: "vet",
    roleName: "Médico Veterinario Especialista",
    badge: "Veterinario",
    badgeColor: "bg-emerald-600 text-white",
    avatar: "👩‍⚕️",
    email: "v.soto@petcare.cl",
  },
  vet_patricia: {
    id: "vet_patricia",
    name: "Dra. Patricia Soto",
    role: "vet",
    roleName: "Médico Veterinario Especialista",
    badge: "Veterinario",
    badgeColor: "bg-emerald-600 text-white",
    avatar: "👩‍⚕️",
    email: "patricia.soto@petcare.cl",
  },
  vet_carlos: {
    id: "vet_carlos",
    name: "Dr. Carlos Mendoza",
    role: "vet",
    roleName: "Médico Veterinario Especialista",
    badge: "Veterinario",
    badgeColor: "bg-emerald-600 text-white",
    avatar: "👨‍⚕️",
    email: "carlos.mendoza@petcare.cl",
  },
  tutor: {
    id: "tutor",
    name: "Camila Rojas",
    role: "tutor",
    roleName: "Tutora Responsable (Cliente)",
    badge: "Tutor / Cliente",
    badgeColor: "bg-blue-600 text-white",
    avatar: "👤",
    email: "camila.rojas@mail.cl",
    tutorId: "t1", // Corresponde a t1 en el seed (Max y Luna)
  },
  camila: {
    id: "camila",
    name: "Camila Alarcón",
    role: "tutor",
    roleName: "Tutora Responsable (Cliente)",
    badge: "Tutor / Cliente",
    badgeColor: "bg-blue-600 text-white",
    avatar: "👤",
    email: "camila.alarcon@mail.cl",
    tutorId: "t1",
  },
};

export const USER_PASSWORDS: Record<string, string> = {
  profe: "123456",
  admin: "admin123",
  seba: "admin123",
  vet: "vet123",
  vet_patricia: "vet123",
  vet_carlos: "vet123",
  tutor: "tutor123",
  camila: "tutor123",
};

export type Permission =
  | "create_pet"
  | "delete_pet"
  | "create_vet"
  | "delete_vet"
  | "create_tutor"
  | "delete_tutor"
  | "create_ficha"
  | "create_cita"
  | "process_pago"
  | "access_admin"
  | "view_all_pets"
  | "view_all_fichas"
  | "view_tutores"
  | "view_finances"
  | "view_infrastructure";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  superadmin: [
    "create_pet",
    "delete_pet",
    "create_vet",
    "delete_vet",
    "create_tutor",
    "delete_tutor",
    "create_ficha",
    "create_cita",
    "process_pago",
    "access_admin",
    "view_all_pets",
    "view_all_fichas",
    "view_tutores",
    "view_finances",
    "view_infrastructure",
  ],
  admin: [
    "create_pet",
    "delete_pet",
    "create_vet",
    "delete_vet",
    "create_tutor",
    "delete_tutor",
    "create_ficha",
    "create_cita",
    "process_pago",
    "access_admin",
    "view_all_pets",
    "view_all_fichas",
    "view_tutores",
    "view_finances",
    "view_infrastructure",
  ],
  vet: [
    "create_pet",
    "create_ficha",
    "create_cita",
    "view_all_pets",
    "view_all_fichas",
    "view_tutores",
  ],
  tutor: [
    "create_cita",
    "process_pago",
  ],
  guest: [],
};

interface AuthContextType {
  user: UserProfile | null;
  role: Role;
  isAuthenticated: boolean;
  logoutNotice: boolean;
  login: (profile: UserProfile) => void;
  loginWithCredentials: (username: string, pass: string) => { ok: boolean; error?: string };
  logout: () => void;
  enterAsGuest: () => void;
  can: (perm: Permission) => boolean;
  loginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
  requireAuth: (perm: Permission, onGranted: () => void) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);
const STORAGE_KEY = "petcare_auth_session_v3";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [logoutNotice, setLogoutNotice] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && stored !== "guest") {
        setUser(JSON.parse(stored));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  const login = (profile: UserProfile) => {
    setUser(profile);
    setLogoutNotice(false);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    setLoginModalOpen(false);
    toast.success(`Bienvenido/a, ${profile.name} (${profile.roleName})`);
  };

  const loginWithCredentials = (usernameRaw: string, passRaw: string): { ok: boolean; error?: string } => {
    const u = usernameRaw.trim().toLowerCase();
    const p = passRaw.trim();

    if (!u) return { ok: false, error: "Ingresa tu nombre de usuario" };
    if (!p) return { ok: false, error: "Ingresa tu contraseña" };

    const expectedPass = USER_PASSWORDS[u];
    const profile = PRESET_USERS[u];

    if (profile && expectedPass) {
      if (p !== expectedPass) {
        return { ok: false, error: "Contraseña incorrecta para este usuario" };
      }
      login(profile);
      return { ok: true };
    }

    // Si ingresa con cualquier credencial válida de la clínica o demo
    if (u === "profesor" && (p === "123456" || p === "admin123")) {
      login(PRESET_USERS.profe!);
      return { ok: true };
    }

    return { ok: false, error: "Credenciales no reconocidas en el sistema" };
  };

  const logout = () => {
    setUser(null);
    setLogoutNotice(true);
    localStorage.removeItem(STORAGE_KEY);
    toast.info("Ha cerrado sesión de forma segura.");
  };

  const enterAsGuest = () => {
    const guestProfile: UserProfile = {
      id: "guest",
      name: "Invitado de Demostración",
      role: "guest",
      roleName: "Modo Vista Rápida",
      badge: "Invitado",
      badgeColor: "bg-slate-500 text-white",
      avatar: "👁️",
      email: "invitado@petcare.cl",
    };
    setUser(guestProfile);
    setLogoutNotice(false);
    localStorage.setItem(STORAGE_KEY, "guest");
    toast.info("Ingresando como Invitado (Modo Solo Lectura)");
  };

  const role: Role = user?.role ?? "guest";

  const can = (perm: Permission): boolean => {
    return ROLE_PERMISSIONS[role].includes(perm);
  };

  const requireAuth = (perm: Permission, onGranted: () => void): boolean => {
    if (!user || user.role === "guest") {
      toast.error("Acceso restringido: Debes iniciar sesión para realizar esta operación clínica");
      setLoginModalOpen(true);
      return false;
    }
    if (!can(perm)) {
      toast.error(`Permiso denegado: Tu perfil actual (${user.roleName}) no tiene permisos para esta acción`);
      return false;
    }
    onGranted();
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user && user.role !== "guest",
        logoutNotice,
        login,
        loginWithCredentials,
        logout,
        enterAsGuest,
        can,
        loginModalOpen,
        setLoginModalOpen,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
