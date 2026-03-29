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

  if (data) {
    return { user: data, isNew: false };
  }

  const { data: newUser, error: insertError } = await supabase
    .from("users")
    .insert({ phone, active: true, awaiting_name: true })
    .select()
    .single();

  if (insertError) throw insertError;

  return { user: newUser, isNew: true };
}

async function updateUserName(phone, name) {
  await supabase.from("users").update({ name }).eq("phone", phone);
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

async function saveWorkout(phone, data) {
  await supabase.from("workouts").insert({
    user_phone: phone,
    exercise: data.exercise,
    sets: data.sets,
    reps: data.reps,
    weight_kg: data.weight_kg,
  });
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

async function askClaude(message, userName) {
  const greeting = userName ? `O nome do usuário é ${userName}.` : "";
  const response = await axios.post(
    "https://api.anthropic.com/v1/messages",
    {
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: `Você é um assistente de treino pessoal via WhatsApp. ${greeting}

Quando o usuário registrar um exercício, responda APENAS com JSON:
{"action":"save_workout","exercise":"nome do exercicio","sets":3,"reps":12,"weight_kg":25}

Quando perguntar sobre treino de hoje ou histórico geral, responda APENAS com:
{"action":"get_history","days_ago":0}

Quando perguntar sobre treino de ontem, responda APENAS com:
{"action":"get_history","days_ago":1}

Quando perguntar sobre um exercício específico de ontem ou outro dia (ex: "supino de ontem"), responda APENAS com:
{"action":"get_history","days_ago":1,"exercise":"supino"}

Quando o usuário quiser corrigir ou mudar seu nome, mesmo de forma indireta (ex: "meu nome não é X é Y", "me chama de X", "quero mudar meu nome para X", "pode me chamar de X", "meu nome é X!", "na verdade me chamo X", "errei, meu nome é X"), responda APENAS com JSON:
{"action":"change_name","name":"novo nome"}

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

async function sendWhatsApp(phone, message) {
  console.log(`Enviando para ${phone}: ${message}`);
  await axios.post(ZAPI_URL, { phone, message });
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
      await sendWhatsApp(phone, `Olá! 👋 Eu sou seu assistente de treino pessoal.\n\nAntes de começar, como você quer ser chamado?`);
      return res.status(200).json({ ok: true });
    }

    if (user.awaiting_name && !user.name) {
      const name = message.split(" ")[0];
      await supabase.from("users").update({ name, awaiting_name: false }).eq("phone", phone);
      await sendWhatsApp(phone, `Perfeito, *${name}*! 💪\n\nAgora eu vou te ajudar a registrar e acompanhar seus treinos.\n\nVocê pode fazer várias coisas comigo 👇\n\n🏋️ *Registrar treino*\nExemplo: "supino 3x12 25kg"\n\n📊 *Ver treinos anteriores*\nEx: "o que treinei hoje?"\nEx: "treino de ontem"\nEx: "último supino"\n\n🤖 *Receber sugestão de treino*\nEx: "me recomenda um treino de peito"\n\n💡 Pode mandar mensagem do jeito que quiser — eu entendo 😉\n\nBora treinar! 🚀`);
      return res.status(200).json({ ok: true });
    }

    const reply = await askClaude(message, user.name);

    try {
      const parsed = JSON.parse(reply);

      if (parsed.action === "save_workout") {
        const history = await getWorkoutHistory(phone, parsed.exercise);
        await saveWorkout(phone, parsed);

        let msg = `✅ *${parsed.exercise}* salvo, ${user.name}!\n${parsed.sets}x${parsed.reps} @ ${parsed.weight_kg}kg`;

        if (history.length > 0) {
          const lastWeight = history[0].weight_kg;
          const maxWeight = Math.max(...history.map((w) => w.weight_kg));
          const last3 = history.slice(0, 3);
          const avgLast3 = last3.reduce((sum, w) => sum + w.weight_kg, 0) / last3.length;
          const diff = parsed.weight_kg - lastWeight;

          if (parsed.weight_kg > maxWeight) {
            msg += `\n\n🏆 *PR BATIDO!* Seu recorde anterior era ${maxWeight}kg. Novo recorde: ${parsed.weight_kg}kg!`;
          } else if (last3.length >= 3 && parsed.weight_kg > avgLast3) {
            msg += `\n\n🔥 Acima da sua média dos últimos 3 treinos (${avgLast3.toFixed(1)}kg). Continue assim!`;
          } else if (diff > 0) {
            msg += `\n\n📈 Subiu ${diff}kg desde o último treino!`;
          } else if (diff < 0) {
            msg += `\n\n📉 Desceu ${Math.abs(diff)}kg desde o último treino.`;
          } else {
            msg += `\n\n➡️ Mesma carga do último treino.`;
          }

          if (history.length >= 3) {
            msg += `\n💪 ${history.length} registros de ${parsed.exercise} no histórico.`;
          }
        } else {
          msg += `\n\n🆕 Primeiro registro desse exercício! Referência criada.`;
        }

        await sendWhatsApp(phone, msg);
        return res.status(200).json({ ok: true });
      }

      if (parsed.action === "get_history") {
        const daysAgo = parsed.days_ago || 0;
        const workouts = await getWorkoutsByDate(phone, parsed.exercise || null, daysAgo);
        const label = daysAgo === 0 ? "hoje" : daysAgo === 1 ? "ontem" : `${daysAgo} dias atrás`;

        if (!workouts.length) {
          await sendWhatsApp(phone, `Nenhum exercício registrado ${label}, ${user.name}. 💪`);
        } else {
          const list = workouts.map((w, i) => `${i + 1}. *${w.exercise}* — ${w.sets}x${w.reps} @ ${w.weight_kg}kg`).join("\n");
          await sendWhatsApp(phone, `🏋️ *Treino de ${label}, ${user.name}:*\n\n${list}`);
        }
        return res.status(200).json({ ok: true });
      }

      if (parsed.action === "change_name") {
        const newName = parsed.name;
        await supabase.from("users").update({ name: newName }).eq("phone", phone);
        await sendWhatsApp(phone, `✅ Pronto! Agora vou te chamar de *${newName}*. 😊`);
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
