import { createFileRoute, Link } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import {
  CalendarDays,
  PawPrint,
  Users,
  BellRing,
  ArrowRight,
  FileHeart,
  CreditCard,
  Syringe,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { clp, recordatoriosPendientes } from "@/lib/clinic";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · PetCare" },
      { name: "description", content: "Resumen diario de citas, pacientes, recordatorios e ingresos de PetCare." },
      { property: "og:title", content: "Dashboard · PetCare" },
      { property: "og:description", content: "Resumen diario de la clínica veterinaria PetCare." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const s = useStore();
  const auth = useAuth();
  const role = auth.role;

  const hoy = new Date().toISOString().slice(0, 10);
  const pet = (id: string) => s.mascotas.find((m) => m.id === id);
  const vet = (id: string) => s.vets.find((v) => v.id === id);

  // ==========================================
  // VISTA ESPECIALIZADA: TUTORA / CLIENTE (RBAC)
  // ==========================================
  if (role === "tutor") {
    // Camila Rojas (t1) o tutor vinculado
    const tutorId = auth.user?.tutorId ?? "t1";
    const misMascotas = s.mascotas.filter((m) => m.tutorId === tutorId);
    const misMascotasIds = misMascotas.map((m) => m.id);
    const misCitas = s.citas.filter((c) => misMascotasIds.includes(c.mascotaId));
    const misFichas = s.fichas.filter((f) => misMascotasIds.includes(f.mascotaId));
    const misRecs = recordatoriosPendientes(misMascotas, misFichas, new Date(), 30);
    const tutorObj = s.tutores.find((t) => t.id === tutorId);

    return (
      <div className="space-y-6">
        <section className="bg-hero rounded-3xl p-8 text-primary-foreground shadow-card">
          <p className="text-sm opacity-80">
            {new Date().toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="mt-1 text-3xl sm:text-4xl font-semibold">
            ¡Hola, {auth.user?.name.split(" ")[0] ?? "Tutora"}!
          </h1>
          <p className="mt-2 max-w-xl opacity-90">
            Bienvenida a tu portal personal PetCare. Aquí puedes gestionar el cuidado, historial de vacunas, recetas médicas y citas de tus mascotas.
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <Button size="sm" variant="secondary" asChild className="cursor-pointer shadow-sm">
              <Link to="/agenda">
                <CalendarDays className="size-4 mr-1.5" /> Agendar Nueva Cita
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild className="bg-white/10 hover:bg-white/20 border-white/20 text-white cursor-pointer">
              <Link to="/fichas">
                <FileHeart className="size-4 mr-1.5" /> Ver Mis Recetas Médicas
              </Link>
            </Button>
          </div>
        </section>

        {/* Mis Mascotas a Cargo */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold tracking-tight">Mis Mascotas Registradas</h2>
            <Link to="/mascotas" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              Ver detalles completos <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {misMascotas.map((m) => (
              <Card key={m.id} className="shadow-card border-0 overflow-hidden">
                <div className="flex items-center gap-4 p-4">
                  <img
                    src={m.foto}
                    alt={m.nombre}
                    className="size-16 rounded-2xl object-cover shadow-sm"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base">{m.nombre}</h3>
                      <Badge variant="secondary" className="text-[10px]">{m.especie}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{m.raza} · {m.peso} kg</p>
                    <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                      <CheckCircle2 className="size-3" /> Ficha biométrica activa
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Resumen de Citas y Vacunas Próximas */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Próximas Citas */}
          <Card className="shadow-card border-0">
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarDays className="size-4 text-primary" /> Mis Citas Médicas
              </CardTitle>
              <Link to="/agenda" className="text-xs text-primary font-semibold">Ir a Agenda</Link>
            </CardHeader>
            <CardContent className="divide-y">
              {misCitas.map((c) => {
                const m = pet(c.mascotaId);
                return (
                  <div key={c.id} className="flex items-center gap-3 py-3">
                    <div className="size-10 rounded-xl bg-primary/10 text-primary font-mono font-bold text-xs flex flex-col items-center justify-center">
                      <span>{c.hora}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{m?.nombre} — {c.motivo}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.fecha} · Profesional: {vet(c.vetId)?.nombre}
                      </p>
                    </div>
                    <Badge variant="outline">{c.estado}</Badge>
                  </div>
                );
              })}
              {!misCitas.length && (
                <p className="py-4 text-xs text-muted-foreground text-center">
                  No tienes citas agendadas por el momento.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recordatorios de Salud para sus mascotas */}
          <Card className="shadow-card border-0">
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Syringe className="size-4 text-emerald-600" /> Próximas Vacunas & Controles
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              {misRecs.map((r, i) => {
                const m = pet(r.mascotaId);
                return (
                  <div key={i} className="flex items-center gap-3 py-3">
                    <img src={m?.foto} alt={m?.nombre} className="size-9 rounded-full object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{m?.nombre} · {r.detalle}</p>
                      <p className="text-xs text-muted-foreground">{r.tipo}: {r.fecha}</p>
                    </div>
                    <Badge variant={r.dias < 0 ? "destructive" : "secondary"}>
                      {r.dias < 0 ? "Vencido" : `${r.dias} días`}
                    </Badge>
                  </div>
                );
              })}
              {!misRecs.length && (
                <p className="py-4 text-xs text-muted-foreground text-center">
                  Tus mascotas están al día con sus vacunas y controles.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ==========================================
  // VISTA PARA VETERINARIOS Y ADMINISTRADORES
  // ==========================================
  const citasHoy = s.citas
    .filter((c) => c.fecha === hoy && c.estado !== "Cancelada")
    .sort((a, b) => a.hora.localeCompare(b.hora));
  const recs = recordatoriosPendientes(s.mascotas, s.fichas, new Date(), 14);
  const ingresos = s.pagos.filter((p) => p.estado === "Aprobado").reduce((a, p) => a + p.monto, 0);

  const semana = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 3 + i);
    const iso = d.toISOString().slice(0, 10);
    return {
      dia: d.toLocaleDateString("es-CL", { weekday: "short" }),
      citas: s.citas.filter((c) => c.fecha === iso && c.estado !== "Cancelada").length,
    };
  });

  const isVet = role === "vet";
  const kpis = [
    { label: "Citas hoy", value: citasHoy.length, icon: CalendarDays },
    { label: "Pacientes", value: s.mascotas.length, icon: PawPrint },
    { label: "Tutores", value: s.tutores.length, icon: Users },
    { label: "Recordatorios (14 días)", value: recs.length, icon: BellRing },
  ];

  return (
    <div className="space-y-6">
      <section className="bg-hero rounded-3xl p-8 text-primary-foreground shadow-card">
        <p className="text-sm opacity-80">
          {new Date().toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 className="mt-1 text-3xl sm:text-4xl font-semibold">
          {isVet ? `Buen día, Dra./Dr. ${auth.user?.name.split(" ")[1] ?? ""}` : "Buen día, equipo PetCare"}
        </h1>
        <p className="mt-2 max-w-xl opacity-90">
          Tienes {citasHoy.length} citas médicas hoy y {recs.filter((r) => r.dias < 0).length} controles vencidos.
          {!isVet && ` Ingresos aprobados: ${clp(ingresos)}.`}
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="shadow-card border-0">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="grid size-12 place-items-center rounded-2xl bg-secondary text-primary">
                <k.icon />
              </div>
              <div>
                <p className="text-3xl font-bold">{k.value}</p>
                <p className="text-sm text-muted-foreground">{k.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="shadow-card border-0 xl:col-span-2">
          <CardHeader>
            <CardTitle>Citas de la semana</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={semana}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="dia" stroke="var(--muted-foreground)" />
                <YAxis allowDecimals={false} stroke="var(--muted-foreground)" />
                <Tooltip />
                <Bar dataKey="citas" fill="var(--primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recordatorios</CardTitle>
            <Link to="/recordatorios" className="text-sm text-primary">Ver todos</Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recs.slice(0, 5).map((r, i) => {
              const m = pet(r.mascotaId);
              return (
                <div key={i} className="flex items-center gap-3">
                  <img src={m?.foto} alt={m?.nombre} className="size-10 rounded-full object-cover" loading="lazy" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{m?.nombre} · {r.detalle}</p>
                    <p className="text-xs text-muted-foreground">{r.fecha}</p>
                  </div>
                  <Badge variant={r.dias < 0 ? "destructive" : "secondary"}>
                    {r.dias < 0 ? "Vencido" : `${r.dias} d`}
                  </Badge>
                </div>
              );
            })}
            {!recs.length && <p className="text-sm text-muted-foreground">Sin pendientes.</p>}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card border-0">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Agenda de hoy</CardTitle>
          <Link to="/agenda" className="flex items-center gap-1 text-sm text-primary">
            Abrir agenda <ArrowRight className="size-4" />
          </Link>
        </CardHeader>
        <CardContent className="divide-y">
          {citasHoy.map((c) => {
            const m = pet(c.mascotaId);
            return (
              <div key={c.id} className="flex items-center gap-4 py-3">
                <span className="w-14 font-mono text-sm font-semibold text-primary">{c.hora}</span>
                <img src={m?.foto} alt={m?.nombre} className="size-10 rounded-full object-cover" loading="lazy" />
                <div className="flex-1">
                  <p className="font-medium">{m?.nombre} — {c.motivo}</p>
                  <p className="text-sm text-muted-foreground">{vet(c.vetId)?.nombre}</p>
                </div>
                <Badge variant="outline">{c.estado}</Badge>
              </div>
            );
          })}
          {!citasHoy.length && <p className="py-4 text-sm text-muted-foreground">No hay citas hoy.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
