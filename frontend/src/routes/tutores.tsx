import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Mail, Phone, MapPin, Trash2, Upload, Sparkles, X, User, ShieldAlert, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader, Field } from "@/components/page";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { uid, validarRut } from "@/lib/clinic";

export const Route = createFileRoute("/tutores")({
  head: () => ({
    meta: [
      { title: "Tutores · PetCare" },
      { name: "description", content: "Registro y perfiles de tutores de mascotas." },
      { property: "og:title", content: "Tutores · PetCare" },
      { property: "og:description", content: "Registro y perfiles de tutores." },
    ],
  }),
  component: Tutores,
});

const schema = z.object({
  nombre: z.string().trim().min(3, "Nombre muy corto").max(80),
  rut: z.string().trim().refine(validarRut, "RUT inválido"),
  email: z.string().trim().email("Email inválido").max(120),
  telefono: z.string().trim().regex(/^\+?[\d\s]{8,15}$/, "Teléfono inválido"),
  direccion: z.string().trim().min(5, "Dirección requerida").max(150),
});

const PRESET_TUTOR_AVATARS = [
  { label: "👩‍💼 Camila", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80" },
  { label: "👨‍💻 Diego", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80" },
  { label: "👩‍⚕️ Dra. Soto", url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80" },
  { label: "👨‍🏫 Prof. Marcelo", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80" },
  { label: "🧑‍🎓 Sebastián", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80" },
];

function Tutores() {
  const s = useStore();
  const auth = useAuth();
  const role = auth.role;

  // RBAC: Si es tutora o invitado no autorizado, bloquea acceso directo por URL
  if (role === "tutor") {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="mx-auto size-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
          <ShieldAlert className="size-8" />
        </div>
        <h2 className="text-2xl font-bold">Módulo Restringido</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          El directorio de tutores contiene información de contacto protegida por la <strong>Ley N° 19.628 de Protección de la Vida Privada</strong>. Este módulo es exclusivo para la administración y equipo veterinario de PetCare.
        </p>
        <Button asChild className="cursor-pointer">
          <Link to="/mascotas">
            <ArrowLeft className="size-4 mr-2" /> Volver a Mis Mascotas
          </Link>
        </Button>
      </div>
    );
  }

  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [f, setF] = useState({ nombre: "", rut: "", email: "", telefono: "", direccion: "", foto: "" });

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecciona un archivo de imagen válido");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen debe pesar menos de 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setF((prev) => ({ ...prev, foto: reader.result as string }));
        toast.success("Foto de avatar cargada");
      }
    };
    reader.readAsDataURL(file);
  };

  const save = () => {
    const r = schema.safeParse(f);
    if (!r.success) {
      toast.error(r.error.issues[0]?.message ?? "Datos inválidos");
      return;
    }
    const fotoFinal = f.foto.trim() || undefined;
    s.set("tutores", [...s.tutores, { id: uid(), ...r.data, foto: fotoFinal }]);
    setOpen(false);
    setF({ nombre: "", rut: "", email: "", telefono: "", direccion: "", foto: "" });
    toast.success(`Tutor "${r.data.nombre}" registrado exitosamente`);
  };

  const filtered = s.tutores.filter(
    (t) =>
      t.nombre.toLowerCase().includes(q.toLowerCase()) ||
      t.rut.toLowerCase().includes(q.toLowerCase()) ||
      t.email.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <>
      <PageHeader
        title="Tutores"
        subtitle="Registro y perfiles de clientes tutores de pacientes"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <Button onClick={() => auth.requireAuth("create_tutor", () => setOpen(true))}>
              <Plus /> Nuevo tutor
            </Button>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar nuevo tutor</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 pt-2">
                <Field label="Nombre Completo">
                  <Input value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} placeholder="Ej: Camila Rojas" />
                </Field>
                <Field label="RUT (con guión)">
                  <Input value={f.rut} onChange={(e) => setF({ ...f, rut: e.target.value })} placeholder="12.345.678-9" />
                </Field>
                <Field label="Correo Electrónico">
                  <Input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="nombre@mail.cl" />
                </Field>
                <Field label="Teléfono / WhatsApp">
                  <Input value={f.telefono} onChange={(e) => setF({ ...f, telefono: e.target.value })} placeholder="+56 9 1234 5678" />
                </Field>
                <Field label="Dirección Particular">
                  <Input value={f.direccion} onChange={(e) => setF({ ...f, direccion: e.target.value })} placeholder="Av. Providencia 1234, Santiago" />
                </Field>

                {/* Avatar / Foto del tutor */}
                <div className="rounded-xl border bg-muted/30 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold flex items-center gap-1.5">
                      <User className="size-3.5 text-primary" /> Avatar del Tutor
                    </label>
                    {f.foto && (
                      <button
                        type="button"
                        onClick={() => setF({ ...f, foto: "" })}
                        className="text-[11px] text-destructive hover:underline flex items-center gap-0.5"
                      >
                        <X className="size-3" /> Quitar avatar
                      </button>
                    )}
                  </div>

                  {f.foto ? (
                    <div className="relative mx-auto size-20 overflow-hidden rounded-full border-2 border-primary shadow-sm">
                      <img src={f.foto} alt="Avatar previo" className="size-full object-cover" />
                    </div>
                  ) : null}

                  <div className="flex gap-2">
                    <label className="cursor-pointer flex-1">
                      <Button variant="outline" size="sm" type="button" className="w-full text-xs pointer-events-none" asChild>
                        <span><Upload className="size-3.5 mr-1" /> Subir foto</span>
                      </Button>
                      <input type="file" accept="image/*" onChange={handleImageFile} className="sr-only" />
                    </label>
                    <Input
                      placeholder="O pega URL de foto..."
                      value={f.foto?.startsWith("data:") ? "" : f.foto}
                      onChange={(e) => setF({ ...f, foto: e.target.value })}
                      className="flex-[2] text-xs h-8"
                    />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                      <Sparkles className="size-2.5 text-amber-500" /> Presets recomendados:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {PRESET_TUTOR_AVATARS.map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => setF({ ...f, foto: p.url })}
                          className="rounded-md border bg-background px-2 py-0.5 text-[11px] hover:bg-primary/10 transition"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <Button onClick={save} className="w-full mt-2">Guardar Tutor</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-4 max-w-sm">
        <Input placeholder="Buscar por nombre, RUT o email…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((t) => {
          const mCount = s.mascotas.filter((m) => m.tutorId === t.id).length;
          return (
            <Card key={t.id} className="shadow-card border-0">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center gap-3">
                  {t.foto ? (
                    <img src={t.foto} alt={t.nombre} className="size-14 rounded-full object-cover shadow-sm" />
                  ) : (
                    <div className="grid size-14 place-items-center rounded-full bg-secondary font-display text-xl text-primary font-bold">
                      {t.nombre[0]}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-base leading-tight">{t.nombre}</h3>
                    <p className="text-xs text-muted-foreground font-mono">{t.rut}</p>
                    <p className="text-xs text-primary font-medium mt-0.5">{mCount} mascota(s) registrada(s)</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    title="Eliminar tutor"
                    onClick={() => {
                      auth.requireAuth("delete_tutor", () => {
                        if (mCount > 0) {
                          toast.error(`No se puede eliminar: tiene ${mCount} mascota(s) asociada(s)`);
                          return;
                        }
                        s.set("tutores", s.tutores.filter((x) => x.id !== t.id));
                        toast.success(`Tutor "${t.nombre}" eliminado`);
                      });
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground pt-1 border-t">
                  <p className="flex items-center gap-2"><Mail className="size-3.5 text-primary" />{t.email}</p>
                  <p className="flex items-center gap-2"><Phone className="size-3.5 text-primary" />{t.telefono}</p>
                  <p className="flex items-center gap-2"><MapPin className="size-3.5 text-primary" />{t.direccion}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
