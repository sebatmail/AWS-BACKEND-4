import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Pill, FlaskConical, Stethoscope, Printer, FileHeart, CalendarCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader, Field, NativeSelect } from "@/components/page";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { uid } from "@/lib/clinic";

export const Route = createFileRoute("/fichas")({
  head: () => ({
    meta: [
      { title: "Fichas médicas · PetCare" },
      { name: "description", content: "Historial clínico: diagnósticos, tratamientos, recetas y exámenes." },
      { property: "og:title", content: "Fichas médicas · PetCare" },
      { property: "og:description", content: "Historial clínico digital." },
    ],
  }),
  component: Fichas,
});

const schema = z.object({
  mascotaId: z.string().min(1, "Selecciona paciente"),
  vetId: z.string().min(1),
  diagnostico: z.string().trim().min(3, "Diagnóstico requerido").max(300),
  tratamiento: z.string().trim().min(3, "Tratamiento requerido").max(500),
  receta: z.string().trim().max(500),
  examenes: z.string().trim().max(300),
  proximoControl: z.string().optional(),
});

function Fichas() {
  const s = useStore();
  const auth = useAuth();
  const role = auth.role;
  const isTutor = role === "tutor";
  const tutorId = auth.user?.tutorId ?? "t1";

  // Mascotas permitidas para este perfil
  const mascotasPermitidas = isTutor
    ? s.mascotas.filter((m) => m.tutorId === tutorId)
    : s.mascotas;

  const [sel, setSel] = useState(mascotasPermitidas[0]?.id ?? "");
  const [open, setOpen] = useState(false);

  const vacio = {
    mascotaId: sel || (mascotasPermitidas[0]?.id ?? ""),
    vetId: s.vets[0]?.id ?? "",
    diagnostico: "",
    tratamiento: "",
    receta: "",
    examenes: "",
    proximoControl: "",
  };

  const [f, setF] = useState(vacio);
  const m = s.mascotas.find((x) => x.id === sel);
  const historial = s.fichas.filter((x) => x.mascotaId === sel).sort((a, b) => b.fecha.localeCompare(a.fecha));

  const save = () => {
    const r = schema.safeParse(f);
    if (!r.success) {
      toast.error(r.error.issues[0]?.message ?? "Datos inválidos");
      return;
    }
    s.set("fichas", [
      ...s.fichas,
      {
        id: uid(),
        fecha: new Date().toISOString().slice(0, 10),
        ...r.data,
        proximoControl: r.data.proximoControl || undefined,
      },
    ]);
    setOpen(false);
    setSel(r.data.mascotaId);
    toast.success("Atención médica registrada en la ficha");
  };

  return (
    <>
      <PageHeader
        title={isTutor ? "Fichas & Recetas de Mis Mascotas" : "Fichas médicas"}
        subtitle={
          isTutor
            ? "Historial clínico, diagnósticos y recetas veterinarias emitidas para tus mascotas"
            : "Historial clínico digital completo por paciente con diagnósticos y recetas"
        }
        action={
          !isTutor ? (
            <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setF({ ...vacio, mascotaId: sel }); }}>
              <Button onClick={() => auth.requireAuth("create_ficha", () => setOpen(true))}>
                <Plus /> Nueva atención
              </Button>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Registrar atención médica</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Paciente">
                      <NativeSelect value={f.mascotaId} onChange={(e) => setF({ ...f, mascotaId: e.target.value })}>
                        {mascotasPermitidas.map((x) => (
                          <option key={x.id} value={x.id}>{x.nombre}</option>
                        ))}
                      </NativeSelect>
                    </Field>
                    <Field label="Profesional Tratante">
                      <NativeSelect value={f.vetId} onChange={(e) => setF({ ...f, vetId: e.target.value })}>
                        {s.vets.map((v) => (
                          <option key={v.id} value={v.id}>{v.nombre}</option>
                        ))}
                      </NativeSelect>
                    </Field>
                  </div>
                  <Field label="Diagnóstico">
                    <Input value={f.diagnostico} onChange={(e) => setF({ ...f, diagnostico: e.target.value })} placeholder="Ej: Otitis externa leve" />
                  </Field>
                  <Field label="Tratamiento">
                    <Textarea value={f.tratamiento} onChange={(e) => setF({ ...f, tratamiento: e.target.value })} placeholder="Limpieza auricular y reposo..." />
                  </Field>
                  <Field label="Receta médica">
                    <Textarea value={f.receta} onChange={(e) => setF({ ...f, receta: e.target.value })} placeholder="Gotas Otomax cada 12 horas por 7 días" />
                  </Field>
                  <Field label="Exámenes Solicitados">
                    <Input value={f.examenes} onChange={(e) => setF({ ...f, examenes: e.target.value })} placeholder="Citología ótica" />
                  </Field>
                  <Field label="Próximo control">
                    <Input type="date" value={f.proximoControl} onChange={(e) => setF({ ...f, proximoControl: e.target.value })} />
                  </Field>
                  <Button onClick={save}>Guardar en Ficha Clínica</Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : null
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Selector de Pacientes */}
        <Card className="shadow-card border-0 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">
              {isTutor ? "Seleccionar Mi Mascota" : "Seleccionar Paciente"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {mascotasPermitidas.map((p) => {
              const active = p.id === sel;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSel(p.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition cursor-pointer ${
                    active ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted"
                  }`}
                >
                  <img src={p.foto} alt={p.nombre} className="size-11 rounded-xl object-cover" />
                  <div className="flex-1">
                    <p className="font-semibold">{p.nombre}</p>
                    <p className={`text-xs ${active ? "opacity-90" : "text-muted-foreground"}`}>
                      {p.especie} · {p.raza}
                    </p>
                  </div>
                </button>
              );
            })}
            {!mascotasPermitidas.length && (
              <p className="text-xs text-muted-foreground text-center py-4">No hay mascotas disponibles.</p>
            )}
          </CardContent>
        </Card>

        {/* Historial Clínico & Recetas */}
        <div className="space-y-4 lg:col-span-2">
          {m && (
            <Card className="shadow-card border-0 bg-primary/5">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <img src={m.foto} alt={m.nombre} className="size-12 rounded-xl object-cover" />
                  <div>
                    <h3 className="font-bold text-lg">{m.nombre}</h3>
                    <p className="text-xs text-muted-foreground">
                      {m.especie} · {m.raza} · Peso: {m.peso} kg
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5 text-xs">
                  <Printer className="size-3.5" /> Imprimir Ficha
                </Button>
              </CardContent>
            </Card>
          )}

          {historial.map((h) => {
            const medico = s.vets.find((v) => v.id === h.vetId);
            return (
              <Card key={h.id} className="shadow-card border-0">
                <CardHeader className="flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileHeart className="size-4 text-primary" />
                    Atención Médica · {h.fecha}
                  </CardTitle>
                  <span className="text-xs text-muted-foreground">
                    Atendido por: <strong>{medico?.nombre ?? "Veterinario"}</strong>
                  </span>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">Diagnóstico:</p>
                    <p className="font-medium text-sm text-foreground">{h.diagnostico}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">Tratamiento Indicado:</p>
                    <p className="text-sm text-foreground">{h.tratamiento}</p>
                  </div>
                  {h.receta && (
                    <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3">
                      <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                        <Pill className="size-3.5" /> Receta Médica & Dosis:
                      </p>
                      <p className="text-xs font-mono text-emerald-950 dark:text-emerald-200 mt-1">
                        {h.receta}
                      </p>
                    </div>
                  )}
                  {h.examenes && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                        <FlaskConical className="size-3 text-primary" /> Exámenes:
                      </p>
                      <p className="text-xs text-muted-foreground">{h.examenes}</p>
                    </div>
                  )}
                  {h.proximoControl && (
                    <div className="flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-300 pt-1 border-t">
                      <CalendarCheck className="size-3.5" /> Próximo control programado: {h.proximoControl}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {!historial.length && (
            <Card className="shadow-card border-0">
              <CardContent className="py-12 text-center text-muted-foreground">
                No hay atenciones médicas registradas para {m?.nombre ?? "este paciente"}.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
