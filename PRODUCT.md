# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Mujeres de Morón Sur y alrededores interesadas en Jumping Fitness. Entran
desde el celular, casi siempre derivadas de una historia o un posteo de Yani.

**Son dos audiencias y el sitio sirve a las dos, en secciones distintas:**

- **La alumna nueva** todavía no conoce a Yani. Necesita entender qué es el
  jumping, si le sirve, si va a poder. Se convence con las secciones
  explicativas, el conjunto y los eventos.
- **La alumna actual** ya sabe todo eso. Entra con una sola pregunta —
  "¿cuándo hay clase?" — y quiere resolverla en segundos. Vive en el
  calendario.

Ninguna de las dos es "la principal". El diseño no las mezcla en una misma
sección esperando servir a las dos a la vez: cada sección sabe a cuál le
habla. La visita siempre termina en WhatsApp.

## Product Purpose

Es una **web de promoción**. Su centro es un calendario que muestra las
clases de Yani, y además publica eventos y masterclasses.

Éxito = la visitante ve la agenda del mes y escribe por WhatsApp.

No es un sistema de reservas. Hoy la web no confirma ni retiene un lugar:
muestra y deriva.

## Positioning

Una sola profesora, con nombre y cara, dando clases en una zona concreta
donde el jumping se consigue casi siempre dentro de un gimnasio grande y
anónimo. El vínculo es directo con Yani, no con una marca ni una cadena.

El cupo reducido no es una limitación operativa que haya que disimular: es
parte de la propuesta. El número exacto varía, la escala chica no.

Sobre la agenda de eventos: **la clase semanal es exclusivamente de Yani.**
Lo de colegas aparece únicamente cuando hay un evento grande o una
masterclass donde participan varias profesoras. La web no es un directorio
de jumping de la zona ni una agenda abierta a terceros.

## Operating Context

- Las clases son en Morón Sur, zona Texalar. **La dirección exacta de la
  clase semanal no se publica**: se comparte por WhatsApp recién al confirmar.
- **El cupo por clase es variable.** Hoy son 13 alumnas, pero la escuela está
  en expansión y el número puede cambiar mes a mes. 13 es el valor actual, no
  una constante de la marca: nada en el diseño ni en los datos puede tratarlo
  como fijo.
- La agenda la lleva Yani a mano. La coordinación real ocurre por WhatsApp,
  con mensajes precargados desde cada punto del sitio.
- Yani es profesora certificada en Jumping Fitness.
- **Los contenidos los carga el equipo, no Yani.** Ella pasa un flyer o un
  video y el equipo lo sube. Yani no toca el sitio.
- Existe un conjunto oficial de la marca en dos versiones —manga corta y
  musculosa— que se vende a las alumnas. Talle y precio se consultan por
  WhatsApp. Es personalizable con el nombre de la alumna en el pecho.

## Capabilities and Constraints

**Hoy funciona:**

- Calendario mensual navegable con días de clase resaltados y horarios por día.
- Derivación a WhatsApp con mensaje precargado por contexto (consulta general,
  reserva de un horario puntual, consulta por el conjunto).
- Barra fija inferior con la acción principal siempre al alcance del pulgar.
- Mapa embebido de la zona (no de la dirección).

**Por construir — confirmado:**

- **Eventos y masterclasses.** Se listan en **vista comprimida** y se abren a
  un detalle. Campos: flyer (imagen o video), fecha, horario, observación,
  dirección, mapa embebido con el pin, y valor de la entrada.

  **Todos los campos salvo el flyer y la fecha son opcionales.** No es un caso
  borde: de los dos flyers reales que existen, ninguno publica precio, uno no
  tiene horario y otro sólo nombra la ciudad. El detalle se compone con lo que
  haya; ningún campo puede tener lugar reservado ni placeholder.

- **Cómo llegar.** Bloque de opciones de traslado que varía por evento según la
  zona: transporte público, micros contratados, punto de encuentro. Cantidad y
  tipo de opciones no son fijos.

- **Cinta de sponsors en el evento.** Los logos de los sponsors pasan en una
  cinta continua dentro de la vista del evento. Debe respetar
  `prefers-reduced-motion` y quedar legible detenida.

- **Sección de sponsors.** Cada sponsor lleva logo, una reseña y sus redes o
  web. **Todavía no hay ningún sponsor cargado**: la sección tiene que
  funcionar vacía, con uno, y con varios. Requisito explícito del cliente: que
  sea fácil de modificar, o sea datos en un archivo plano, sin tocar
  componentes para agregar o sacar un sponsor.
- **Días de clase y horarios cargables**, reemplazando los datos generados de
  hoy, con posibilidad de edición.

**Por qué el evento cuenta todo y la clase no.** No es una inconsistencia a
resolver: son dos naturalezas distintas.

- **El evento y la masterclass ya están asignados.** Fecha, lugar y precio
  están cerrados de antemano. No hay nada que coordinar, así que el evento se
  cuenta entero: flyer, dirección, mapa con pin y valor de entrada. Se lee y
  se resuelve solo.
- **La clase se gestiona por WhatsApp.** El calendario muestra el día y el
  horario; todo lo demás —dirección, cupo, precio— se acuerda en la
  conversación. El botón es el mecanismo, no un plan B.

En el diseño esto significa que un evento es una **ficha que se explica sola**
y una clase es un **disparador hacia WhatsApp**. Comparten calendario, pero no
son la misma pieza y no deberían verse igual.

**Constraints técnicos:**

- Next.js 16 (App Router) + React 19 + Tailwind 4 + TypeScript. Sin backend.
- Mobile-first. El sitio está construido para el teléfono.
- `src/lib/contacto.ts` es la única fuente de verdad del número y la marca.
- **Carga de datos: archivo ahora, panel después.** Clases y eventos se editan
  en un archivo de datos del proyecto y se republica. No hay panel de
  administración en esta etapa, pero **la forma de los datos se diseña para
  soportarlo sin rehacer los componentes visuales** — igual que ya anticipa el
  comentario sobre Firebase en `src/lib/horarios.ts`. Los tipos `Horario` y
  `DiaConHorarios` son parte de ese contrato. El cupo total tiene que viajar
  **por clase**, no como constante global: hoy `CUPO_TOTAL_POR_CLASE = 13` en
  `src/lib/horarios.ts` es una constante de módulo, y eso ya no representa la
  realidad.

**Decisiones abiertas — no inventar:**

- **Los horarios publicados son datos de muestra**, no la agenda real de Yani
  (L/X/V 09:00, 18:00, 19:30 · M/J 08:30, 19:00). Los cupos disponibles también
  son generados por una fórmula. Mientras siga así, el sitio debe declararlo.
- **Firebase:** hay intención de tener reserva real con cupo en vivo, pero sin
  fecha. La fase 1 vive con WhatsApp y el diseño de hoy no se condiciona a eso.
- **Precio** de la clase y del conjunto: no publicable por ahora.
- **Presencia en redes:** el único destino confirmado es WhatsApp. No hay
  usuario de Instagram, TikTok ni Facebook registrado en el proyecto.
- **Sponsors:** hay doce identificados (lista abajo, en Evidence), pero **sin
  reseña ni links todavía** — el cliente los va completando. La sección tiene
  que funcionar vacía, parcial y completa.

## Brand Commitments

- Nombre: **Jumping con Yani**. WhatsApp: +54 9 11 3254-8231.
- Logo en `public/logo.png`: silueta femenina en pleno salto sobre un
  trampolín, "JUMPING" en blanco con contorno, "con" manuscrito, "YANI" en
  rosa tipo graffiti, más una estrella.
- Paleta del Manual de Marca: rosa `#f6aee3`, rojo `#c41f2c`, negro `#121014`.
- Tipografías: Anton (títulos), Poppins (cuerpo), Caveat (solo acentos cortos
  tipo firma, nunca párrafos).
- Patrón de rayas diagonales a 135° blanco/negro/rojo (Manual de Marca,
  sección 03). Se usa como acento fino, nunca como fondo detrás de texto.
- Voz: español rioplatense con voseo ("Saltá", "Reservá", "Sumate"). La
  audiencia se trata en femenino ("alumnas").
- **Referencia visual aportada por el cliente: "estilo iOS 26".** Aplica al
  calendario y a la vista comprimida de eventos. El cliente la precisó en dos
  mecanismos concretos:
  1. **Visualización dinámica con gesto de zoom.** El calendario se adapta con
     fluidez entre vistas compacta, apilada, de detalle y lista. El gesto de
     pellizco divide la pantalla por semanas o expande las franjas horarias.
  2. **Cristal refractario.** Los bloques del calendario adoptan una textura de
     vidrio líquido que refracta, dobla y transparenta los colores de lo que
     tienen detrás.

  **Consecuencia de diseño:** el vidrio exige un fondo con color que refractar.
  Sobre blanco no refracta nada y queda como decoración. Con la estructura
  elegida ese fondo es el flyer: el calendario flota sobre el flyer del próximo
  evento y le dobla los colores.

- **Botones a Instagram, TikTok y Facebook.** Requeridos por el cliente aunque
  los perfiles todavía no existan. WhatsApp sigue siendo el destino de
  conversión; las redes son presencia de marca, no reemplazan la acción.
  **Decisión del cliente: se muestran visibles y desactivados** hasta que
  existan los perfiles. Se le advirtió que un control que no responde suele
  leerse como sitio roto, y sostuvo la decisión. Por eso el estado desactivado
  tiene que *comunicar* ("pronto"), no simplemente no hacer nada, y cada botón
  se activa solo en cuanto su URL entre en `src/lib/contacto.ts`.

**Nota de hecho, no de opinión:** el Manual de Marca es un documento externo
que no está en el repositorio. Y el conjunto físico es rojo/blanco/negro con
un logo de corazón-huella dactilar, mientras que la web se apoya en el rosa.
Son dos expresiones distintas de la misma marca; nadie confirmó cuál manda.

## Evidence on Hand

**Disponible:**

- `../../salto yanijump.mp4` — video de Yani saltando (2,8 MB). **No se usa en
  ninguna parte del sitio.** Es hoy el único material audiovisual real.
- `public/logo.png` — logo oficial, en uso.
- `public/tienda/conjunto-manga-corta.jpeg` y `conjunto-musculosa.jpeg` — las
  dos versiones del conjunto, en uso. Derivan de los renders de
  `../../Conjuntos/` (768×1366, fondo claro), que quedan como originales sin
  tocar.
- **Al nombre del pecho se le borró el estampado** (`ELI` y `XOA`) por relleno
  por difusión, no por parche: se reconstruyó sólo el trazo de las letras
  siguiendo el sombreado de la prenda, y el logo del corazón quedó intacto.

**Advertencia que sigue vigente:** son **renders generados con Gemini, no
fotos del conjunto real**, y no coinciden con la prenda: en la foto real las
mangas son rojas con vivos; en el render son negras con corazones. Sirven como
ilustración, pero no como promesa de producto. Si aparecen fotos reales,
reemplazan a estas.

**Flyers reales, entregados.** Originales en `../../Flyers/` (capturas de
WhatsApp de 720×1600). Versiones recortadas y en uso en `public/eventos/`:

- **`master-dia-de-la-primavera.jpeg`** (720×1082) — 26/9, 14:30 hs, en Rafael
  Castillo, con el teléfono de Yani impreso y "muchos profes invitados". Sin
  precio. Erratum en el arte: dice "PROFES INVITADO", falta la S.
- **`master-masiva-corrientes.jpeg`** (720×943) — 6, 7 y 8 de noviembre, en
  Mercedes. **No es de Yani**: lleva los logos de NA Jump y de Jumping Fitness
  by Cris. Es el caso "evento de colega" en material real, y muestra que un
  flyer puede traer marcas de terceros. Sin horario, sin dirección exacta, sin
  precio.

Lo que enseñan sobre el material:

- Venían como **capturas de pantalla de Android**, con barra de estado y de
  navegación. Se recortaron detectando la banda de color.
- **No hay proporción estándar: 0,665 contra 0,764.** El marco del flyer tiene
  que adaptarse a lo que llegue, nunca imponer una relación fija ni recortar
  para forzarla.
- Estética del material: neón saturado sobre negro, tipografía de pincel,
  altísimo contraste. **Es mucho más ruidoso que la paleta del sitio**, y el
  diseño tiene que sostener eso sin pelearse: dentro de su marco, el flyer
  manda. El sitio lo enmarca y se corre.

**Sponsors — doce, leídos de una lámina que el cliente mostró por chat.** La
lámina es una composición de círculos sobre fondo decorativo; **todavía no fue
entregada como archivo** (carpeta `../../Sponsors/` creada, vacía). Los nombres,
tal como se leen:

Tienda Morón · Encanto (estética e insumos, by Rocío Martini) · Impresión Arte ·
Helado Móvil · El Banderazo (by Lila Eventos) · NA Jump · Jump Moda Fit
(@Jumpmoda.fit) · Lucho M&A Personalizados · Nutri Sport · Amarcel ·
Across Sport Nutrition · M&A (Dios en los detalles).

Notas: **NA Jump también aparece en el flyer de Corrientes**, o sea que es
sponsor y organizador a la vez. Dos logos traen teléfono impreso dentro del
arte. Las reseñas y las redes de cada uno están pendientes.

**No existe — no fabricar:**

- Fotos reales de las clases, de las alumnas o del espacio. El sitio no tiene
  ni una sola imagen de una clase sucediendo.
- Testimonios de alumnas.
- Precio publicable de la clase o del conjunto.
- Cantidad de alumnas, años de trayectoria, certificaciones con nombre, o
  cualquier métrica de la escuela.

**Resuelto:** `public/tienda/` contenía cuatro capturas de pantalla de una
historia de Instagram, con la barra de estado del iPhone, el botón "◄ Mercado
Pago", la barra de "Responder" y una remera con "ELI" estampado atrás. Se
eliminaron y se reemplazaron por las dos imágenes de arriba.

## Product Principles

1. **El calendario es el producto, no una sección.** La pregunta que trae a
   la alumna actual es "¿cuándo hay clase?". Todo lo demás está al servicio de
   que esa respuesta llegue rápido.

2. **Cada sección sabe a quién le habla.** Nueva o actual, nunca las dos a la
   vez en el mismo bloque. Servir a las dos audiencias es repartirlas, no
   promediarlas.

3. **Todo camino termina en WhatsApp de Yani.** Es el único destino
   confirmado. Ningún flujo debe morir en una pantalla sin salida hacia ahí.

4. **Nada se publica sin material real.** El sitio ya arrastró capturas de
   pantalla con el nombre de otra alumna. Antes que rellenar con material
   prestado, sintético o robado de una historia, se muestra menos.

5. **Lo que es de muestra se declara de muestra.** Mientras los horarios y
   los cupos sean generados, el sitio lo dice. Una alumna que viaja a una
   clase que no existe es un costo real, no un detalle de copy.

6. **La escala chica es un argumento.** Pocos lugares, una profesora, una
   zona. Se comunica como valor, no como limitación a disimular — pero el
   número concreto se lee del dato del mes, nunca se escribe en el diseño.
