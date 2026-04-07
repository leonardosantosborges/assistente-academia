const MUSCLE_GROUP_MAP = {
  "Supino Reto": "Peito",
  "Supino com Halter": "Peito",
  "Supino Inclinado": "Peito",
  "Supino Inclinado com Halter": "Peito",
  "Supino Declinado": "Peito",
  "Supino na Maquina": "Peito",
  "Chest Press": "Peito",
  "Crucifixo": "Peito",
  "Crucifixo Inclinado": "Peito",
  "Crossover": "Peito",
  "Peck Deck": "Peito",
  "Flexao": "Peito",
  "Paralelas para Peito": "Peito",

  "Pulley Frente": "Costas",
  "Pulley Atras": "Costas",
  "Pulley Neutro": "Costas",
  "Pulley Fechado": "Costas",
  "Pulley Aberto": "Costas",
  "Puxada Articulada": "Costas",
  "Pulldown": "Costas",
  "Remada Curvada": "Costas",
  "Remada Baixa": "Costas",
  "Remada Unilateral": "Costas",
  "Remada Cavalinho": "Costas",
  "Remada T": "Costas",
  "Remada na Maquina": "Costas",
  "Levantamento Terra": "Costas",
  "Terra Romeno": "Costas",
  "Barra Fixa": "Costas",
  "Barra Fixa Supinada": "Costas",
  "Pullover na Polia": "Costas",

  "Rosca Direta": "Biceps",
  "Rosca Alternada": "Biceps",
  "Rosca com Halter": "Biceps",
  "Rosca Martelo": "Biceps",
  "Rosca Concentrada": "Biceps",
  "Rosca Scott": "Biceps",
  "Rosca na Maquina": "Biceps",
  "Rosca 21": "Biceps",
  "Rosca Inversa": "Biceps",
  "Rosca Spider": "Biceps",
  "Rosca na Polia": "Biceps",

  "Triceps Corda": "Triceps",
  "Triceps Pulley": "Triceps",
  "Triceps Testa": "Triceps",
  "Triceps Frances": "Triceps",
  "Triceps no Banco": "Triceps",
  "Triceps Coice": "Triceps",
  "Triceps Unilateral": "Triceps",
  "Mergulho": "Triceps",
  "Supino Fechado": "Triceps",
  "Triceps Barra V": "Triceps",

  "Desenvolvimento": "Ombro",
  "Desenvolvimento com Halter": "Ombro",
  "Desenvolvimento com Barra": "Ombro",
  "Desenvolvimento na Maquina": "Ombro",
  "Desenvolvimento Militar": "Ombro",
  "Arnold Press": "Ombro",
  "Elevacao Lateral": "Ombro",
  "Elevacao Frontal": "Ombro",
  "Elevacao Posterior": "Ombro",
  "Crucifixo Invertido": "Ombro",
  "Face Pull": "Ombro",
  "Remada Alta": "Ombro",

  "Agachamento Livre": "Perna",
  "Agachamento no Smith": "Perna",
  "Agachamento Sumo": "Perna",
  "Agachamento Goblet": "Perna",
  "Hack Squat": "Perna",
  "Leg Press": "Perna",
  "Leg Press 45": "Perna",
  "Cadeira Extensora": "Perna",
  "Cadeira Flexora": "Perna",
  "Mesa Flexora": "Perna",
  "Stiff": "Perna",
  "Passada": "Perna",
  "Avanco": "Perna",
  "Afundo": "Perna",
  "Bulgaro": "Perna",
  "Panturrilha": "Perna",
  "Panturrilha na Maquina": "Perna",
  "Panturrilha em Pe": "Perna",
  "Panturrilha Sentado": "Perna",
  "Agachamento Búlgaro": "Perna",
  "Cadeira Flexora Unilateral": "Perna",

  "Hip Thrust": "Gluteo",
  "Elevacao Pelvica": "Gluteo",
  "Coice na Polia": "Gluteo",
  "Gluteo na Maquina": "Gluteo",
  "Cadeira Adutora": "Gluteo",
  "Cadeira Abdutora": "Gluteo",
  "Abducao na Polia": "Gluteo",

  "Abdominal": "Abdomen",
  "Prancha": "Abdomen",
  "Prancha Lateral": "Abdomen",
  "Abdominal Infra": "Abdomen",
  "Abdominal na Polia": "Abdomen",
  "Elevação de Pernas": "Abdomen",

  "Esteira": "Cardio",
  "Bicicleta Ergometrica": "Cardio",
  "Eliptico": "Cardio",
  "Remo Ergometrico": "Cardio",
  "Escada": "Cardio",
  "Corrida": "Cardio",
  "Caminhada": "Cardio",

  "Kettlebell Swing": "Funcional",
  "Farmer Walk": "Funcional",
  "Burpee": "Funcional",
  "Thruster": "Funcional",
  "Battle Rope": "Funcional",
  "Box Jump": "Funcional",
  "Good Morning": "Funcional",
  "Superman": "Funcional",
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
  "supino inclinado": "Supino Inclinado",
  "supino inclinado halter": "Supino Inclinado com Halter",
  "supino inclinado com halter": "Supino Inclinado com Halter",
  "supino inclinado halteres": "Supino Inclinado com Halter",
  "supino declinado": "Supino Declinado",
  "supino maquina": "Supino na Maquina",
  "supino na maquina": "Supino na Maquina",
  "chest press": "Chest Press",
  "supino fechado": "Supino Fechado",

  crucifixo: "Crucifixo",
  "crucifixo inclinado": "Crucifixo Inclinado",
  crossover: "Crossover",
  "cross over": "Crossover",
  "peck deck": "Peck Deck",
  voador: "Peck Deck",
  "flexao de braco": "Flexao",
  flexao: "Flexao",
  "paralela peito": "Paralelas para Peito",

  pulley: "Pulley Frente",
  "pulley frente": "Pulley Frente",
  "pulley frontal": "Pulley Frente",
  "pulley aberto": "Pulley Aberto",
  "pulley fechado": "Pulley Fechado",
  "pulley atras": "Pulley Atras",
  "pulley neutro": "Pulley Neutro",
  puxada: "Pulley Frente",
  "puxada frente": "Pulley Frente",
  "puxada frontal": "Pulley Frente",
  "puxada aberta": "Pulley Aberto",
  "puxada fechada": "Pulley Fechado",
  "puxada neutra": "Pulley Neutro",
  "puxada atras": "Pulley Atras",
  "puxada articulada": "Puxada Articulada",
  pulldown: "Pulldown",
  "pull down": "Pulldown",
  "pull over": "Pullover na Polia",
  "pullover polia": "Pullover na Polia",

  remada: "Remada Curvada",
  "remada curvada": "Remada Curvada",
  "remada baixa": "Remada Baixa",
  "remada unilateral": "Remada Unilateral",
  "remada cavalinho": "Remada Cavalinho",
  "remada serrote": "Remada Unilateral",
  "remada t": "Remada T",
  "remada maquina": "Remada na Maquina",
  "remada na maquina": "Remada na Maquina",
  terra: "Levantamento Terra",
  deadlift: "Levantamento Terra",
  "levantamento terra": "Levantamento Terra",
  "terra romeno": "Terra Romeno",
  "levantamento terra romeno": "Terra Romeno",
  rdl: "Terra Romeno",
  "barra fixa": "Barra Fixa",
  pullup: "Barra Fixa",
  "pull up": "Barra Fixa",
  chinup: "Barra Fixa Supinada",
  "chin up": "Barra Fixa Supinada",

  rosca: "Rosca Direta",
  "rosca direta": "Rosca Direta",
  "rosca barra": "Rosca Direta",
  "rosca alternada": "Rosca Alternada",
  "rosca halter": "Rosca com Halter",
  "rosca com halter": "Rosca com Halter",
  "rosca martelo": "Rosca Martelo",
  "rosca concentrada": "Rosca Concentrada",
  "rosca scott": "Rosca Scott",
  "rosca na maquina": "Rosca na Maquina",
  "rosca 21": "Rosca 21",
  "rosca inversa": "Rosca Inversa",
  "rosca spider": "Rosca Spider",
  "rosca polia": "Rosca na Polia",
  "curl maquina": "Rosca na Maquina",
  "maquina de biceps": "Rosca na Maquina",
  "maquina biceps": "Rosca na Maquina",
  "biceps maquina": "Rosca na Maquina",

  triceps: "Triceps Corda",
  "triceps corda": "Triceps Corda",
  "triceps pulley": "Triceps Pulley",
  "triceps testa": "Triceps Testa",
  "triceps frances": "Triceps Frances",
  "triceps banco": "Triceps no Banco",
  "triceps coice": "Triceps Coice",
  "triceps unilateral": "Triceps Unilateral",
  "triceps barra v": "Triceps Barra V",
  mergulho: "Mergulho",
  dip: "Mergulho",

  desenvolvimento: "Desenvolvimento",
  "desenvolvimento halter": "Desenvolvimento com Halter",
  "desenvolvimento com halter": "Desenvolvimento com Halter",
  "desenvolvimento barra": "Desenvolvimento com Barra",
  "desenvolvimento com barra": "Desenvolvimento com Barra",
  "desenvolvimento maquina": "Desenvolvimento na Maquina",
  "desenvolvimento militar": "Desenvolvimento Militar",
  "press militar": "Desenvolvimento Militar",
  "arnold press": "Arnold Press",
  "elevacao lateral": "Elevacao Lateral",
  "elevacao frontal": "Elevacao Frontal",
  "elevacao posterior": "Elevacao Posterior",
  "crucifixo invertido": "Crucifixo Invertido",
  "face pull": "Face Pull",
  "remada alta": "Remada Alta",

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
  "agachamento sumo": "Agachamento Sumo",
  "sumo squat": "Agachamento Sumo",
  "agachamento goblet": "Agachamento Goblet",
  "goblet squat": "Agachamento Goblet",
  "leg press": "Leg Press",
  "leg press 45": "Leg Press 45",
  extensora: "Cadeira Extensora",
  "cadeira extensora": "Cadeira Extensora",
  flexora: "Cadeira Flexora",
  "cadeira flexora": "Cadeira Flexora",
  "cadeira flexora unilateral": "Cadeira Flexora Unilateral",
  "mesa flexora": "Mesa Flexora",
  stiff: "Stiff",
  passada: "Passada",
  avanco: "Avanco",
  lunge: "Avanco",
  afundo: "Afundo",
  bulgaro: "Bulgaro",
  "agachamento bulgaro": "Agachamento Búlgaro",
  panturrilha: "Panturrilha",
  "panturrilha maquina": "Panturrilha na Maquina",
  "panturrilha em pe": "Panturrilha em Pe",
  "panturrilha sentado": "Panturrilha Sentado",

  "hip thrust": "Hip Thrust",
  "elevacao pelvica": "Elevacao Pelvica",
  "gluteo maquina": "Gluteo na Maquina",
  "coice polia": "Coice na Polia",
  "cadeira adutora": "Cadeira Adutora",
  adutora: "Cadeira Adutora",
  "cadeira abdutora": "Cadeira Abdutora",
  abdutora: "Cadeira Abdutora",
  "abducao polia": "Abducao na Polia",

  abdominal: "Abdominal",
  abdominais: "Abdominal",
  abs: "Abdominal",
  crunch: "Abdominal",
  prancha: "Prancha",
  "prancha lateral": "Prancha Lateral",
  "abdominal infra": "Abdominal Infra",
  "abdominal polia": "Abdominal na Polia",
  "elevacao de pernas": "Elevação de Pernas",

  esteira: "Esteira",
  bicicleta: "Bicicleta Ergometrica",
  "bicicleta ergometrica": "Bicicleta Ergometrica",
  eliptico: "Eliptico",
  remo: "Remo Ergometrico",
  "remo ergometrico": "Remo Ergometrico",
  escada: "Escada",
  corrida: "Corrida",
  caminhada: "Caminhada",

  kettlebell: "Kettlebell Swing",
  swing: "Kettlebell Swing",
  "farmer walk": "Farmer Walk",
  carries: "Farmer Walk",
  burpee: "Burpee",
  burpees: "Burpee",
  thruster: "Thruster",
  "battle rope": "Battle Rope",
  "box jump": "Box Jump",
  "good morning": "Good Morning",
  superman: "Superman",
};

const EXERCISE_SUGGESTIONS = {
  pulley: ["Pulley Frente", "Pulley Neutro", "Pulley Atras", "Pulley Aberto"],
  puxada: ["Pulley Frente", "Pulley Aberto", "Barra Fixa", "Remada Baixa"],
  remada: ["Remada Curvada", "Remada Unilateral", "Remada Baixa", "Remada T"],
  triceps: ["Triceps Corda", "Triceps Pulley", "Triceps Testa", "Triceps Frances"],
  biceps: ["Rosca Direta", "Rosca Martelo", "Rosca Concentrada", "Rosca na Maquina"],
  ombro: ["Desenvolvimento", "Elevacao Lateral", "Elevacao Frontal", "Face Pull"],
  costas: ["Pulley Frente", "Remada Curvada", "Levantamento Terra", "Barra Fixa"],
  peito: ["Supino Reto", "Supino Inclinado", "Crucifixo", "Peck Deck"],
  perna: ["Agachamento Livre", "Leg Press", "Cadeira Extensora", "Stiff"],
  gluteo: ["Hip Thrust", "Agachamento Sumo", "Cadeira Abdutora", "Stiff"],
};

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function toTitleCase(text) {
  return String(text || "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeExercise(name) {
  if (!name) return name;
  const key = normalizeText(name);
  return EXERCISE_MAP[key] || toTitleCase(key);
}

function getMuscleGroup(exerciseName) {
  return MUSCLE_GROUP_MAP[exerciseName] || null;
}

function isKnownExercise(exerciseName) {
  return !!MUSCLE_GROUP_MAP[exerciseName];
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
  normalizeText,
  isKnownExercise,
};
