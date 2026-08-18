"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { crearClienteSupabase } from "@/lib/supabase/client";
import { NOMBRE_MARCA } from "@/lib/contacto";

export default function LoginAdmin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function manejarEnvio(evento: FormEvent) {
    evento.preventDefault();
    setCargando(true);
    setError(null);

    const supabase = crearClienteSupabase();
    const { error: errorLogin } = await supabase.auth.signInWithPassword({
      email,
      password: contrasena,
    });

    setCargando(false);

    if (errorLogin) {
      setError("Email o contraseña incorrectos.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-full flex-col justify-center px-4 py-10">
      <h1 className="font-titulo text-2xl uppercase text-marca-negro">Panel de {NOMBRE_MARCA}</h1>
      <p className="mt-1 text-sm text-zinc-500">Ingresá con tu cuenta para administrar el sitio.</p>

      <form onSubmit={manejarEnvio} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-zinc-700">Email</span>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
            className="h-12 rounded-xl border border-zinc-300 px-3 text-base"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-zinc-700">Contraseña</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={contrasena}
            onChange={(evento) => setContrasena(evento.target.value)}
            className="h-12 rounded-xl border border-zinc-300 px-3 text-base"
          />
        </label>

        {error && <p className="text-sm text-marca-rojo">{error}</p>}

        <button
          type="submit"
          disabled={cargando}
          className="mt-2 flex h-12 w-full items-center justify-center rounded-full bg-marca-rosa px-5 text-base font-semibold text-marca-negro disabled:opacity-60 active:bg-marca-rosa/80"
        >
          {cargando ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
    </main>
  );
}
