const MUSCLE_GROUP_MAP = {
  "Supino Reto": "Peito",
  "Supino com Halter": "Peito",
  "Supino Inclinado": "Peito",
  "Supino Inclinado com Halter": "Peito",
  "Supino Declinado": "Peito",
  "Supino na Máquina": "Peito",
  "Crucifixo": "Peito",
  "Crucifixo Inclinado": "Peito",
  "Crossover": "Peito",
  "Peck Deck": "Peito",
  "Flexão": "Peito",

  "Pulley Frente": "Costas",
  "Pulley Atrás": "Costas",
  "Pulley Neutro": "Costas",
  "Pulley Fechado": "Costas",
  "Pulley Aberto": "Costas",
  "Remada Curvada": "Costas",
  "Remada Baixa": "Costas",
  "Remada Unilateral": "Costas",
  "Remada Cavalinho": "Costas",
  "Remada T": "Costas",
  "Remada na Máquina": "Costas",
  "Levantamento Terra": "Costas",
  "Terra Romeno": "Costas",
  "Barra Fixa": "Costas",
  "Barra Fixa Supinada": "Costas",

  "Rosca Direta": "Bíceps",
  "Rosca Alternada": "Bíceps",
  "Rosca com Halter": "Bíceps",
  "Rosca Martelo": "Bíceps",
  "Rosca Concentrada": "Bíceps",
  "Rosca Scott": "Bíceps",
  "Rosca na Máquina": "Bíceps",
  "Rosca 21": "Bíceps",
  "Rosca Inversa": "Bíceps",

  "Tríceps Corda": "Tríceps",
  "Tríceps Pulley": "Tríceps",
  "Tríceps Testa": "Tríceps",
  "Tríceps Francês": "Tríceps",
  "Tríceps no Banco": "Tríceps",
  "Tríceps Coice": "Tríceps",
  "Tríceps Unilateral": "Tríceps",
  "Mergulho": "Tríceps",

  "Desenvolvimento": "Ombro",
  "Desenvolvimento com Halter": "Ombro",
  "Desenvolvimento com Barra": "Ombro",
  "Desenvolvimento na Máquina": "Ombro",
  "Desenvolvimento Militar": "Ombro",
  "Elevação Lateral": "Ombro",
  "Elevação Frontal": "Ombro",
  "Elevação Posterior": "Ombro",
  "Crucifixo Invertido": "Ombro",
  "Face Pull": "Ombro",

  "Agachamento Livre": "Perna",
  "Agachamento no Smith": "Perna",
  "Agachamento Sumô": "Perna",
  "Agachamento Goblet": "Perna",
  "Hack Squat": "Perna",
  "Leg Press": "Perna",
  "Leg Press 45": "Perna",
  "Cadeira Extensora": "Perna",
  "Cadeira Flexora": "Perna",
  "Mesa Flexora": "Perna",
  "Stiff": "Perna",
  "Avanço": "Perna",
  "Panturrilha": "Perna",
  "Panturrilha na Máquina": "Perna",
  "Panturrilha em Pé": "Perna",

  "Hip Thrust": "Glúteo",
  "Cadeira Adutora": "Glúteo",
  "Cadeira Abdutora": "Glúteo",

  "Abdominal": "Abdômen",
  "Prancha": "Abdômen",
  "Prancha Lateral": "Abdômen",

  "Esteira": "Cardio",
  "Bicicleta Ergométrica": "Cardio",
  "Elíptico": "Cardio",
  "Remo Ergométrico": "Cardio",

  "Kettlebell Swing": "Funcional",
  "Farmer Walk": "Funcional",
  "Burpee": "Funcional"
};

const EXERCISE_MAP = {
  "supino reto": "Supino Reto",
  supino: "Supino Reto",
  "supino barra": "Supino Reto",
  "supino com barra": "Supino Reto",
  "supino halter": "Supino com Halter",
  "supino com halter": "Supino com Halter",
  "supino halteres": "Supino com Halter",
  "supino com halteres": "Supino com Halter",
  "supino altere": "Supino com Halter",
  "supino alteres": "Supino com Halter",
  "supino alter": "Supino com Halter",
  "supino altera": "Supino com Halter",
  "supino inclinado": "Supino Inclinado",
  "supino inclinado halter": "Supino Inclinado com Halter",
  "supino inclinado halteres": "Supino Inclinado com Halter",
  "supino declinado": "Supino Declinado",
  "supino maquina": "Supino na Máquina",
  "supino na maquina": "Supino na Máquina",
  "supino máquina": "Supino na Máquina",
  "supino na máquina": "Supino na Máquina",
  "supino na máquina amarela": "Supino na Máquina",
  "supino na maquina amarela": "Supino na Máquina",
  "supino reto maquina": "Supino na Máquina",
  "supino declinado maquina": "Supino na Máquina",

  agachamento: "Agachamento Livre",
  "agachamento livre": "Agachamento Livre",
  "agachamento barra": "Agachamento Livre",
  "agachamento com barra": "Agachamento Livre",
  "agachamento smith": "Agachamento no Smith",
  "agachamento no smith": "Agachamento no Smith",
  "agachamento smith machine": "Agachamento no Smith",
  "agachamento guiado": "Agachamento no Smith",
  "agachamento hack": "Hack Squat",
  "hack squat": "Hack Squat",
  "agachamento sumô": "Agachamento Sumô",
  "agachamento sumo": "Agachamento Sumô",
  "agachamento goblet": "Agachamento Goblet",
  "goblet squat": "Agachamento Goblet",

  rosca: "Rosca Direta",
  "rosca direta": "Rosca Direta",
  "rosca barra": "Rosca Direta",
  "rosca alternada": "Rosca Alternada",
  "rosca halter": "Rosca com Halter",
  "rosca com halter": "Rosca com Halter",
  "rosca martelo": "Rosca Martelo",
  "rosca concentrada": "Rosca Concentrada",
  "rosca scott": "Rosca Scott",
  "rosca na maquina": "Rosca na Máquina",
  "rosca 21": "Rosca 21",
  "rosca inversa": "Rosca Inversa",

  triceps: "Tríceps Corda",
  tríceps: "Tríceps Corda",
  "triceps corda": "Tríceps Corda",
  "tríceps corda": "Tríceps Corda",
  "triceps pulley": "Tríceps Pulley",
  "tríceps pulley": "Tríceps Pulley",
  "triceps testa": "Tríceps Testa",
  "tríceps testa": "Tríceps Testa",
  "triceps frances": "Tríceps Francês",
  "tríceps francês": "Tríceps Francês",
  "triceps banco": "Tríceps no Banco",
  "tríceps banco": "Tríceps no Banco",
  "triceps coice": "Tríceps Coice",
  "tríceps coice": "Tríceps Coice",
  "triceps unilateral": "Tríceps Unilateral",
  "triceps com barra": "Tríceps Testa",
  "triceps invertido": "Tríceps Pulley",
  "triceps invertido unilateral": "Tríceps Unilateral",

  pulley: "Pulley Frente",
  "pulley frente": "Pulley Frente",
  "pulley frontal": "Pulley Frente",
  "pulley aberto": "Pulley Aberto",
  "pulley fechado": "Pulley Fechado",
  "pulley atras": "Pulley Atrás",
  "pulley atrás": "Pulley Atrás",
  "pulley neutro": "Pulley Neutro",

  puxada: "Pulley Frente",
  "puxada frente": "Pulley Frente",
  "puxada frontal": "Pulley Frente",
  "puxada aberta": "Pulley Aberto",
  "puxada fechada": "Pulley Fechado",
  "puxada neutra": "Pulley Neutro",
  "puxada atras": "Pulley Atrás",
  "puxada atrás": "Pulley Atrás",

  remada: "Remada Curvada",
  "remada curvada": "Remada Curvada",
  "remada baixa": "Remada Baixa",
  "remada unilateral": "Remada Unilateral",
  "remada cavalinho": "Remada Cavalinho",
  "remada serrote": "Remada Unilateral",
  "remada t": "Remada T",
  "remada maquina": "Remada na Máquina",

  "levantamento terra": "Levantamento Terra",
  terra: "Levantamento Terra",
  deadlift: "Levantamento Terra",
  "terra romeno": "Terra Romeno",
  "levantamento terra romeno": "Terra Romeno",
  rdl: "Terra Romeno",

  desenvolvimento: "Desenvolvimento",
  "desenvolvimento halter": "Desenvolvimento com Halter",
  "desenvolvimento barra": "Desenvolvimento com Barra",
  "desenvolvimento maquina": "Desenvolvimento na Máquina",
  "desenvolvimento militar": "Desenvolvimento Militar",
  "press militar": "Desenvolvimento Militar",

  "elevação lateral": "Elevação Lateral",
  "elevacao lateral": "Elevação Lateral",
  "elevação frontal": "Elevação Frontal",
  "elevacao frontal": "Elevação Frontal",
  "elevação posterior": "Elevação Posterior",
  "elevacao posterior": "Elevação Posterior",
  "crucifixo invertido": "Crucifixo Invertido",
  "face pull": "Face Pull",

  crucifixo: "Crucifixo",
  "crucifixo halter": "Crucifixo",
  "crucifixo inclinado": "Crucifixo Inclinado",
  crossover: "Crossover",
  "peck deck": "Peck Deck",
  voador: "Peck Deck",
  "chest press": "Supino na Máquina",

  "leg press": "Leg Press",
  leg: "Leg Press",
  "leg press 45": "Leg Press 45",
  "cadeira extensora": "Cadeira Extensora",
  extensora: "Cadeira Extensora",
  "cadeira flexora": "Cadeira Flexora",
  flexora: "Cadeira Flexora",
  "mesa flexora": "Mesa Flexora",
  panturrilha: "Panturrilha",
  "panturrilha maquina": "Panturrilha na Máquina",
  "panturrilha em pe": "Panturrilha em Pé",
  stiff: "Stiff",
  avanço: "Avanço",
  avanco: "Avanço",
  lunge: "Avanço",
  afundo: "Avanço",

  "hip thrust": "Hip Thrust",
  "elevacao pelvica": "Hip Thrust",
  "elevação pélvica": "Hip Thrust",
  glúteo: "Hip Thrust",
  gluteo: "Hip Thrust",
  "cadeira adutora": "Cadeira Adutora",
  adutora: "Cadeira Adutora",
  "cadeira abdutora": "Cadeira Abdutora",
  abdutora: "Cadeira Abdutora",

  esteira: "Esteira",
  bicicleta: "Bicicleta Ergométrica",
  "bicicleta ergometrica": "Bicicleta Ergométrica",
  eliptico: "Elíptico",
  elíptico: "Elíptico",
  remo: "Remo Ergométrico",
  "remo ergometrico": "Remo Ergométrico",

  abdominal: "Abdominal",
  abdominais: "Abdominal",
  abs: "Abdominal",
  crunch: "Abdominal",
  prancha: "Prancha",
  "prancha lateral": "Prancha Lateral",

  flexao: "Flexão",
  flexão: "Flexão",
  "flexao de braco": "Flexão",
  "barra fixa": "Barra Fixa",
  pullup: "Barra Fixa",
  "pull up": "Barra Fixa",
  chinup: "Barra Fixa Supinada",
  "chin up": "Barra Fixa Supinada",
  mergulho: "Mergulho",
  dip: "Mergulho",
  burpee: "Burpee",
  burpees: "Burpee",
  kettlebell: "Kettlebell Swing",
  swing: "Kettlebell Swing",
  "farmer walk": "Farmer Walk",
  carries: "Farmer Walk",
  "good morning": "Good Morning",
  superman: "Superman",
  "maquina de biceps": "Rosca na Máquina",
  "maquina biceps": "Rosca na Máquina",
  "biceps maquina": "Rosca na Máquina",
  "curl maquina": "Rosca na Máquina",
  "maquina de biceps sentado": "Rosca na Máquina"
};

const EXERCISE_SUGGESTIONS = {
  pulley: ["Pulley Frente", "Pulley Neutro", "Pulley Atrás", "Pulley Aberto"],
  puxada: ["Pulley Frente", "Pulley Aberto", "Barra Fixa", "Remada Baixa"],
  remada: ["Remada Curvada", "Remada Unilateral", "Remada Baixa", "Remada T"],
  triceps: ["Tríceps Corda", "Tríceps Pulley", "Tríceps Testa", "Tríceps Francês"],
  biceps: ["Rosca Direta", "Rosca Martelo", "Rosca Concentrada", "Rosca na Máquina"],
  ombro: ["Desenvolvimento", "Elevação Lateral", "Elevação Frontal", "Face Pull"],
  costas: ["Pulley Frente", "Remada Curvada", "Levantamento Terra", "Barra Fixa"],
  peito: ["Supino Reto", "Supino Inclinado", "Crucifixo", "Peck Deck"],
  perna: ["Agachamento Livre", "Leg Press", "Cadeira Extensora", "Stiff"],
  gluteo: ["Hip Thrust", "Agachamento Sumô", "Cadeira Abdutora", "Stiff"]
};

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .trim();
}

function normalizeExercise(name) {
  if (!name) return name;
  const key = normalizeText(name);
  return EXERCISE_MAP[key] || String(name).trim();
}

function getMuscleGroup(exerciseName) {
  return MUSCLE_GROUP_MAP[exerciseName] || null;
}

function getSuggestions(name) {
  if (!name) return null;

  const key = normalizeText(name);

  for (const [keyword, suggestions] of Object.entries(EXERCISE_SUGGESTIONS)) {
    if (key.includes(keyword)) {
      return suggestions;
    }
  }

  return null;
}

module.exports = {
  normalizeExercise,
  getMuscleGroup,
  getSuggestions,
  normalizeText
};