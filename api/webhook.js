const axios = require("axios");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);
const ZAPI_URL = `https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE_ID}/token/${process.env.ZAPI_TOKEN}/send-text`;

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
  const { data } = await supabase
    .from("workouts")
    .select("*")
    .eq("user_phone", phone)
    .ilike("exercise", `%${exercise}%`)
    .order("created_at", { ascending: false })
    .limit(10);
  return data || [];
}

async function getLastWorkoutAny(phone, exercise) {
  const { data } = await supabase
    .from("workouts")
    .select("*")
    .eq("user_phone", phone)
    .ilike("exercise", `%${exercise}%`)
    .order("created_at", { ascending: false })
    .limit(1);
  return data?.[0] || null;
}

async function getPersonalRecord(phone, exercise) {
  const { data } = await supabase
    .from("workouts")
    .select("*")
    .eq("user_phone", phone)
    .ilike("exercise", `%${exercise}%`)
    .order("weight_kg", { ascending: false })
    .limit(1);
  return data?.[0] || null;
}

async function saveWorkout(phone, data) {
  await supabase.from("workouts").insert({
    user_phone: phone,
    exercise: data.exercise,
    sets: data.sets,
    reps: data.reps,
    weight_kg: data.weight_kg || null,
    notes: data.notes || null,
  });
}

async function saveMultipleWorkouts(phone, workouts) {
  const rows = workouts.map((w) => ({
    user_phone: phone,
    exercise: w.exercise,
    sets: w.sets,
    reps: w.reps,
    weight_kg: w.weight_kg || null,
  }));
  await supabase.from("workouts").insert(rows);
}

async function deleteLastWorkout(phone, exercise) {
  const query = supabase
    .from("workouts")
    .select("id")
    .eq("user_phone", phone)
    .order("created_at", { ascending: false })
    .limit(1);

  if (exercise) query.ilike("exercise", `%${exercise}%`);

  const { data } = await query;
  if (!data?.length) return null;

  await supabase.from("workouts").delete().eq("id", data[0].id);
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

  if (exercise) query = query.ilike("exercise", `%${exercise}%`);

  const { data } = await query;
  return data || [];
}

async function getWeeklySummary(phone) {
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);

  const { data } = await supabase
    .from("workouts")
    .select("*")
    .eq("user_phone", phone)
    .gte("created_at", weekAgo.toISOString())
    .order("created_at", { ascending: true });

  return data || [];
}

async function askClaude(message, userName, recentHistory) {
  const greeting = userName ? `O nome do usuário é ${userName}.` : "";
  const historyContext = recentHistory?.length
    ? `Histórico recente do usuário: ${JSON.stringify(recentHistory.slice(0, 5))}`
    : "";

  const response = await axios.post(
    "https://api.anthropic.com/v1/messages",
    {
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: `Você é um assistente de treino pessoal via WhatsApp. ${greeting} ${historyContext}

Quando o usuário registrar UM exercício, responda APENAS com JSON:
{"action":"save_workout","exercise":"nome","sets":3,"reps":12,"weight_kg":25}

Para exercícios sem peso (ex: abdominal, flexão, barra), omita weight_kg:
{"action":"save_workout","exercise":"abdominal","sets":3,"reps":20}

Quando registrar MÚLTIPLOS exercícios de uma vez, responda APENAS com JSON:
{"action":"save_multiple","workouts":[{"exercise":"supino","sets":3,"reps":12,"weight_kg":25},{"exercise":"rosca","sets":4,"reps":10,"weight_kg":15}]}

Quando perguntar sobre treino de hoje ou histórico geral, responda APENAS com:
{"action":"get_history","days_ago":0}

Quando perguntar sobre treino de ontem, responda APENAS com:
{"action":"get_history","days_ago":1}

Quando perguntar sobre um exercício específico de ontem ou outro dia, responda APENAS com:
{"action":"get_history","days_ago":1,"exercise":"supino"}

Quando perguntar pelo último registro de um exercício independente do dia (ex: "último supino", "última vez que fiz supino"):
{"action":"get_last","exercise":"supino"}

Quando perguntar pelo PR ou recorde de um exercício (ex: "qual meu PR de supino", "maior peso no supino"):
{"action":"get_pr","exercise":"supino"}

Quando perguntar sobre a semana (ex: "como foi minha semana", "quantos treinos essa semana", "resumo semanal"):
{"action":"get_weekly_summary"}

Quando quiser deletar ou corrigir um registro (ex: "errei o peso", "apaga o último", "deletar último supino"):
{"action":"delete_last","exercise":"supino"}
Ou sem exercício específico:
{"action":"delete_last"}

Quando quiser mudar o nome (ex: "me chama de X", "meu nome é X", "meu nome não é X é Y"):
{"action":"change_name","name":"novo nome"}

Quando pedir sugestão ou recomendação de treino (ex: "me recomenda um treino de peito", "o que treinar hoje"):
{"action":"suggest_workout","muscle_group":"peito"}

Para qualquer outra mensagem, responda normalmente em texto curto e amigável. Nunca use blocos de código.`,
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
    ? `Histórico recente: ${history.map((w) => `${w.exercise} ${w.sets}x${w.reps}${w.weight_kg ? ` @ ${w.weight_kg}kg` : ""}`).join(", ")}`
    : "Sem histórico ainda.";

  const response = await axios.post(
    "https://api.anthropic.com/v1/messages",
    {
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: `Você é um personal trainer via WhatsApp. Monte um treino curto e prático para o grupo muscular solicitado. ${historyText} Responda de forma direta com 4-5 exercícios no formato: "1. Exercício — Séries x Reps". Sem introdução longa.`,
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
  const INSTANCE_ID = process.env.ZAPI_INSTANCE_ID?.trim();
  const TOKEN = process.env.ZAPI_TOKEN?.trim();

  console.log("INSTANCE_ID RAW:", JSON.stringify(INSTANCE_ID));
  console.log("TOKEN RAW:", JSON.stringify(TOKEN));
  console.log(
    "ZAPI URL:",
    `https://api.z-api.io/instances/${INSTANCE_ID}/token/${TOKEN}/send-text`,
  );
  await axios.post(ZAPI_URL, { phone, message });
}

function formatWorkout(w) {
  const weight = w.weight_kg ? ` @ ${w.weight_kg}kg` : "";
  return `*${w.exercise}* — ${w.sets}x${w.reps}${weight}`;
}

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
        `Perfeito, *${name}*! 💪\n\nAgora eu vou te ajudar a registrar e acompanhar seus treinos.\n\nVocê pode fazer várias coisas comigo 👇\n\n🏋️ *Registrar treino*\nEx: "supino 3x12 25kg"\nEx: "abdominal 3x20" (sem peso)\nEx: "fiz supino 3x12 e rosca 4x10 15kg" (vários de uma vez)\n\n📊 *Ver histórico*\nEx: "o que treinei hoje?"\nEx: "treino de ontem"\nEx: "último supino"\nEx: "meu PR de supino"\nEx: "resumo da semana"\n\n🗑️ *Corrigir erro*\nEx: "apaga o último exercício"\nEx: "errei o supino, deleta"\n\n🤖 *Sugestão de treino*\nEx: "me recomenda um treino de peito"\n\n💡 Fala do jeito que quiser — eu entendo 😉\n\nBora treinar! 🚀`,
      );
      return res.status(200).json({ ok: true });
    }

    // busca histórico recente para contexto
    const recentHistory = await getWorkoutsByDate(phone, null, 0);
    const reply = await askClaude(message, user.name, recentHistory);

    try {
      const parsed = JSON.parse(reply);

      // ── salvar um exercício ──
      if (parsed.action === "save_workout") {
        const history = await getWorkoutHistory(phone, parsed.exercise);
        await saveWorkout(phone, parsed);

        let msg = `✅ ${formatWorkout(parsed)} salvo, ${user.name}!`;

        if (history.length > 0) {
          const lastWeight = history[0].weight_kg;
          const maxWeight = Math.max(
            ...history.filter((w) => w.weight_kg).map((w) => w.weight_kg),
          );
          const last3 = history.slice(0, 3).filter((w) => w.weight_kg);
          const diff =
            parsed.weight_kg && lastWeight
              ? parsed.weight_kg - lastWeight
              : null;

          if (parsed.weight_kg && parsed.weight_kg > maxWeight) {
            msg += `\n\n🏆 *PR BATIDO!* Recorde anterior: ${maxWeight}kg. Novo recorde: ${parsed.weight_kg}kg!`;
          } else if (last3.length >= 3 && parsed.weight_kg) {
            const avgLast3 =
              last3.reduce((sum, w) => sum + w.weight_kg, 0) / last3.length;
            if (parsed.weight_kg > avgLast3) {
              msg += `\n\n🔥 Acima da sua média dos últimos 3 treinos (${avgLast3.toFixed(1)}kg). Continue assim!`;
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
        } else {
          msg += `\n\n🆕 Primeiro registro! Referência criada.`;
        }

        await sendWhatsApp(phone, msg);
        return res.status(200).json({ ok: true });
      }

      // ── salvar múltiplos exercícios ──
      if (parsed.action === "save_multiple") {
        await saveMultipleWorkouts(phone, parsed.workouts);
        const list = parsed.workouts
          .map((w) => `✅ ${formatWorkout(w)}`)
          .join("\n");
        await sendWhatsApp(phone, `Treino salvo, ${user.name}! 💪\n\n${list}`);
        return res.status(200).json({ ok: true });
      }

      // ── histórico por data ──
      if (parsed.action === "get_history") {
        const daysAgo = parsed.days_ago || 0;
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
            `🏋️ *Treino de ${label}, ${user.name}:*\n\n${list}`,
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
            `Nenhum registro de *${parsed.exercise}* encontrado, ${user.name}.`,
          );
        } else {
          const date = new Date(last.created_at).toLocaleDateString("pt-BR");
          await sendWhatsApp(
            phone,
            `📋 Último *${last.exercise}*:\n${last.sets}x${last.reps}${last.weight_kg ? ` @ ${last.weight_kg}kg` : ""}\nEm ${date}`,
          );
        }
        return res.status(200).json({ ok: true });
      }

      // ── PR de um exercício ──
      if (parsed.action === "get_pr") {
        const pr = await getPersonalRecord(phone, parsed.exercise);
        if (!pr) {
          await sendWhatsApp(
            phone,
            `Nenhum registro de *${parsed.exercise}* encontrado, ${user.name}.`,
          );
        } else {
          const date = new Date(pr.created_at).toLocaleDateString("pt-BR");
          await sendWhatsApp(
            phone,
            `🏆 Seu PR de *${pr.exercise}*:\n${pr.sets}x${pr.reps} @ *${pr.weight_kg}kg*\nAlcançado em ${date}`,
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
          const list = workouts.map((w) => `• ${formatWorkout(w)}`).join("\n");
          await sendWhatsApp(
            phone,
            `📊 *Resumo da semana, ${user.name}:*\n\n${list}\n\n✅ ${workouts.length} exercícios em ${days.length} dia(s)\n📅 ${days.join(", ")}`,
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
            `🗑️ Último registro deletado com sucesso, ${user.name}!`,
          );
        }
        return res.status(200).json({ ok: true });
      }

      // ── mudar nome ──
      if (parsed.action === "change_name") {
        const newName = parsed.name;
        await supabase
          .from("users")
          .update({ name: newName })
          .eq("phone", phone);
        await sendWhatsApp(
          phone,
          `✅ Pronto! Agora vou te chamar de *${newName}*. 😊`,
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
          `🤖 *Treino de ${parsed.muscle_group} para ${user.name}:*\n\n${suggestion}`,
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
