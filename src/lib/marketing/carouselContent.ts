/**
 * Módulos alineados con la currícula FD Bienestar (emocional / financiero / alimentario).
 * Rotación: se elige el siguiente módulo de cada pilar por día nuevo; no se reutiliza
 * hasta completar el ciclo de ese pilar (8 · 11 · 10).
 */

export type CurriculumModule = {
  title: string;
  description: string;
  durationMin: number;
};

export type PillarTheme = {
  title: string;
  bullets: string[];
  reflection: string;
};

/** 8 temas — educación emocional */
export const EMOTIONAL_MODULES: CurriculumModule[] = [
  {
    title: "Autoconciencia emocional",
    description:
      "Reconocer lo que sientes, ponerle nombre y entender cómo influyen tus emociones en tus decisiones.",
    durationMin: 10,
  },
  {
    title: "Regulación emocional",
    description:
      "Estrategias prácticas para regular la intensidad de las emociones sin reprimirlas.",
    durationMin: 15,
  },
  {
    title: "Comunicación emocional efectiva",
    description:
      "Expresar lo que sientes de forma clara y respetuosa, incluso en conversaciones difíciles.",
    durationMin: 12,
  },
  {
    title: "Empatía y trabajo en equipo",
    description:
      "Ponerse en el lugar de otras personas y colaborar mejor en equipos diversos.",
    durationMin: 12,
  },
  {
    title: "Resiliencia y adaptabilidad",
    description:
      "Aprender de la dificultad, recuperarte de los tropiezos y adaptarte al cambio.",
    durationMin: 12,
  },
  {
    title: "Liderazgo emocional",
    description:
      "Influir positivamente en otras personas gestionando tus emociones y las del equipo.",
    durationMin: 15,
  },
  {
    title: "Energía, bienestar integral y prevención del burnout",
    description:
      "Cuidar tu energía física, mental y emocional para reducir el riesgo de desgaste extremo.",
    durationMin: 15,
  },
  {
    title: "Cultura y clima emocional organizacional",
    description:
      "Cómo las emociones compartidas influyen en la cultura y el clima de los equipos y organizaciones.",
    durationMin: 15,
  },
];

/** 11 temas — educación financiera */
export const FINANCIAL_MODULES: CurriculumModule[] = [
  {
    title: "Conceptos básicos del presupuesto",
    description:
      "Ingresos, gastos y un marco sencillo para planificar tu dinero.",
    durationMin: 12,
  },
  {
    title: "Ahorro y fondo de emergencia",
    description:
      "Por qué ahorrar, cuánto intentar ahorrar y dónde guardar el fondo de emergencia.",
    durationMin: 10,
  },
  {
    title: "Entender la deuda",
    description:
      "Tipos de deuda, intereses y estrategias para reducirla (solo educativo).",
    durationMin: 15,
  },
  {
    title: "Conceptos básicos de inversión",
    description:
      "Qué es invertir, riesgo y rentabilidad, y productos habituales (solo educación).",
    durationMin: 15,
  },
  {
    title: "Gastos y consumo consciente",
    description:
      "Diferenciar necesidades y deseos, reducir compras impulsivas y alinear el gasto con tus valores.",
    durationMin: 10,
  },
  {
    title: "Seguros básicos",
    description:
      "Para qué sirven los seguros más habituales (salud, hogar, vida) y qué tener en cuenta al contratar.",
    durationMin: 12,
  },
  {
    title: "Planificación financiera a largo plazo",
    description:
      "Metas a largo plazo, jubilación y cómo ir construyendo un plan paso a paso.",
    durationMin: 15,
  },
  {
    title: "Impuestos y obligaciones fiscales básicas",
    description:
      "Conceptos básicos sobre impuestos, declaración de la renta y obligaciones fiscales del día a día.",
    durationMin: 12,
  },
  {
    title: "Compras grandes: vivienda y coche",
    description:
      "Qué valorar antes de comprar una vivienda o un vehículo y cómo evitar sobreendeudarse.",
    durationMin: 12,
  },
  {
    title: "Salud financiera y estrés por dinero",
    description:
      "Cómo el dinero afecta al bienestar emocional y qué puedes hacer para reducir la ansiedad financiera.",
    durationMin: 10,
  },
  {
    title: "Fraudes y protección del consumidor",
    description:
      "Señales de alerta ante estafas, phishing y cómo proteger tus datos y tu dinero.",
    durationMin: 10,
  },
];

/** 10 temas — alimentación / nutrición educativa */
export const NUTRITION_MODULES: CurriculumModule[] = [
  {
    title: "Alimentación equilibrada y plato saludable",
    description:
      "Qué es una dieta equilibrada, el plato saludable y cómo distribuir los grupos de alimentos en el día.",
    durationMin: 12,
  },
  {
    title: "Hidratación y bebidas",
    description:
      "Por qué es importante beber suficiente agua, cuánto y cómo elegir bebidas que te nutran sin exceso de azúcar.",
    durationMin: 8,
  },
  {
    title: "Porciones y señales de saciedad",
    description:
      "Aprender a reconocer el hambre real, la saciedad y servir porciones adecuadas sin restricción extrema.",
    durationMin: 10,
  },
  {
    title: "Lectura de etiquetas nutricionales",
    description:
      "Interpretar el etiquetado: ingredientes, nutrientes, azúcares añadidos y porciones para decidir mejor.",
    durationMin: 12,
  },
  {
    title: "Comer con atención (alimentación consciente)",
    description:
      "Comer sin distracciones, masticar bien y conectar con las señales del cuerpo para disfrutar más y regular mejor.",
    durationMin: 10,
  },
  {
    title: "Planificación de comidas y compra",
    description:
      "Organizar menús semanales, hacer la lista de la compra y reducir el desperdicio de alimentos.",
    durationMin: 12,
  },
  {
    title: "Desayuno y ritmos de comida",
    description:
      "Qué aporta un buen desayuno, horarios regulares y cómo adaptar las comidas a tu ritmo de vida.",
    durationMin: 10,
  },
  {
    title: "Snacks y tentempiés saludables",
    description:
      "Opciones de snacks nutritivos entre horas para mantener energía sin abusar de ultraprocesados.",
    durationMin: 8,
  },
  {
    title: "Cocción y conservación de alimentos",
    description:
      "Métodos de cocción que preservan nutrientes y prácticas seguras para guardar y recalentar comida.",
    durationMin: 10,
  },
  {
    title: "Mitos y realidades sobre la alimentación",
    description:
      "Desmontar creencias frecuentes sobre dietas milagro, superalimentos y mensajes publicitarios.",
    durationMin: 12,
  },
];

export const THEME_COUNTS = {
  emotional: EMOTIONAL_MODULES.length,
  financial: FINANCIAL_MODULES.length,
  nutrition: NUTRITION_MODULES.length,
} as const;

const DISCLOSURE =
  "Contenido solo educativo. FD Bienestar no sustituye terapia, atención médica, asesoramiento financiero, nutricional ni legal. Consulta a profesionales cualificados.";

export function getAccount() {
  const raw = process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE?.trim();
  const handle = raw
    ? raw.startsWith("@")
      ? raw
      : `@${raw}`
    : "@fdbienestar";
  const site =
    process.env.NEXT_PUBLIC_BIENESTAR_SITE?.trim() ||
    "bienestar.fdmediaglobal.cloud";
  return { name: "FD Bienestar", handle, site } as const;
}

function moduleToPillarTheme(m: CurriculumModule): PillarTheme {
  const parts = m.description
    .split(/(?<=[.])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const bullets =
    parts.length >= 2 ? parts.slice(0, 3) : [m.description, `Módulo orientativo: ~${m.durationMin} min en la plataforma.`];
  return {
    title: m.title,
    bullets,
    reflection: `En la plataforma puedes profundizar ~${m.durationMin} min en este módulo. Lleva una idea práctica a tu día; si necesitas ayuda personalizada, consulta a un profesional.`,
  };
}

export type GeneratedSlide = {
  order: number;
  pillar: "COVER" | "EMOTIONAL" | "FINANCIAL" | "NUTRITION" | "CLOSING";
  headline: string;
  body: string;
  hashtags: string | null;
};

export function generateCarouselSlidesFromIndices(
  forDateKey: string,
  emotionalIndex: number,
  financialIndex: number,
  nutritionIndex: number
): GeneratedSlide[] {
  const account = getAccount();
  const em = EMOTIONAL_MODULES[emotionalIndex % EMOTIONAL_MODULES.length]!;
  const fi = FINANCIAL_MODULES[financialIndex % FINANCIAL_MODULES.length]!;
  const nu = NUTRITION_MODULES[nutritionIndex % NUTRITION_MODULES.length]!;
  const emotional = moduleToPillarTheme(em);
  const financial = moduleToPillarTheme(fi);
  const nutrition = moduleToPillarTheme(nu);

  const tags =
    "#FDBienestar #Bienestar #EducaciónEmocional #EducaciónFinanciera #AlimentaciónConsciente #Equilibrio";

  return [
    {
      order: 1,
      pillar: "COVER",
      headline: `FD Bienestar · ${forDateKey}`,
      body: `${account.name}\nEquilibrio emocional, financiero y alimentario.\n\nHoy: ${em.title} · ${fi.title} · ${nu.title}\n\nSwipe →`,
      hashtags: tags,
    },
    {
      order: 2,
      pillar: "EMOTIONAL",
      headline: `Emocional · ${emotional.title}`,
      body: [
        `Tiempo orientativo: ~${em.durationMin} min`,
        "",
        ...emotional.bullets.map((b, i) => `${i + 1}. ${b}`),
      ].join("\n"),
      hashtags: null,
    },
    {
      order: 3,
      pillar: "EMOTIONAL",
      headline: "Para reflexionar (emocional)",
      body: emotional.reflection,
      hashtags: null,
    },
    {
      order: 4,
      pillar: "FINANCIAL",
      headline: `Finanzas · ${financial.title}`,
      body: [
        `Tiempo orientativo: ~${fi.durationMin} min`,
        "",
        ...financial.bullets.map((b, i) => `${i + 1}. ${b}`),
      ].join("\n"),
      hashtags: null,
    },
    {
      order: 5,
      pillar: "FINANCIAL",
      headline: "Para reflexionar (finanzas)",
      body: financial.reflection,
      hashtags: null,
    },
    {
      order: 6,
      pillar: "NUTRITION",
      headline: `Alimentación · ${nutrition.title}`,
      body: [
        `Tiempo orientativo: ~${nu.durationMin} min`,
        "",
        ...nutrition.bullets.map((b, i) => `${i + 1}. ${b}`),
      ].join("\n"),
      hashtags: null,
    },
    {
      order: 7,
      pillar: "CLOSING",
      headline: `Para reflexionar (alimentación) · ${account.handle}`,
      body: `${nutrition.reflection}\n\nMás: ${account.site}\n${DISCLOSURE}`,
      hashtags: tags,
    },
  ];
}

/** Texto breve del módulo para la tarjeta “frase del día”. */
function phraseHookFromDescription(description: string): string {
  const t = description.trim();
  const parts = t.split(/(?<=[.!?])\s+/);
  return (parts[0] ?? t).trim();
}

export type DailyPhraseContent = {
  dateKey: string;
  /** Frase que une emoción, dinero y alimentación */
  integrativeLine: string;
  emotional: { label: string; title: string; hook: string };
  financial: { label: string; title: string; hook: string };
  nutrition: { label: string; title: string; hook: string };
};

/**
 * Frase del día alineada con los mismos módulos emocional / financiero / alimentario
 * que el carrusel del `forDateKey` (índices de rotación).
 */
export function buildDailyPhraseContent(
  forDateKey: string,
  emotionalIndex: number,
  financialIndex: number,
  nutritionIndex: number
): DailyPhraseContent {
  const em = EMOTIONAL_MODULES[emotionalIndex % EMOTIONAL_MODULES.length]!;
  const fi = FINANCIAL_MODULES[financialIndex % FINANCIAL_MODULES.length]!;
  const nu = NUTRITION_MODULES[nutritionIndex % NUTRITION_MODULES.length]!;
  const integrativeLine = `Hoy enlazamos tres pilares: «${em.title}», «${fi.title}» y «${nu.title}».`;

  return {
    dateKey: forDateKey,
    integrativeLine,
    emotional: {
      label: "Emocional",
      title: em.title,
      hook: phraseHookFromDescription(em.description),
    },
    financial: {
      label: "Financiero",
      title: fi.title,
      hook: phraseHookFromDescription(fi.description),
    },
    nutrition: {
      label: "Alimentario",
      title: nu.title,
      hook: phraseHookFromDescription(nu.description),
    },
  };
}

/** Resumen legible para UI (p. ej. “3/8”) */
export function formatThemePosition(
  pillar: "emotional" | "financial" | "nutrition",
  zeroBasedIndex: number
): string {
  const n =
    pillar === "emotional"
      ? THEME_COUNTS.emotional
      : pillar === "financial"
        ? THEME_COUNTS.financial
        : THEME_COUNTS.nutrition;
  const human = (zeroBasedIndex % n) + 1;
  return `${human}/${n}`;
}
