import React, { useState } from "react";
import { PawPrint, User, Lock, KeyRound, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function LoginScreen() {
  const auth = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = auth.loginWithCredentials(username, password);
    if (!result.ok) {
      setError(result.error ?? "Usuario o contraseña inválidos");
    }
  };

  const fillAndLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
    auth.loginWithCredentials(u, p);
  };

  return (
    <div className="min-h-screen w-full bg-[#0a1219] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0d2a2f] via-[#09151d] to-[#050b10] flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] rounded-3xl bg-white p-7 sm:p-8 shadow-2xl text-slate-800 border border-slate-100">
        {/* Logo Paw Badge */}
        <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
          <PawPrint className="size-8" />
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-center font-display text-2xl font-bold tracking-tight text-slate-900">
          PetCare Clinic
        </h1>
        <p className="text-center text-xs text-slate-500 mt-1 mb-4">
          Sistema de Gestión de Citas & Fichas Médicas
        </p>

        {/* Mensaje de Logout Seguro */}
        {auth.logoutNotice && (
          <div className="mb-4 rounded-xl bg-sky-50 border border-sky-200/80 p-2.5 text-center text-xs font-medium text-sky-800 flex items-center justify-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="size-4 text-sky-600 shrink-0" />
            <span>Ha cerrado sesión de forma segura.</span>
          </div>
        )}

        {/* Mensaje de Error si las credenciales fallan */}
        {error && (
          <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-center text-xs font-medium text-rose-700 flex items-center justify-center gap-1.5 animate-in fade-in">
            <AlertCircle className="size-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nombre de Usuario
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin o profe"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-700/20 transition cursor-pointer mt-2"
          >
            Iniciar Sesión en PetCare
          </button>
        </form>

        {/* Tarjeta de Credenciales de Evaluación Docente */}
        <div className="mt-4 rounded-2xl border border-slate-200/80 bg-slate-50/90 p-3 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700 mb-2">
            <KeyRound className="size-3.5 text-emerald-600" />
            <span>Credenciales de Evaluación Docente:</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => fillAndLogin("admin", "admin123")}
              className="text-left p-1.5 rounded-lg border border-slate-200/60 bg-white hover:border-emerald-500 hover:bg-emerald-50/50 transition cursor-pointer"
            >
              <div className="text-slate-500 text-[10px]">Superuser:</div>
              <strong className="font-semibold text-slate-800 block text-xs">admin</strong>
              <div className="text-[10px] text-slate-500">Clave: admin123</div>
            </button>

            <button
              type="button"
              onClick={() => fillAndLogin("profe", "123456")}
              className="text-left p-1.5 rounded-lg border border-slate-200/60 bg-white hover:border-emerald-500 hover:bg-emerald-50/50 transition cursor-pointer"
            >
              <div className="text-slate-500 text-[10px]">Profesor:</div>
              <strong className="font-semibold text-slate-800 block text-xs">profe</strong>
              <div className="text-[10px] text-slate-500">Clave: 123456</div>
            </button>

            <button
              type="button"
              onClick={() => fillAndLogin("vet", "vet123")}
              className="text-left p-1.5 rounded-lg border border-slate-200/60 bg-white hover:border-emerald-500 hover:bg-emerald-50/50 transition cursor-pointer"
            >
              <div className="text-slate-500 text-[10px]">Veterinario:</div>
              <strong className="font-semibold text-slate-800 block text-xs">vet</strong>
              <div className="text-[10px] text-slate-500">Clave: vet123</div>
            </button>

            <button
              type="button"
              onClick={() => fillAndLogin("tutor", "tutor123")}
              className="text-left p-1.5 rounded-lg border border-slate-200/60 bg-white hover:border-emerald-500 hover:bg-emerald-50/50 transition cursor-pointer"
            >
              <div className="text-slate-500 text-[10px]">Tutora Cliente:</div>
              <strong className="font-semibold text-slate-800 block text-xs">tutor</strong>
              <div className="text-[10px] text-slate-500">Clave: tutor123</div>
            </button>
          </div>
        </div>

        {/* Ingreso como Invitado */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={auth.enterAsGuest}
            className="text-xs text-slate-500 hover:text-emerald-700 hover:underline transition cursor-pointer inline-flex items-center gap-1"
          >
            ← Ingresar como Invitado al Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
