const PUNTOS = [
  {
    titulo: "¿Qué es Jumping Fitness?",
    texto:
      "Una clase grupal de cardio de alta energía arriba de un trampolín individual con manija. Bajo impacto para las rodillas, alto gasto calórico.",
  },
  {
    titulo: "¿Quién da las clases?",
    texto:
      "Yani, profesora certificada en Jumping Fitness, con clases pensadas para todos los niveles: desde quien nunca saltó hasta quien ya entrena hace años.",
  },
  {
    titulo: "¿Necesito experiencia previa?",
    texto:
      "No. Las clases se adaptan al ritmo de cada alumna. El trampolín amortigua el impacto, así que es apto para la mayoría de las personas.",
  },
];

export default function QueEsJumping() {
  return (
    <section id="clases" className="seccion-pantalla px-4">
      <h2 className="font-titulo text-2xl uppercase text-marca-negro">Sobre las clases</h2>
      <div className="mt-5 flex flex-col gap-5">
        {PUNTOS.map((punto) => (
          <div key={punto.titulo} className="rounded-2xl bg-marca-rosa/10 p-4">
            <h3 className="text-base font-semibold text-marca-negro">{punto.titulo}</h3>
            <p className="mt-1 text-sm leading-6 text-zinc-600">{punto.texto}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
