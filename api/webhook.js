const axios = require("axios");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

const ZAPI_URL = `https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE_ID}/token/${process.env.ZAPI_TOKEN}/send-text`;

const MUSCLE_GROUP_MAP = {
  "Supino Reto": "Peito", "Supino com Halter": "Peito", "Supino Inclinado": "Peito",
  "Supino Inclinado com Halter": "Peito", "Supino Declinado": "Peito", "Supino na Máquina": "Peito",
  "Crucifixo": "Peito", "Crucifixo Inclinado": "Peito", "Crossover": "Peito", "Peck Deck": "Peito", "Flexão": "Peito",
  "Pulley Frente": "Costas", "Pulley Atrás": "Costas", "Pulley Neutro": "Costas",
  "Pulley Fechado": "Costas", "Pulley Aberto": "Costas", "Remada Curvada": "Costas",
  "Remada Baixa": "Costas", "Remada Unilateral": "Costas", "Remada Cavalinho": "Costas",
  "Remada T": "Costas", "Remada na Máquina": "Costas", "Levantamento Terra": "Costas",
  "Terra Romeno": "Costas", "Barra Fixa": "Costas", "Barra Fixa Supinada": "Costas",
  "Rosca Direta": "Bíceps", "Rosca Alternada": "Bíceps", "Rosca com Halter": "Bíceps",
  "Rosca Martelo": "Bíceps", "Rosca Concentrada": "Bíceps", "Rosca Scott": "Bíceps",
  "Rosca na Máquina": "Bíceps", "Rosca 21": "Bíceps", "Rosca Inversa": "Bíceps",
  "Tríceps Corda": "Tríceps", "Tríceps Pulley": "Tríceps", "Tríceps Testa": "Tríceps",
  "Tríceps Francês": "Tríceps", "Tríceps no Banco": "Tríceps", "Tríceps Coice": "Tríceps",
  "Tríceps Unilateral": "Tríceps", "Mergulho": "Tríceps",
  "Desenvolvimento": "Ombro", "Desenvolvimento com Halter": "Ombro", "Desenvolvimento com Barra": "Ombro",
  "Desenvolvimento na Máquina": "Ombro", "Desenvolvimento Militar": "Ombro",
  "Elevação Lateral": "Ombro", "Elevação Frontal": "Ombro", "Elevação Posterior": "Ombro",
  "Crucifixo Invertido": "Ombro", "Face Pull": "Ombro",
  "Agachamento Livre": "Perna", "Agachamento no Smith": "Perna", "Agachamento Sumô": "Perna",
  "Agachamento Goblet": "Perna", "Hack Squat": "Perna", "Leg Press": "Perna", "Leg Press 45": "Perna",
  "Cadeira Extensora": "Perna", "Cadeira Flexora": "Perna", "Mesa Flexora": "Perna",
  "Stiff": "Perna", "Avanço": "Perna", "Panturrilha": "Perna",
  "Panturrilha na Máquina": "Perna", "Panturrilha em Pé": "Perna",
  "Hip Thrust": "Glúteo", "Cadeira Adutora": "Glúteo", "Cadeira Abdutora": "Glúteo",
  "Abdominal": "Abdômen", "Prancha": "Abdômen", "Prancha Lateral": "Abdômen",
  "Esteira": "Cardio", "Bicicleta Ergométrica": "Cardio", "Elíptico": "Cardio", "Remo Ergométrico": "Cardio",
  "Kettlebell Swing": "Funcional", "Farmer Walk": "Funcional", "Burpee": "Funcional",
};

const EXERCISE_MAP = {
  "supino reto": "Supino Reto", supino: "Supino Reto", "supino barra": "Supino Reto",
  "supino com barra": "Supino Reto", "supino halter": "Supino com Halter",
  "supino com halter": "Supino com Halter", "supino halteres": "Supino com Halter",
  "supino com halteres": "Supino com Halter", "supino altere": "Supino com Halter",
  "supino alteres": "Supino com Halter", "supino alter": "Supino com Halter",
  "supino altera": "Supino com Halter", "supino inclinado": "Supino Inclinado",
  "supino inclinado halter": "Supino Inclinado com Halter",
  "supino inclinado halteres": "Supino Inclinado com Halter",
  "supino declinado": "Supino Declinado", "supino maquina": "Supino na Máquina",
  "supino na maquina": "Supino na Máquina", "supino máquina": "Supino na Máquina",
  "supino na máquina": "Supino na Máquina", "supino na máquina amarela": "Supino na Máquina",
  "supino na maquina amarela": "Supino na Máquina", "supino reto maquina": "Supino na Máquina",
  "supino declinado maquina": "Supino na Máquina",
  agachamento: "Agachamento Livre", "agachamento livre": "Agachamento Livre",
  "agachamento barra": "Agachamento Livre", "agachamento com barra": "Agachamento Livre",
  "agachamento smith": "Agachamento no Smith", "agachamento no smith": "Agachamento no Smith",
  "agachamento smith machine": "Agachamento no Smith", "agachamento guiado": "Agachamento no Smith",
  "agachamento hack": "Hack Squat", "hack squat": "Hack Squat",
  "agachamento sumô": "Agachamento Sumô", "agachamento sumo": "Agachamento Sumô",
  "agachamento goblet": "Agachamento Goblet", "goblet squat": "Agachamento Goblet",
  rosca: "Rosca Direta", "rosca direta": "Rosca Direta", "rosca barra": "Rosca Direta",
  "rosca alternada": "Rosca Alternada", "rosca halter": "Rosca com Halter",
  "rosca com halter": "Rosca com Halter", "rosca martelo": "Rosca Martelo",
  "rosca concentrada": "Rosca Concentrada", "rosca scott": "Rosca Scott",
  "rosca na maquina": "Rosca na Máquina", "rosca 21": "Rosca 21", "rosca inversa": "Rosca Inversa",
  triceps: "Tríceps Corda", tríceps: "Tríceps Corda", "triceps corda": "Tríceps Corda",
  "tríceps corda": "Tríceps Corda", "triceps pulley": "Tríceps Pulley", "tríceps pulley": "Tríceps Pulley",
  "triceps testa": "Tríceps Testa", "tríceps testa": "Tríceps Testa",
  "triceps frances": "Tríceps Francês", "tríceps francês": "Tríceps Francês",
  "triceps banco": "Tríceps no Banco", "tríceps banco": "Tríceps no Banco",
  "triceps coice": "Tríceps Coice", "tríceps coice": "Tríceps Coice",
  "triceps unilateral": "Tríceps Unilateral", "triceps com barra": "Tríceps Testa",
  "triceps invertido": "Tríceps Pulley", "triceps invertido unilateral": "Tríceps Unilateral",
  pulley: "Pulley Frente", "pulley frente": "Pulley Frente", "pulley frontal": "Pulley Frente",
  "pulley aberto": "Pulley Aberto", "pulley fechado": "Pulley Fechado",
  "pulley atras": "Pulley Atrás", "pulley atrás": "Pulley Atrás", "pulley neutro": "Pulley Neutro",
  puxada: "Pulley Frente", "puxada frente": "Pulley Frente", "puxada frontal": "Pulley Frente",
  "puxada aberta": "Pulley Aberto", "puxada fechada": "Pulley Fechado",
  "puxada neutra": "Pulley Neutro", "puxada atras": "Pulley Atrás", "puxada atrás": "Pulley Atrás",
  remada: "Remada Curvada", "remada curvada": "Remada Curvada", "remada baixa": "Remada Baixa",
  "remada unilateral": "Remada Unilateral", "remada cavalinho": "Remada Cavalinho",
  "remada serrote": "Remada Unilateral", "remada t": "Remada T", "remada maquina": "Remada na Máquina",
  "levantamento terra": "Levantamento Terra", terra: "Levantamento Terra", deadlift: "Levantamento Terra",
  "terra romeno": "Terra Romeno", "levantamento terra romeno": "Terra Romeno", rdl: "Terra Romeno",
  desenvolvimento: "Desenvolvimento", "desenvolvimento halter": "Desenvolvimento com Halter",
  "desenvolvimento barra": "Desenvolvimento com Barra", "desenvolvimento maquina": "Desenvolvimento na Máquina",
  "desenvolvimento militar": "Desenvolvimento Militar", "press militar": "Desenvolvimento Militar",
  "elevação lateral": "Elevação Lateral", "elevacao lateral": "Elevação Lateral",
  "elevação frontal": "Elevação Frontal", "elevacao frontal": "Elevação Frontal",
  "elevação posterior": "Elevação Posterior", "elevacao posterior": "Elevação Posterior",
  "crucifixo invertido": "Crucifixo Invertido", "face pull": "Face Pull",
  crucifixo: "Crucifixo", "crucifixo halter": "Crucifixo", "crucifixo inclinado": "Crucifixo Inclinado",
  crossover: "Crossover", "peck deck": "Peck Deck", voador: "Peck Deck", "chest press": "Supino na Máquina",
  "leg press": "Leg Press", leg: "Leg Press", "leg press 45": "Leg Press 45",
  "cadeira extensora": "Cadeira Extensora", extensora: "Cadeira Extensora",
  "cadeira flexora": "Cadeira Flexora", flexora: "Cadeira Flexora", "mesa flexora": "Mesa Flexora",
  panturrilha: "Panturrilha", "panturrilha maquina": "Panturrilha na Máquina",
  "panturrilha em pe": "Panturrilha em Pé", stiff: "Stiff",
  avanço: "Avanço", avanco: "Avanço", lunge: "Avanço", afundo: "Avanço",
  "hip thrust": "Hip Thrust", "elevacao pelvica": "Hip Thrust", "elevação pélvica": "Hip Thrust",
  glúteo: "Hip Thrust", gluteo: "Hip Thrust",
  "cadeira adutora": "Cadeira Adutora", adutora: "Cadeira Adutora",
  "cadeira abdutora": "Cadeira Abdutora", abdutora: "Cadeira Abdutora",
  esteira: "Esteira", bicicleta: "Bicicleta Ergométrica", "bicicleta ergometrica": "Bicicleta Ergométrica",
  eliptico: "Elíptico", elíptico: "Elíptico", remo: "Remo Ergométrico", "remo ergometrico": "Remo Ergométrico",
  abdominal: "Abdominal", abdominais: "Abdominal", abs: "Abdominal", crunch: "Abdominal",
  prancha: "Prancha", "prancha lateral": "Prancha Lateral",
  flexao: "Flexão", flexão: "Flexão", "flexao de braco": "Flexão",
  "barra fixa": "Barra Fixa", pullup: "Barra Fixa", "pull up": "Barra Fixa",
  chinup: "Barra Fixa Supinada", "chin up": "Barra Fixa Supinada",
  mergulho: "Mergulho", dip: "Mergulho", burpee: "Burpee", burpees: "Burpee",
  kettlebell: "Kettlebell Swing", swing: "Kettlebell Swing",
  "farmer walk": "Farmer Walk", carries: "Farmer Walk",
  "good morning": "Good Morning", superman: "Superman",
  "maquina de biceps": "Rosca na Máquina", "maquina biceps": "Rosca na Máquina",
  "biceps maquina": "Rosca na Máquina", "curl maquina": "Rosca na Máquina",
  "maquina de biceps sentado": "Rosca na Máquina",
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
  gluteo: ["Hip Thrust", "Agachamento Sumô", "Cadeira Abdutora", "Stiff"],
};

const DAY_NAMES = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

function normalizeExercise(name) {
  if (!name) return name;
  const key = name.toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, "").trim();
  return EXERCISE_MAP[key] || name.trim();
}

function getMuscleGroup(exerciseName) {
  return MUSCLE_GROUP_MAP[exerciseName] || null;
}

function getSuggestions(name) {
  if (!name) return null;
  const key = name.toLowerCase().normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, "").trim();
  for (const [keyword, suggestions] of Object.entries(EXERCISE_SUGGESTIONS)) {
    if (key.includes(keyword)) return suggestions;
  }
  return null;
}

function extractJsonObject(text) {
  if (!text || typeof text !== "string") return null;
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

function removeJsonFromText(text) {
  if (!text || typeof text !== "string") return "";
  return text.replace(/```json[\s\S]*?```/gi, "").replace(/\{[\s\S]*\}/g, "").trim();
}

function formatDateLabel(dateStr) {
  const date = new Date(dateStr);
  const dayName = DAY_NAMES[date.getDay()];
  const formatted = date.toLocaleDateString("pt-BR");
  return `${dayName} - ${formatted}`;
}

// ── Banco ────────────────────────────────────────────────────
async function getOrCreateUser(phone) {
  const { data, error } = await supabase.from("users").select("*").eq("phone", phone).maybeSingle();
  if (error) throw error;
  if (data) return { user: data, isNew: false };
  const { data: newUser, error: insertError } = await supabase
    .from("users").insert({ phone, active: true, awaiting_name: true }).select().single();
  if (insertError) throw insertError;
  return { user: newUser, isNew: true };
}

async function getWorkoutHistory(phone, exercise) {
  const { data } = await supabase.from("workouts").select("*").eq("user_phone", phone)
    .ilike("exercise", `%${normalizeExercise(exercise)}%`)
    .order("created_at", { ascending: false }).limit(10);
  return data || [];
}

async function getLastWorkoutAny(phone, exercise) {
  const { data } = await supabase.from("workouts").select("*").eq("user_phone", phone)
    .ilike("exercise", `%${normalizeExercise(exercise)}%`)
    .order("created_at", { ascending: false }).limit(1);
  return data?.[0] || null;
}

async function getPersonalRecord(phone, exercise) {
  const { data } = await supabase.from("workouts").select("*").eq("user_phone", phone)
    .ilike("exercise", `%${normalizeExercise(exercise)}%`)
    .order("weight_kg", { ascending: false }).limit(1);
  return data?.[0] || null;
}

async function getBestExercise(phone) {
  const { data } = await supabase.from("workouts").select("exercise, weight_kg").eq("user_phone", phone)
    .not("weight_kg", "is", null).order("weight_kg", { ascending: false }).limit(5);
  return data || [];
}

async function saveWorkout(phone, data, daysAgo = 0) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(12, 0, 0, 0);
  const normalizedExercise = normalizeExercise(data.exercise);
  await supabase.from("workouts").insert({
    user_phone: phone,
    exercise: normalizedExercise,
    sets: data.sets,
    reps: data.reps,
    weight_kg: data.weight_kg || null,
    notes: data.notes || null,
    gym: data.gym || null,
    muscle_group: getMuscleGroup(normalizedExercise),
    created_at: daysAgo > 0 ? date.toISOString() : undefined,
  });
}

async function saveMultipleWorkouts(phone, workouts, daysAgo = 0, gym = null) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(12, 0, 0, 0);
  const rows = workouts.map((w) => {
    const ne = normalizeExercise(w.exercise);
    return {
      user_phone: phone, exercise: ne, sets: w.sets, reps: w.reps,
      weight_kg: w.weight_kg || null, gym: w.gym || gym || null,
      muscle_group: getMuscleGroup(ne),
      created_at: daysAgo > 0 ? date.toISOString() : undefined,
    };
  });
  await supabase.from("workouts").insert(rows);
}

async function getLastSessionByMuscleGroup(phone, muscleGroup) {
  const { data } = await supabase.from("workouts").select("*").eq("user_phone", phone)
    .ilike("muscle_group", `%${muscleGroup}%`)
    .order("created_at", { ascending: false }).limit(10);
  if (!data?.length) return [];
  const lastDate = new Date(data[0].created_at).toDateString();
  return data.filter((w) => new Date(w.created_at).toDateString() === lastDate);
}

async function getWorkoutsByGym(phone, gym, exercise) {
  let query = supabase.from("workouts").select("*").eq("user_phone", phone)
    .ilike("gym", `%${gym}%`).order("created_at", { ascending: false });
  if (exercise) query = query.ilike("exercise", `%${normalizeExercise(exercise)}%`);
  const { data } = await query;
  return data || [];
}

async function getPRByGym(phone, exercise, gym) {
  const { data } = await supabase.from("workouts").select("*").eq("user_phone", phone)
    .ilike("exercise", `%${normalizeExercise(exercise)}%`)
    .ilike("gym", `%${gym}%`).not("weight_kg", "is", null)
    .order("weight_kg", { ascending: false }).limit(1);
  return data?.[0] || null;
}

async function deleteLastWorkout(phone, exercise) {
  let query = supabase.from("workouts").select("id, exercise, sets, reps, weight_kg")
    .eq("user_phone", phone).order("created_at", { ascending: false }).limit(1);
  if (exercise) query = query.ilike("exercise", `%${normalizeExercise(exercise)}%`);
  const { data } = await query;
  if (!data?.length) return null;
  await supabase.from("workouts").delete().eq("id", data[0].id);
  return data[0];
}

async function deleteWorkoutById(id) {
  const { data } = await supabase.from("workouts").select("*").eq("id", id).single();
  if (!data) return null;
  await supabase.from("workouts").delete().eq("id", id);
  return data;
}

async function updateLastWorkout(phone, exercise, newData) {
  let query = supabase.from("workouts").select("id, exercise, sets, reps, weight_kg")
    .eq("user_phone", phone).order("created_at", { ascending: false }).limit(1);
  if (exercise) query = query.ilike("exercise", `%${normalizeExercise(exercise)}%`);
  const { data } = await query;
  if (!data?.length) return null;
  const current = data[0];
  const updateFields = {
    sets: newData.sets ?? current.sets,
    reps: newData.reps ?? current.reps,
    weight_kg: newData.weight_kg !== undefined ? (newData.weight_kg || null) : current.weight_kg,
  };
  if (newData.new_exercise) {
    const ne = normalizeExercise(newData.new_exercise);
    updateFields.exercise = ne;
    updateFields.muscle_group = getMuscleGroup(ne);
  }
  await supabase.from("workouts").update(updateFields).eq("id", current.id);
  return { ...current, ...updateFields };
}

async function updateWorkoutById(id, newData) {
  const { data: current } = await supabase.from("workouts").select("*").eq("id", id).single();
  if (!current) return null;
  const updateFields = {
    sets: newData.sets ?? current.sets,
    reps: newData.reps ?? current.reps,
    weight_kg: newData.weight_kg !== undefined ? (newData.weight_kg || null) : current.weight_kg,
  };
  if (newData.new_exercise) {
    const ne = normalizeExercise(newData.new_exercise);
    updateFields.exercise = ne;
    updateFields.muscle_group = getMuscleGroup(ne);
  }
  await supabase.from("workouts").update(updateFields).eq("id", id);
  return { ...current, ...updateFields };
}

async function getWorkoutsByDate(phone, exercise, daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const start = date.toISOString().split("T")[0];
  const end = new Date(date.getTime() + 86400000).toISOString().split("T")[0];
  let query = supabase.from("workouts").select("*").eq("user_phone", phone)
    .gte("created_at", `${start}T00:00:00`).lt("created_at", `${end}T00:00:00`)
    .order("created_at", { ascending: true });
  if (exercise) query = query.ilike("exercise", `%${normalizeExercise(exercise)}%`);
  const { data } = await query;
  return data || [];
}

async function getWeeklySummary(phone) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const { data } = await supabase.from("workouts").select("*").eq("user_phone", phone)
    .gte("created_at", weekAgo.toISOString()).order("created_at", { ascending: true });
  return data || [];
}

// ── Hidratação ────────────────────────────────────────────────
async function getTodayHydration(phone) {
  const today = new Date().toISOString().split("T")[0];
  const { data } = await supabase.from("hydration").select("*").eq("user_phone", phone)
    .eq("date", today).order("created_at", { ascending: true });
  return data || [];
}

async function addHydration(phone, amountMl) {
  const today = new Date().toISOString().split("T")[0];
  await supabase.from("hydration").insert({ user_phone: phone, amount_ml: amountMl, date: today });
}

async function getTotalHydrationToday(phone) {
  const records = await getTodayHydration(phone);
  return records.reduce((sum, r) => sum + r.amount_ml, 0);
}

async function setWaterGoal(phone, goalMl) {
  await supabase.from("users").update({ water_goal_ml: goalMl }).eq("phone", phone);
}

// ── Claude ───────────────────────────────────────────────────
async function askClaude(message, userName, recentHistory) {
  const greeting = userName ? `O nome do usuário é ${userName}.` : "";
  const historyContext = recentHistory?.length
    ? `Exercícios de hoje: ${recentHistory.slice(0, 3).map(w => `${w.exercise} ${w.sets}x${w.reps}${w.weight_kg ? ` ${w.weight_kg}kg` : ""}`).join(", ")}`
    : "";

  const response = await axios.post("https://api.anthropic.com/v1/messages", {
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: `Você é um assistente de treino pessoal via WhatsApp. ${greeting} ${historyContext}

Você APENAS entende sobre treinos, exercícios, academia, hidratação e evolução física.
Se perguntarem sobre outro assunto, redirecione.
Se for dúvida sobre musculação/exercício, responda em texto curto e natural.

IMPORTANTE: Quando a intenção exigir ação do sistema, responda SOMENTE com JSON puro, sem nenhum texto antes ou depois.

Se o usuário perguntar o próprio nome:
{"action":"get_name"}

Registrar UM exercício (hoje):
{"action":"save_workout","exercise":"nome","sets":3,"reps":12,"weight_kg":25,"days_ago":0}

Registrar exercício de dia anterior:
{"action":"save_workout","exercise":"supino","sets":3,"reps":12,"weight_kg":25,"days_ago":1}

Exercícios sem peso:
{"action":"save_workout","exercise":"abdominal","sets":3,"reps":20,"days_ago":0}

Múltiplos exercícios:
{"action":"save_multiple","workouts":[{"exercise":"supino","sets":3,"reps":12,"weight_kg":25},{"exercise":"rosca","sets":4,"reps":10,"weight_kg":15}],"days_ago":0}

Treino de hoje:
{"action":"get_history","days_ago":0}

Treino de ontem:
{"action":"get_history","days_ago":1}

Exercício específico de um dia:
{"action":"get_history","days_ago":1,"exercise":"supino"}

Último treino de um grupo muscular:
{"action":"get_last_session","muscle_group":"Costas"}

Último registro de um exercício:
{"action":"get_last","exercise":"supino"}

PR de exercício específico:
{"action":"get_pr","exercise":"supino"}

Maior peso geral:
{"action":"get_pr_all"}

Resumo da semana:
{"action":"get_weekly_summary"}

Deletar último:
{"action":"delete_last"}

Deletar último de exercício específico:
{"action":"delete_last","exercise":"supino"}

Deletar por posição na lista do dia (ex: "apaga o exercício 11", "exclui o terceiro"):
{"action":"delete_by_position","position":11}

Alterar último registro — inclua APENAS os campos que o usuário mencionou explicitamente:
{"action":"update_last","exercise":"supino","sets":2,"reps":9}
Se o usuário disse apenas "troca para 7,5kg", envie somente: {"action":"update_last","weight_kg":7.5}
Se o usuário disse apenas "troca para 2x9", envie somente: {"action":"update_last","sets":2,"reps":9}

Trocar exercício por outro:
{"action":"update_last","exercise":"pulley","new_exercise":"puxada aberta"}

Alterar por posição — inclua APENAS os campos mencionados:
{"action":"update_by_position","position":11,"weight_kg":7.5}

Mudar nome:
{"action":"change_name","name":"Joao"}

Academia no exercício:
{"action":"save_workout","exercise":"supino","sets":3,"reps":12,"weight_kg":25,"days_ago":0,"gym":"SmartFit"}

Treinos em academia:
{"action":"get_gym_history","gym":"SmartFit"}

PR em academia:
{"action":"get_gym_pr","exercise":"supino","gym":"SmartFit"}

Sugestão de treino:
{"action":"suggest_workout","muscle_group":"peito"}

Registrar água:
{"action":"log_water","amount_ml":500}

Ver água do dia:
{"action":"get_water"}

Definir meta de água:
{"action":"set_water_goal","goal_ml":3000}`,
    messages: [{ role: "user", content: message }],
  }, {
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
  });

  const text = response.data.content[0].text;
  return text.replace(/```json\n?/gi, "").replace(/```\n?/gi, "").trim();
}

async function askClaudeSuggest(muscleGroup, history, userName) {
  const historyText = history.length
    ? `Histórico recente: ${history.map((w) => `${w.exercise} ${w.sets}x${w.reps}${w.weight_kg ? ` - ${w.weight_kg}kg` : ""}`).join(", ")}`
    : "Sem histórico ainda.";
  const response = await axios.post("https://api.anthropic.com/v1/messages", {
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system: `Você é um personal trainer via WhatsApp. Monte um treino para o grupo muscular solicitado. ${historyText} Responda com 4-5 exercícios no formato: "1. *Exercício* - Séries x Reps". Sem introdução longa.`,
    messages: [{ role: "user", content: `Monte um treino de ${muscleGroup} para ${userName}.` }],
  }, {
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
  });
  return response.data.content[0].text;
}

async function sendWhatsApp(phone, message) {
  console.log(`Enviando para ${phone}: ${message}`);
  await axios.post(ZAPI_URL, { phone, message }, {
    headers: {
      "Client-Token": process.env.ZAPI_CLIENT_TOKEN?.trim(),
      "Content-Type": "application/json",
    },
  });
}

function formatWorkout(w, index) {
  const weight = w.weight_kg ? ` - ${w.weight_kg}kg` : "";
  const gym = w.gym ? ` (${w.gym})` : "";
  const num = index !== undefined ? `${index + 1}. ` : "";
  return `${num}*${w.exercise}* - ${w.sets}x${w.reps}${weight}${gym}`;
}

function formatWaterBar(totalMl, goalMl) {
  const pct = goalMl > 0 ? Math.min(Math.round((totalMl / goalMl) * 100), 100) : 0;
  const filled = Math.round(pct / 10);
  return `${"🟦".repeat(filled)}${"⬜".repeat(10 - filled)} ${pct}%`;
}

// ── Handler ──────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { phone, text } = req.body;
  const message = text?.message?.trim();
  if (!message) return res.status(200).json({ ok: true });

  console.log(`Mensagem de ${phone}: ${message}`);

  try {
    const { user, isNew } = await getOrCreateUser(phone);

    if (isNew) {
      await sendWhatsApp(phone, `Olá! 👋 Eu sou seu assistente de treino pessoal.\n\nAntes de começar, como você quer ser chamado?`);
      return res.status(200).json({ ok: true });
    }

    if (user.awaiting_name && !user.name) {
      const name = message.split(" ")[0];
      await supabase.from("users").update({ name, awaiting_name: false }).eq("phone", phone);
      await sendWhatsApp(phone,
        `Perfeito, ${name}! 💪\n\nVou te ajudar a registrar e acompanhar seus treinos.\n\nO que você pode fazer:\n\n🏋️ *Registrar treino*\nEx: "supino 3x12 25kg"\nEx: "abdominal 3x20"\nEx: "ontem fiz agachamento 4x10 80kg"\n\n📊 *Ver histórico*\nEx: "treino de hoje"\nEx: "meu último treino de costas"\nEx: "meu PR de supino"\nEx: "resumo da semana"\n\n✏️ *Corrigir*\nEx: "errei o peso do supino, eram 30kg"\nEx: "apaga o exercício 2"\nEx: "troca o pulley por puxada aberta"\n\n💧 *Hidratação*\nEx: "bebi 500ml"\nEx: "minha meta é 2 litros"\n\n🤖 *Sugestão*\nEx: "me recomenda um treino de peito"\n\nBora treinar! 🚀`
      );
      return res.status(200).json({ ok: true });
    }

    const recentHistory = await getWorkoutsByDate(phone, null, 0);
    const reply = await askClaude(message, user.name, recentHistory);
    const parsed = extractJsonObject(reply);
    const plainReply = removeJsonFromText(reply);

    if (!parsed) {
      await sendWhatsApp(phone, plainReply || `Não entendi. Quer registrar treino, ver histórico ou hidratação? 💪`);
      return res.status(200).json({ ok: true });
    }

    const daysAgo = parsed.days_ago || 0;

    // ── get_name ──
    if (parsed.action === "get_name") {
      await sendWhatsApp(phone, user.name ? `Seu nome salvo é *${user.name}* 💪` : `Ainda não tenho seu nome. Como quer ser chamado?`);
      return res.status(200).json({ ok: true });
    }

    // ── change_name ──
    if (parsed.action === "change_name") {
      const newName = String(parsed.name || "").trim();
      if (!newName) {
        await sendWhatsApp(phone, `Não entendi o nome. Me fala assim: "quero ser chamado de João"`);
        return res.status(200).json({ ok: true });
      }
      await supabase.from("users").update({ name: newName, awaiting_name: false }).eq("phone", phone);
      await sendWhatsApp(phone, `Perfeito! A partir de agora vou te chamar de *${newName}* 💪`);
      return res.status(200).json({ ok: true });
    }

    // ── save_workout ──
    if (parsed.action === "save_workout") {
      const normalizedExercise = normalizeExercise(parsed.exercise);
      const history = await getWorkoutHistory(phone, normalizedExercise);
      await saveWorkout(phone, { ...parsed, exercise: normalizedExercise }, daysAgo);

      const dayLabel = daysAgo === 0 ? "hoje" : daysAgo === 1 ? "ontem" : `${daysAgo} dias atrás`;
      const muscleGroup = getMuscleGroup(normalizedExercise);
      let msg = `✅ *${normalizedExercise}* - ${parsed.sets}x${parsed.reps}${parsed.weight_kg ? ` - ${parsed.weight_kg}kg` : ""} salvo (${dayLabel}), ${user.name}!`;
      if (muscleGroup) msg += `\n💪 Grupo: ${muscleGroup}`;

      if (history.length > 0) {
        const withWeight = history.filter((w) => w.weight_kg);
        const lastEntry = history[0];
        const lastWeight = lastEntry.weight_kg ?? null;
        const lastReps = lastEntry.reps ?? null;
        const lastSets = lastEntry.sets ?? null;
        const maxWeight = withWeight.length ? Math.max(...withWeight.map((w) => w.weight_kg)) : null;
        const last3 = withWeight.slice(0, 3);

        if (parsed.weight_kg) {
          if (maxWeight !== null && parsed.weight_kg > maxWeight) {
            msg += `\n\n🏆 PR BATIDO! Recorde anterior: ${maxWeight}kg. Novo recorde: ${parsed.weight_kg}kg!`;
          } else if (last3.length >= 3) {
            const avg = last3.reduce((s, w) => s + w.weight_kg, 0) / last3.length;
            if (parsed.weight_kg > avg) msg += `\n\n🔥 Acima da média dos últimos 3 treinos (${avg.toFixed(1)}kg). Continue assim!`;
          } else if (lastWeight !== null) {
            const diff = parsed.weight_kg - lastWeight;
            if (diff > 0) msg += `\n\n📈 Subiu ${diff}kg desde o último treino!`;
            else if (diff < 0) msg += `\n\n📉 Desceu ${Math.abs(diff)}kg desde o último treino.`;
            else msg += `\n\n➡️ Mesma carga do último treino.`;
          }
        }

        // Aviso de mudança nas repetições
        if (lastReps !== null && parsed.reps !== lastReps) {
          const repDiff = parsed.reps - lastReps;
          if (repDiff > 0) msg += `\n📈 +${repDiff} rep${repDiff > 1 ? "s" : ""} a mais que o último treino!`;
          else msg += `\n📉 ${Math.abs(repDiff)} rep${Math.abs(repDiff) > 1 ? "s" : ""} a menos que o último treino.`;
        }

        if (lastSets !== null && parsed.sets !== lastSets) {
          const setDiff = parsed.sets - lastSets;
          if (setDiff > 0) msg += `\n📈 +${setDiff} série${setDiff > 1 ? "s" : ""} a mais!`;
          else msg += `\n📉 ${Math.abs(setDiff)} série${Math.abs(setDiff) > 1 ? "s" : ""} a menos.`;
        }

        if (history.length >= 3) msg += `\n💪 ${history.length} registros no histórico.`;
      } else {
        msg += `\n\n🆕 Primeiro registro! Referência criada.`;
      }

      await sendWhatsApp(phone, msg);
      return res.status(200).json({ ok: true });
    }

    // ── save_multiple ──
    if (parsed.action === "save_multiple") {
      const normalized = parsed.workouts.map((w) => ({ ...w, exercise: normalizeExercise(w.exercise) }));
      await saveMultipleWorkouts(phone, normalized, daysAgo);
      const dayLabel = daysAgo === 0 ? "hoje" : daysAgo === 1 ? "ontem" : `${daysAgo} dias atrás`;
      const list = normalized.map((w, i) => formatWorkout(w, i)).join("\n");
      await sendWhatsApp(phone, `Treino de ${dayLabel} salvo, ${user.name}! 💪\n\n${list}`);
      return res.status(200).json({ ok: true });
    }

    // ── get_history ──
    if (parsed.action === "get_history") {
      const workouts = await getWorkoutsByDate(phone, parsed.exercise || null, daysAgo);
      const label = daysAgo === 0 ? "hoje" : daysAgo === 1 ? "ontem" : `${daysAgo} dias atrás`;
      if (!workouts.length) {
        await sendWhatsApp(phone, `Nenhum exercício registrado ${label}, ${user.name}. 💪`);
      } else {
        const list = workouts.map((w, i) => formatWorkout(w, i)).join("\n");
        await sendWhatsApp(phone, `🏋️ Treino de ${label}, ${user.name}:\n\n${list}`);
      }
      return res.status(200).json({ ok: true });
    }

    // ── get_last_session ──
    if (parsed.action === "get_last_session") {
      const workouts = await getLastSessionByMuscleGroup(phone, parsed.muscle_group);
      if (!workouts.length) {
        await sendWhatsApp(phone, `Nenhum treino de *${parsed.muscle_group}* encontrado, ${user.name}.`);
      } else {
        const dateLabel = formatDateLabel(workouts[0].created_at);
        const list = workouts.map((w, i) => formatWorkout(w, i)).join("\n");
        await sendWhatsApp(phone, `🏋️ Último treino de *${parsed.muscle_group}* (${dateLabel}), ${user.name}:\n\n${list}`);
      }
      return res.status(200).json({ ok: true });
    }

    // ── get_last ──
    if (parsed.action === "get_last") {
      const last = await getLastWorkoutAny(phone, parsed.exercise);
      if (!last) {
        const suggestions = getSuggestions(parsed.exercise);
        let msg = `Nenhum registro de *${normalizeExercise(parsed.exercise)}* encontrado, ${user.name}.`;
        if (suggestions) msg += `\n\nVocê quis dizer?\n${suggestions.map((s) => `- ${s}`).join("\n")}`;
        await sendWhatsApp(phone, msg);
      } else {
        const dateLabel = formatDateLabel(last.created_at);
        await sendWhatsApp(phone, `📋 Último *${last.exercise}*:\n${last.sets}x${last.reps}${last.weight_kg ? ` - ${last.weight_kg}kg` : ""}\nEm ${dateLabel}`);
      }
      return res.status(200).json({ ok: true });
    }

    // ── get_pr ──
    if (parsed.action === "get_pr") {
      if (!parsed.exercise) {
        await sendWhatsApp(phone, `Qual exercício você quer saber o PR? Ex: "meu PR de supino" 😊`);
        return res.status(200).json({ ok: true });
      }
      const pr = await getPersonalRecord(phone, parsed.exercise);
      if (!pr) {
        const suggestions = getSuggestions(parsed.exercise);
        let msg = `Nenhum registro de *${normalizeExercise(parsed.exercise)}* encontrado, ${user.name}.`;
        if (suggestions) msg += `\n\nVocê quis dizer?\n${suggestions.map((s) => `- ${s}`).join("\n")}`;
        await sendWhatsApp(phone, msg);
      } else {
        const dateLabel = formatDateLabel(pr.created_at);
        await sendWhatsApp(phone, `🏆 Seu PR de *${pr.exercise}*:\n${pr.sets}x${pr.reps} - ${pr.weight_kg}kg\nAlcançado em ${dateLabel}`);
      }
      return res.status(200).json({ ok: true });
    }

    // ── get_pr_all ──
    if (parsed.action === "get_pr_all") {
      const best = await getBestExercise(phone);
      if (!best.length) {
        await sendWhatsApp(phone, `Nenhum exercício com peso registrado ainda, ${user.name}. 💪`);
      } else {
        const list = best.map((w, i) => `${i + 1}. *${w.exercise}* - ${w.weight_kg}kg`).join("\n");
        await sendWhatsApp(phone, `🏆 Suas maiores cargas, ${user.name}:\n\n${list}`);
      }
      return res.status(200).json({ ok: true });
    }

    // ── get_gym_history ──
    if (parsed.action === "get_gym_history") {
      const workouts = await getWorkoutsByGym(phone, parsed.gym, parsed.exercise || null);
      if (!workouts.length) {
        await sendWhatsApp(phone, `Nenhum treino registrado na ${parsed.gym}, ${user.name}. 💪`);
      } else {
        const list = workouts.slice(0, 10).map((w, i) => formatWorkout(w, i)).join("\n");
        await sendWhatsApp(phone, `🏋️ Treinos na ${parsed.gym}, ${user.name}:\n\n${list}`);
      }
      return res.status(200).json({ ok: true });
    }

    // ── get_gym_pr ──
    if (parsed.action === "get_gym_pr") {
      if (!parsed.exercise || !parsed.gym) {
        await sendWhatsApp(phone, `Me diz o exercício e a academia. Ex: "meu PR de supino na SmartFit" 😊`);
        return res.status(200).json({ ok: true });
      }
      const pr = await getPRByGym(phone, parsed.exercise, parsed.gym);
      if (!pr) {
        await sendWhatsApp(phone, `Nenhum registro de *${normalizeExercise(parsed.exercise)}* na ${parsed.gym}, ${user.name}.`);
      } else {
        const dateLabel = formatDateLabel(pr.created_at);
        await sendWhatsApp(phone, `🏆 Seu PR de *${pr.exercise}* na ${parsed.gym}:\n${pr.sets}x${pr.reps} - ${pr.weight_kg}kg\nAlcançado em ${dateLabel}`);
      }
      return res.status(200).json({ ok: true });
    }

    // ── get_weekly_summary ──
    if (parsed.action === "get_weekly_summary") {
      const workouts = await getWeeklySummary(phone);
      if (!workouts.length) {
        await sendWhatsApp(phone, `Nenhum treino registrado essa semana, ${user.name}. Bora começar! 💪`);
      } else {
        // Agrupa por data
        const byDay = {};
        for (const w of workouts) {
          const dateKey = new Date(w.created_at).toISOString().split("T")[0];
          if (!byDay[dateKey]) byDay[dateKey] = [];
          byDay[dateKey].push(w);
        }

        const sections = Object.entries(byDay).map(([dateKey, dayWorkouts]) => {
          const dateObj = new Date(dateKey + "T12:00:00");
          const dayName = DAY_NAMES[dateObj.getDay()];
          const formatted = dateObj.toLocaleDateString("pt-BR");
          const header = `*${dayName} - ${formatted}*`;
          const list = dayWorkouts.map((w) => `- *${w.exercise}* - ${w.sets}x${w.reps}${w.weight_kg ? ` - ${w.weight_kg}kg` : ""}`).join("\n");
          return `${header}\n${list}`;
        });

        const totalDays = Object.keys(byDay).length;
        const msg = `📊 Resumo da semana, ${user.name}:\n\n${sections.join("\n\n")}\n\n✅ ${workouts.length} exercícios em ${totalDays} dia(s)`;
        await sendWhatsApp(phone, msg);
      }
      return res.status(200).json({ ok: true });
    }

    // ── delete_last ──
    if (parsed.action === "delete_last") {
      const deleted = await deleteLastWorkout(phone, parsed.exercise || null);
      if (!deleted) {
        await sendWhatsApp(phone, `Nenhum exercício encontrado para deletar, ${user.name}.`);
      } else {
        await sendWhatsApp(phone, `🗑️ *${deleted.exercise}* deletado com sucesso, ${user.name}!`);
      }
      return res.status(200).json({ ok: true });
    }

    // ── delete_by_position ──
    if (parsed.action === "delete_by_position") {
      const workouts = await getWorkoutsByDate(phone, null, 0);
      const position = parsed.position || 1;
      const index = position - 1;

      if (!workouts.length) {
        await sendWhatsApp(phone, `Nenhum exercício registrado hoje, ${user.name}.`);
      } else if (index < 0 || index >= workouts.length) {
        await sendWhatsApp(phone, `Posição ${position} inválida. Você tem ${workouts.length} exercício(s) hoje.`);
      } else {
        const target = workouts[index];
        await deleteWorkoutById(target.id);
        await sendWhatsApp(phone, `🗑️ *${target.exercise}* (posição ${position}) deletado, ${user.name}!`);
      }
      return res.status(200).json({ ok: true });
    }

    // ── update_last ──
    if (parsed.action === "update_last") {
      const updated = await updateLastWorkout(phone, parsed.exercise || null, parsed);
      if (!updated) {
        await sendWhatsApp(phone, `Nenhum exercício encontrado para alterar, ${user.name}.`);
      } else {
        const exerciseName = updated.exercise || normalizeExercise(parsed.exercise);
        await sendWhatsApp(phone, `✏️ Registro atualizado, ${user.name}!\n*${exerciseName}* - ${updated.sets}x${updated.reps}${updated.weight_kg ? ` - ${updated.weight_kg}kg` : ""}`);
      }
      return res.status(200).json({ ok: true });
    }

    // ── update_by_position ──
    if (parsed.action === "update_by_position") {
      const workouts = await getWorkoutsByDate(phone, null, 0);
      const position = parsed.position || 1;
      const index = position - 1;

      if (!workouts.length) {
        await sendWhatsApp(phone, `Nenhum exercício registrado hoje, ${user.name}.`);
      } else if (index < 0 || index >= workouts.length) {
        await sendWhatsApp(phone, `Posição ${position} inválida. Você tem ${workouts.length} exercício(s) hoje.`);
      } else {
        const target = workouts[index];
        const updated = await updateWorkoutById(target.id, parsed);
        await sendWhatsApp(phone, `✏️ Exercício ${position} atualizado, ${user.name}!\n*${updated.exercise}* - ${updated.sets}x${updated.reps}${updated.weight_kg ? ` - ${updated.weight_kg}kg` : ""}`);
      }
      return res.status(200).json({ ok: true });
    }

    // ── suggest_workout ──
    if (parsed.action === "suggest_workout") {
      const history = await getWeeklySummary(phone);
      const suggestion = await askClaudeSuggest(parsed.muscle_group, history, user.name);
      await sendWhatsApp(phone, `🤖 Treino de ${parsed.muscle_group} para ${user.name}:\n\n${suggestion}`);
      return res.status(200).json({ ok: true });
    }

    // ── log_water ──
    if (parsed.action === "log_water") {
      const amountMl = Number(parsed.amount_ml || 0);
      if (!amountMl) {
        await sendWhatsApp(phone, `Não entendi a quantidade. Ex: "bebi 500ml"`);
        return res.status(200).json({ ok: true });
      }
      await addHydration(phone, amountMl);
      const totalMl = await getTotalHydrationToday(phone);
      const goalMl = user.water_goal_ml || 2000;
      const bar = formatWaterBar(totalMl, goalMl);
      let msg = `💧 +${amountMl}ml registrado!\n\n${bar}\n${totalMl}ml de ${goalMl}ml hoje`;
      if (totalMl >= goalMl && (totalMl - amountMl) < goalMl) {
        msg += `\n\n🎉 Parabéns, ${user.name}! Meta de hidratação batida hoje! 🏆`;
      } else if (totalMl >= goalMl) {
        msg += `\n\n✅ Meta atingida! Continue assim, ${user.name}!`;
      } else {
        msg += `\n\nFaltam ${goalMl - totalMl}ml para sua meta.`;
      }
      await sendWhatsApp(phone, msg);
      return res.status(200).json({ ok: true });
    }

    // ── get_water ──
    if (parsed.action === "get_water") {
      const totalMl = await getTotalHydrationToday(phone);
      const goalMl = user.water_goal_ml || 2000;
      const bar = formatWaterBar(totalMl, goalMl);
      if (totalMl === 0) {
        await sendWhatsApp(phone, `💧 Ainda não registrou água hoje, ${user.name}.\n\nSua meta é ${goalMl}ml. Bora hidratar! 💪`);
      } else {
        await sendWhatsApp(phone, `💧 Hidratação de hoje, ${user.name}:\n\n${bar}\n${totalMl}ml de ${goalMl}ml\n\n${totalMl >= goalMl ? "✅ Meta atingida!" : `Faltam ${goalMl - totalMl}ml`}`);
      }
      return res.status(200).json({ ok: true });
    }

    // ── set_water_goal ──
    if (parsed.action === "set_water_goal") {
      await setWaterGoal(phone, parsed.goal_ml);
      await sendWhatsApp(phone, `✅ Meta de água definida: *${parsed.goal_ml}ml* por dia, ${user.name}! 💧`);
      return res.status(200).json({ ok: true });
    }

    await sendWhatsApp(phone, plainReply || `Não consegui processar isso. Tenta de outro jeito 😊`);

  } catch (err) {
    console.error("Erro completo:", err.response?.data || err.message || err);
  }

  return res.status(200).json({ ok: true });
};