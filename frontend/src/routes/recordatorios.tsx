import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MessageCircle, ShieldAlert, ArrowLeft, BellRing } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader, NativeSelect } from "@/components/page";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { recordatoriosPendientes } from "@/lib/clinic";

export const Route = createFileRoute("/recordatorios")({
  head: () => ({
    meta: [
      { title: "Recordatorios · PetCare" },
      { name: "description", content: "Recordatorios automáticos de vacunas y controles periódicos." },
      { property: "og:title", content: "Recordatorios · PetCare" },
      { property: "og:description", content: "Vacunas y controles por vencer." },
    ],
  }),
  component: Recordatorios,
});

function Recordatorios() {
  const s = useStore();
  const auth = useAuth();
  const role = auth.role;

  // RBAC: La vista masiva de recordatorios de toda la clínica es para el equipo veterinario
  if (role === "tutor") {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="mx-auto size-16 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
          <BellRing className="size-8" />
        </div>
        <h2 className="text-2xl font-bold">Recordatorios de Mis Mascotas</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Las notificaciones de vacunas y próximos controles para tus mascotas se envían de forma automática a tu correo y WhatsApp. También puedes revisar la fecha de cada dosis directamente en el perfil de tus mascotas.
        </p>
        <Button asChild className="cursor-pointer">
          <Link to="/mascotas">
            <ArrowLeft className="size-4 mr-2" /> Ir a Mis Mascotas
          </Link>
        </Button>
      </div>
    );
  }

  const [ventana, setVentana] = useState(30);
  const recs = recordatoriosPendientes(s.mascotas, s.fichas, new Date(), ventana);

  return (
    <>
      <PageHeader
        title="Recordatorios"
        subtitle="Generados automáticamente desde vacunas y próximos controles de la clínica"
        action={
          <div className="w-44">
            <NativeSelect value={ventana} onChange={(e) => setVentana(Number(e.target.value))}>
              {[7, 14, 30, 60].map((d) => (
                <option key={d} value={d}>Próximos {d} días</option>
              ))}
            </NativeSelect>
          </div>
        }
      />
      <div className="space-y-3">
        {recs.map((r, i) => {
          const m = s.mascotas.find((x) => x.id === r.mascotaId);
          const t = s.tutores.find((x) => x.id === m?.tutorId);
          const msg = `Hola ${t?.nombre}, te recordamos que ${m?.nombre} tiene ${
            r.tipo === "Vacuna" ? "la vacuna" : "control de"
          } "${r.detalle}" el ${r.fecha}. Agenda en PetCare.`;

          return (
            <Card key={i} className="shadow-card border-0">
              <CardContent className="flex flex-wrap items-center gap-4 p-4">
                <img src={m?.foto} alt={m?.nombre} className="size-14 rounded-2xl object-cover" loading="lazy" />
                <div className="min-w-48 flex-1">
                  <p className="font-semibold">{m?.nombre} · {r.detalle}</p>
                  <p className="text-sm text-muted-foreground">
                    {r.tipo} · {r.fecha} · Tutor: {t?.nombre}
                  </p>
                </div>
                <Badge variant={r.dias < 0 ? "destructive" : r.dias <= 7 ? "default" : "secondary"}>
                  {r.dias < 0 ? `Vencido hace ${-r.dias} d` : r.dias === 0 ? "Hoy" : `En ${r.dias} días`}
                </Badge>
                <Button variant="outline" size="sm" asChild>
                  <a href={`mailto:${t?.email}?subject=${encodeURIComponent("Recordatorio PetCare")}&body=${encodeURIComponent(msg)}`}>
                    <Mail /> Email
                  </a>
                </Button>
                <Button size="sm" asChild>
                  <a target="_blank" rel="noopener noreferrer" href={`https://wa.me/${t?.telefono.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`}>
                    <MessageCircle /> WhatsApp
                  </a>
                </Button>
              </CardContent>
            </Card>
          );
        })}
        {!recs.length && <p className="text-muted-foreground">No hay recordatorios en este periodo.</p>}
      </div>
    </>
  );
}
