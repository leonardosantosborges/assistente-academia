const axios = require("axios");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

const ZAPI_URL = `https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE_ID}/token/${process.env.ZAPI_TOKEN}/send-text`;

// ── Normalização de exercícios ──────────────────────────────
const EXERCISE_MAP = {
  // Supino
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
  "supino declinado": "Supino Declinado",
  "supino maquina": "Supino na Máquina",
  "supino na maquina": "Supino na Máquina",
  "supino máquina": "Supino na Máquina",
  "supino na máquina": "Supino na Máquina",
  "supino na máquina amarela": "Supino na Máquina",
  "supino na maquina amarela": "Supino na Máquina",
  // Agachamento
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
  // Rosca
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
  // Triceps
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
  // Puxada / Costas
  puxada: "Puxada Frente",
  "puxada frente": "Puxada Frente",
  "puxada frontal": "Puxada Frente",
  "puxada atras": "Puxada Atrás",
  remada: "Remada Curvada",
  "remada curvada": "Remada Curvada",
  "remada baixa": "Remada Baixa",
  "remada unilateral": "Remada Unilateral",
  "levantamento terra": "Levantamento Terra",
  terra: "Levantamento Terra",
  deadlift: "Levantamento Terra",
  // Ombro
  desenvolvimento: "Desenvolvimento",
  "desenvolvimento halter": "Desenvolvimento com Halter",
  "desenvolvimento barra": "Desenvolvimento com Barra",
  "desenvolvimento maquina": "Desenvolvimento na Máquina",
  "elevação lateral": "Elevação Lateral",
  "elevacao lateral": "Elevação Lateral",
  "elevação frontal": "Elevação Frontal",
  // Perna
  "leg press": "Leg Press",
  leg: "Leg Press",
  "cadeira extensora": "Cadeira Extensora",
  extensora: "Cadeira Extensora",
  "cadeira flexora": "Cadeira Flexora",
  flexora: "Cadeira Flexora",
  "mesa flexora": "Mesa Flexora",
  panturrilha: "Panturrilha",
  stiff: "Stiff",
  // Sem peso
  abdominal: "Abdominal",
  abdominais: "Abdominal",
  abs: "Abdominal",
  prancha: "Prancha",
  flexao: "Flexão",
  flexão: "Flexão",
  "barra fixa": "Barra Fixa",
  pullup: "Barra Fixa",
  "pull up": "Barra Fixa",
  mergulho: "Mergulho",
  dip: "Mergulho",
};

function normalizeExercise(name) {
  if (!name) return name;
  const key = name
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .trim();
  return EXERCISE_MAP[key] || name.trim();
}

// ── Funções de banco ──────────────────────────────────────────
async function getOrCreateUser(phone) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();
  if (error) throw error;
  if (data) return { user: data, isNew: false };
  const { data: newUser, error: insertError } = await supabase
    .from("users")
    .insert({ phone, active: true, awaiting_name: true })
    .select()
    .single();
  if (insertError) throw insertError;
  return { user: newUser, isNew: true };
}

async function getWorkoutHistory(phone, exercise) {
  const normalized = normalizeExercise(exercise);
  const { data } = await supabase
    .from("workouts")
    .select("*")
    .eq("user_phone", phone)
    .ilike("exercise", `%${normalized}%`)
    .order("created_at", { ascending: false })
    .limit(10);
  return data || [];
}

async function getLastWorkoutAny(phone, exercise) {
  const normalized = normalizeExercise(exercise);
  const { data } = await supabase
    .from("workouts")
    .select("*")
    .eq("user_phone", phone)
    .ilike("exercise", `%${normalized}%`)
    .order("created_at", { ascending: false })
    .limit(1);
  return data?.[0] || null;
}

async function getPersonalRecord(phone, exercise) {
  const normalized = normalizeExercise(exercise);
  const { data } = await supabase
    .from("workouts")
    .select("*")
    .eq("user_phone", phone)
    .ilike("exercise", `%${normalized}%`)
    .order("weight_kg", { ascending: false })
    .limit(1);
  return data?.[0] || null;
}

async function getBestExercise(phone) {
  const { data } = await supabase
    .from("workouts")
    .select("exercise, weight_kg")
    .eq("user_phone", phone)
    .not("weight_kg", "is", null)
    .order("weight_kg", { ascending: false })
    .limit(5);
  return data || [];
}

async function saveWorkout(phone, data, daysAgo = 0) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(12, 0, 0, 0);

  await supabase.from("workouts").insert({
    user_phone: phone,
    exercise: normalizeExercise(data.exercise),
    sets: data.sets,
    reps: data.reps,
    weight_kg: data.weight_kg || null,
    notes: data.notes || null,
    gym: data.gym || null,
    created_at: daysAgo > 0 ? date.toISOString() : undefined,
  });
}

async function saveMultipleWorkouts(phone, workouts, daysAgo = 0, gym = null) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(12, 0, 0, 0);

  const rows = workouts.map((w) => ({
    user_phone: phone,
    exercise: normalizeExercise(w.exercise),
    sets: w.sets,
    reps: w.reps,
    weight_kg: w.weight_kg || null,
    gym: w.gym || gym || null,
    created_at: daysAgo > 0 ? date.toISOString() : undefined,
  }));
  await supabase.from("workouts").insert(rows);
}

async function getWorkoutsByGym(phone, gym, exercise) {
  let query = supabase
    .from("workouts")
    .select("*")
    .eq("user_phone", phone)
    .ilike("gym", `%${gym}%`)
    .order("created_at", { ascending: false });

  if (exercise) {
    const normalized = normalizeExercise(exercise);
    query = query.ilike("exercise", `%${normalized}%`);
  }

  const { data } = await query;
  return data || [];
}

async function getPRByGym(phone, exercise, gym) {
  const normalized = normalizeExercise(exercise);
  const { data } = await supabase
    .from("workouts")
    .select("*")
    .eq("user_phone", phone)
    .ilike("exercise", `%${normalized}%`)
    .ilike("gym", `%${gym}%`)
    .not("weight_kg", "is", null)
    .order("weight_kg", { ascending: false })
    .limit(1);
  return data?.[0] || null;
}

async function deleteLastWorkout(phone, exercise) {
  let query = supabase
    .from("workouts")
    .select("id, exercise, sets, reps, weight_kg")
    .eq("user_phone", phone)
    .order("created_at", { ascending: false })
    .limit(1);

  if (exercise) {
    const normalized = normalizeExercise(exercise);
    query = query.ilike("exercise", `%${normalized}%`);
  }

  const { data } = await query;
  if (!data?.length) return null;
  await supabase.from("workouts").delete().eq("id", data[0].id);
  return data[0];
}

async function updateLastWorkout(phone, exercise, newData) {
  let query = supabase
    .from("workouts")
    .select("id")
    .eq("user_phone", phone)
    .order("created_at", { ascending: false })
    .limit(1);

  if (exercise) {
    const normalized = normalizeExercise(exercise);
    query = query.ilike("exercise", `%${normalized}%`);
  }

  const { data } = await query;
  if (!data?.length) return null;

  await supabase
    .from("workouts")
    .update({
      sets: newData.sets,
      reps: newData.reps,
      weight_kg: newData.weight_kg || null,
    })
    .eq("id", data[0].id);

  return data[0];
}

async function getWorkoutsByDate(phone, exercise, daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const start = date.toISOString().split("T")[0];
  const end = new Date(date.getTime() + 86400000).toISOString().split("T")[0];

  let query = supabase
    .from("workouts")
    .select("*")
    .eq("user_phone", phone)
    .gte("created_at", `${start}T00:00:00`)
    .lt("created_at", `${end}T00:00:00`)
    .order("created_at", { ascending: true });

  if (exercise) {
    const normalized = normalizeExercise(exercise);
    query = query.ilike("exercise", `%${normalized}%`);
  }

  const { data } = await query;
  return data || [];
}

async function getWeeklySummary(phone) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const { data } = await supabase
    .from("workouts")
    .select("*")
    .eq("user_phone", phone)
    .gte("created_at", weekAgo.toISOString())
    .order("created_at", { ascending: true });
  return data || [];
}

// ── Claude principal ──────────────────────────────────────────
async function askClaude(message, userName, recentHistory) {
  const greeting = userName ? `O nome do usuário é ${userName}.` : "";
  const historyContext = recentHistory?.length
    ? `Histórico de hoje: ${JSON.stringify(recentHistory.slice(0, 5))}`
    : "";

  const response = await axios.post(
    "https://api.anthropic.com/v1/messages",
    {
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: `Você é um assistente de treino pessoal via WhatsApp. ${greeting} ${historyContext}

Você APENAS entende sobre treinos, exercícios, academia e evolução física. Se o usuário perguntar sobre qualquer outro assunto, responda que você só pode ajudar com treinos e academia.

Quando o usuário registrar UM exercício (hoje), responda APENAS com JSON:
{"action":"save_workout","exercise":"nome","sets":3,"reps":12,"weight_kg":25,"days_ago":0}

Quando registrar exercício de dia anterior (ex: "ontem fiz supino", "anteontem agachei", "fiz supino segunda"):
{"action":"save_workout","exercise":"supino","sets":3,"reps":12,"weight_kg":25,"days_ago":1}
days_ago: 1=ontem, 2=anteontem, 3=três dias atrás, e assim por diante.

Para exercícios sem peso (abdominal, flexão, barra), omita weight_kg:
{"action":"save_workout","exercise":"abdominal","sets":3,"reps":20,"days_ago":0}

Quando registrar MÚLTIPLOS exercícios de uma vez:
{"action":"save_multiple","workouts":[{"exercise":"supino","sets":3,"reps":12,"weight_kg":25},{"exercise":"rosca","sets":4,"reps":10,"weight_kg":15}],"days_ago":0}

Quando perguntar sobre treino de hoje:
{"action":"get_history","days_ago":0}

Quando perguntar sobre treino de ontem:
{"action":"get_history","days_ago":1}

Quando perguntar sobre exercício específico de um dia:
{"action":"get_history","days_ago":1,"exercise":"supino"}

Quando perguntar pelo último registro de um exercício:
{"action":"get_last","exercise":"supino"}

Quando perguntar pelo PR de um exercício específico:
{"action":"get_pr","exercise":"supino"}

Quando perguntar qual exercício teve maior peso geral:
{"action":"get_pr_all"}

Quando perguntar sobre a semana:
{"action":"get_weekly_summary"}

Quando quiser deletar o último registro:
{"action":"delete_last"}
Ou exercício específico:
{"action":"delete_last","exercise":"supino"}

Quando quiser ALTERAR/CORRIGIR o último registro (ex: "errei o peso do supino, eram 30kg", "corrija o último para 3x12 30kg"):
{"action":"update_last","exercise":"supino","sets":3,"reps":12,"weight_kg":30}

Quando quiser mudar o nome:
{"action":"change_name","name":"novo nome"}

Quando pedir sugestão de treino:
{"action":"suggest_workout","muscle_group":"peito"}

Quando o usuário mencionar a academia onde treinou (ex: "fiz supino na SmartFit", "treinei na academia X", "supino 3x12 25kg - Smart"), extraia o nome da academia no campo gym:
{"action":"save_workout","exercise":"supino","sets":3,"reps":12,"weight_kg":25,"days_ago":0,"gym":"SmartFit"}

Se não mencionar academia, omita o campo gym.

Quando perguntar sobre treinos em uma academia específica (ex: "o que treinei na SmartFit", "histórico na academia X"):
{"action":"get_gym_history","gym":"SmartFit"}

Quando perguntar pelo PR em uma academia específica (ex: "qual meu PR de supino na SmartFit"):
{"action":"get_gym_pr","exercise":"supino","gym":"SmartFit"}

Para qualquer mensagem fora de treino/academia, responda em texto:
"Só posso te ajudar com treinos e academia! 💪 Se quiser registrar um exercício ou ver seu histórico, é só falar."

Nunca use blocos de código. Nunca use asteriscos duplos. Use hífen em vez de @.`,
      messages: [{ role: "user", content: message }],
    },
    {
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
    },
  );
  const text = response.data.content[0].text;
  return text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
}

async function askClaudeSuggest(muscleGroup, history, userName) {
  const historyText = history.length
    ? `Histórico recente: ${history.map((w) => `${w.exercise} ${w.sets}x${w.reps}${w.weight_kg ? ` - ${w.weight_kg}kg` : ""}`).join(", ")}`
    : "Sem histórico ainda.";

  const response = await axios.post(
    "https://api.anthropic.com/v1/messages",
    {
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: `Você é um personal trainer via WhatsApp. Monte um treino para o grupo muscular solicitado. ${historyText} Responda com 4-5 exercícios no formato: "1. Exercício - Séries x Reps". Sem introdução longa. Não use asteriscos duplos.`,
      messages: [
        {
          role: "user",
          content: `Monte um treino de ${muscleGroup} para ${userName}.`,
        },
      ],
    },
    {
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
    },
  );
  return response.data.content[0].text;
}

async function sendWhatsApp(phone, message) {
  console.log(`Enviando para ${phone}: ${message}`);
  await axios.post(
    ZAPI_URL,
    { phone, message },
    {
      headers: {
        "Client-Token": process.env.ZAPI_CLIENT_TOKEN?.trim(),
        "Content-Type": "application/json",
      },
    },
  );
}

function formatWorkout(w) {
  const weight = w.weight_kg ? ` - ${w.weight_kg}kg` : "";
  const gym = w.gym ? ` (${w.gym})` : "";
  return `${w.exercise} - ${w.sets}x${w.reps}${weight}${gym}`;
}

// ── Handler principal ─────────────────────────────────────────
module.exports = async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { phone, text } = req.body;
  const message = text?.message?.trim();
  if (!message) return res.status(200).json({ ok: true });

  console.log(`Mensagem de ${phone}: ${message}`);

  try {
    const { user, isNew } = await getOrCreateUser(phone);

    if (isNew) {
      await sendWhatsApp(
        phone,
        `Olá! 👋 Eu sou seu assistente de treino pessoal.\n\nAntes de começar, como você quer ser chamado?`,
      );
      return res.status(200).json({ ok: true });
    }

    if (user.awaiting_name && !user.name) {
      const name = message.split(" ")[0];
      await supabase
        .from("users")
        .update({ name, awaiting_name: false })
        .eq("phone", phone);
      await sendWhatsApp(
        phone,
        `Perfeito, ${name}! 💪\n\nVou te ajudar a registrar e acompanhar seus treinos.\n\nO que você pode fazer:\n\n🏋️ Registrar treino\nEx: "supino 3x12 25kg"\nEx: "abdominal 3x20" (sem peso)\nEx: "fiz supino 3x12 e rosca 4x10 15kg"\nEx: "ontem fiz agachamento 4x10 80kg"\n\n📊 Ver histórico\nEx: "o que treinei hoje?"\nEx: "treino de ontem"\nEx: "último supino"\nEx: "meu PR de supino"\nEx: "resumo da semana"\n\n✏️ Corrigir erro\nEx: "errei o peso do supino, eram 30kg"\nEx: "apaga o último exercício"\n\n🤖 Sugestão de treino\nEx: "me recomenda um treino de peito"\n\nBora treinar! 🚀`,
      );
      return res.status(200).json({ ok: true });
    }

    const recentHistory = await getWorkoutsByDate(phone, null, 0);
    const reply = await askClaude(message, user.name, recentHistory);

    try {
      const parsed = JSON.parse(reply);
      const daysAgo = parsed.days_ago || 0;

      // ── salvar um exercício ──
      if (parsed.action === "save_workout") {
        const normalizedExercise = normalizeExercise(parsed.exercise);
        const history = await getWorkoutHistory(phone, normalizedExercise);
        await saveWorkout(
          phone,
          { ...parsed, exercise: normalizedExercise },
          daysAgo,
        );

        const dayLabel =
          daysAgo === 0
            ? "hoje"
            : daysAgo === 1
              ? "ontem"
              : `${daysAgo} dias atrás`;
        let msg = `✅ ${normalizedExercise} - ${parsed.sets}x${parsed.reps}${parsed.weight_kg ? ` - ${parsed.weight_kg}kg` : ""} salvo (${dayLabel}), ${user.name}!`;

        if (history.length > 0 && parsed.weight_kg) {
          const lastWeight = history[0].weight_kg;
          const maxWeight = Math.max(
            ...history.filter((w) => w.weight_kg).map((w) => w.weight_kg),
          );
          const last3 = history.slice(0, 3).filter((w) => w.weight_kg);
          const diff = lastWeight ? parsed.weight_kg - lastWeight : null;

          if (parsed.weight_kg > maxWeight) {
            msg += `\n\n🏆 PR BATIDO! Recorde anterior: ${maxWeight}kg. Novo recorde: ${parsed.weight_kg}kg!`;
          } else if (last3.length >= 3) {
            const avgLast3 =
              last3.reduce((sum, w) => sum + w.weight_kg, 0) / last3.length;
            if (parsed.weight_kg > avgLast3) {
              msg += `\n\n🔥 Acima da média dos últimos 3 treinos (${avgLast3.toFixed(1)}kg). Continue assim!`;
            }
          } else if (diff !== null && diff > 0) {
            msg += `\n\n📈 Subiu ${diff}kg desde o último treino!`;
          } else if (diff !== null && diff < 0) {
            msg += `\n\n📉 Desceu ${Math.abs(diff)}kg desde o último treino.`;
          } else if (diff === 0) {
            msg += `\n\n➡️ Mesma carga do último treino.`;
          }

          if (history.length >= 3) {
            msg += `\n💪 ${history.length} registros no histórico.`;
          }
        } else if (history.length === 0) {
          msg += `\n\n🆕 Primeiro registro! Referência criada.`;
        }

        await sendWhatsApp(phone, msg);
        return res.status(200).json({ ok: true });
      }

      // ── salvar múltiplos exercícios ──
      if (parsed.action === "save_multiple") {
        const normalized = parsed.workouts.map((w) => ({
          ...w,
          exercise: normalizeExercise(w.exercise),
        }));
        await saveMultipleWorkouts(phone, normalized, daysAgo);
        const dayLabel =
          daysAgo === 0
            ? "hoje"
            : daysAgo === 1
              ? "ontem"
              : `${daysAgo} dias atrás`;
        const list = normalized.map((w) => `✅ ${formatWorkout(w)}`).join("\n");
        await sendWhatsApp(
          phone,
          `Treino de ${dayLabel} salvo, ${user.name}! 💪\n\n${list}`,
        );
        return res.status(200).json({ ok: true });
      }

      // ── histórico por data ──
      if (parsed.action === "get_history") {
        const workouts = await getWorkoutsByDate(
          phone,
          parsed.exercise || null,
          daysAgo,
        );
        const label =
          daysAgo === 0
            ? "hoje"
            : daysAgo === 1
              ? "ontem"
              : `${daysAgo} dias atrás`;

        if (!workouts.length) {
          await sendWhatsApp(
            phone,
            `Nenhum exercício registrado ${label}, ${user.name}. 💪`,
          );
        } else {
          const list = workouts
            .map((w, i) => `${i + 1}. ${formatWorkout(w)}`)
            .join("\n");
          await sendWhatsApp(
            phone,
            `🏋️ Treino de ${label}, ${user.name}:\n\n${list}`,
          );
        }
        return res.status(200).json({ ok: true });
      }

      // ── último registro de um exercício ──
      if (parsed.action === "get_last") {
        const last = await getLastWorkoutAny(phone, parsed.exercise);
        if (!last) {
          await sendWhatsApp(
            phone,
            `Nenhum registro de ${normalizeExercise(parsed.exercise)} encontrado, ${user.name}.`,
          );
        } else {
          const date = new Date(last.created_at).toLocaleDateString("pt-BR");
          await sendWhatsApp(
            phone,
            `📋 Último ${last.exercise}:\n${last.sets}x${last.reps}${last.weight_kg ? ` - ${last.weight_kg}kg` : ""}\nEm ${date}`,
          );
        }
        return res.status(200).json({ ok: true });
      }

      // ── PR de um exercício ──
      if (parsed.action === "get_pr") {
        if (!parsed.exercise) {
          await sendWhatsApp(
            phone,
            `Qual exercício você quer saber o PR? Ex: "meu PR de supino" 😊`,
          );
          return res.status(200).json({ ok: true });
        }
        const pr = await getPersonalRecord(phone, parsed.exercise);
        if (!pr) {
          await sendWhatsApp(
            phone,
            `Nenhum registro de ${normalizeExercise(parsed.exercise)} encontrado, ${user.name}.`,
          );
        } else {
          const date = new Date(pr.created_at).toLocaleDateString("pt-BR");
          await sendWhatsApp(
            phone,
            `🏆 Seu PR de ${pr.exercise}:\n${pr.sets}x${pr.reps} - ${pr.weight_kg}kg\nAlcançado em ${date}`,
          );
        }
        return res.status(200).json({ ok: true });
      }

      // ── PR geral ──
      if (parsed.action === "get_pr_all") {
        const best = await getBestExercise(phone);
        if (!best.length) {
          await sendWhatsApp(
            phone,
            `Nenhum exercício com peso registrado ainda, ${user.name}. 💪`,
          );
        } else {
          const list = best
            .map((w, i) => `${i + 1}. ${w.exercise} - ${w.weight_kg}kg`)
            .join("\n");
          await sendWhatsApp(
            phone,
            `🏆 Suas maiores cargas, ${user.name}:\n\n${list}`,
          );
        }
        return res.status(200).json({ ok: true });
      }

      // ── histórico por academia ──
      if (parsed.action === "get_gym_history") {
        const workouts = await getWorkoutsByGym(
          phone,
          parsed.gym,
          parsed.exercise || null,
        );
        if (!workouts.length) {
          await sendWhatsApp(
            phone,
            `Nenhum treino registrado na ${parsed.gym}, ${user.name}. 💪`,
          );
        } else {
          const list = workouts
            .slice(0, 10)
            .map((w, i) => `${i + 1}. ${formatWorkout(w)}`)
            .join("\n");
          await sendWhatsApp(
            phone,
            `🏋️ Treinos na ${parsed.gym}, ${user.name}:\n\n${list}`,
          );
        }
        return res.status(200).json({ ok: true });
      }

      // ── PR por academia ──
      if (parsed.action === "get_gym_pr") {
        if (!parsed.exercise || !parsed.gym) {
          await sendWhatsApp(
            phone,
            `Me diz o exercício e a academia. Ex: "meu PR de supino na SmartFit" 😊`,
          );
          return res.status(200).json({ ok: true });
        }
        const pr = await getPRByGym(phone, parsed.exercise, parsed.gym);
        if (!pr) {
          await sendWhatsApp(
            phone,
            `Nenhum registro de ${normalizeExercise(parsed.exercise)} na ${parsed.gym}, ${user.name}.`,
          );
        } else {
          const date = new Date(pr.created_at).toLocaleDateString("pt-BR");
          await sendWhatsApp(
            phone,
            `🏆 Seu PR de ${pr.exercise} na ${parsed.gym}:\n${pr.sets}x${pr.reps} - ${pr.weight_kg}kg\nAlcançado em ${date}`,
          );
        }
        return res.status(200).json({ ok: true });
      }

      // ── resumo semanal ──
      if (parsed.action === "get_weekly_summary") {
        const workouts = await getWeeklySummary(phone);
        if (!workouts.length) {
          await sendWhatsApp(
            phone,
            `Nenhum treino registrado essa semana, ${user.name}. Bora começar! 💪`,
          );
        } else {
          const days = [
            ...new Set(
              workouts.map((w) =>
                new Date(w.created_at).toLocaleDateString("pt-BR"),
              ),
            ),
          ];
          const list = workouts.map((w) => `- ${formatWorkout(w)}`).join("\n");
          await sendWhatsApp(
            phone,
            `📊 Resumo da semana, ${user.name}:\n\n${list}\n\n✅ ${workouts.length} exercícios em ${days.length} dia(s)\n📅 ${days.join(", ")}`,
          );
        }
        return res.status(200).json({ ok: true });
      }

      // ── deletar último registro ──
      if (parsed.action === "delete_last") {
        const deleted = await deleteLastWorkout(phone, parsed.exercise || null);
        if (!deleted) {
          await sendWhatsApp(
            phone,
            `Nenhum exercício encontrado para deletar, ${user.name}.`,
          );
        } else {
          await sendWhatsApp(
            phone,
            `🗑️ ${deleted.exercise} deletado com sucesso, ${user.name}!`,
          );
        }
        return res.status(200).json({ ok: true });
      }

      // ── alterar último registro ──
      if (parsed.action === "update_last") {
        const updated = await updateLastWorkout(
          phone,
          parsed.exercise || null,
          parsed,
        );
        if (!updated) {
          await sendWhatsApp(
            phone,
            `Nenhum exercício encontrado para alterar, ${user.name}.`,
          );
        } else {
          await sendWhatsApp(
            phone,
            `✏️ Registro atualizado, ${user.name}!\n${normalizeExercise(parsed.exercise)} - ${parsed.sets}x${parsed.reps}${parsed.weight_kg ? ` - ${parsed.weight_kg}kg` : ""}`,
          );
        }
        return res.status(200).json({ ok: true });
      }

      // ── mudar nome ──
      if (parsed.action === "change_name") {
        await supabase
          .from("users")
          .update({ name: parsed.name })
          .eq("phone", phone);
        await sendWhatsApp(
          phone,
          `✅ Pronto! Agora vou te chamar de ${parsed.name}. 😊`,
        );
        return res.status(200).json({ ok: true });
      }

      // ── sugestão de treino ──
      if (parsed.action === "suggest_workout") {
        const history = await getWeeklySummary(phone);
        const suggestion = await askClaudeSuggest(
          parsed.muscle_group,
          history,
          user.name,
        );
        await sendWhatsApp(
          phone,
          `🤖 Treino de ${parsed.muscle_group} para ${user.name}:\n\n${suggestion}`,
        );
        return res.status(200).json({ ok: true });
      }

      await sendWhatsApp(phone, reply);
    } catch {
      await sendWhatsApp(phone, reply);
    }
  } catch (err) {
    console.error("Erro completo:", err.response?.data || err.message || err);
  }

  return res.status(200).json({ ok: true });
};
