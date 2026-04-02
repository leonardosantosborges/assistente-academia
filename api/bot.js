const axios = require("axios");
const fs = require("fs");
const os = require("os");
const path = require("path");
const FormData = require("form-data");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const { createClient } = require("@supabase/supabase-js");

ffmpeg.setFfmpegPath(ffmpegPath);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

const ZAPI_URL = `https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE_ID}/token/${process.env.ZAPI_TOKEN}/send-text`;

const DAY_NAMES = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

const {
  normalizeExercise,
  getMuscleGroup,
  getSuggestions,
} = require("../utils/exercises");

// --- FUNÇÕES DE APOIO ---

async function isDuplicateWebhook(messageId) {
  if (!messageId) return false;

  console.log("[SUPABASE] Tentando inserir ID:", messageId);

  const { error } = await supabase
    .from("webhook_logs")
    .insert([{ id: String(messageId) }]);

  if (error) {
    if (error.code === "23505") {
      console.log("[SUPABASE] Duplicata detectada.");
      return true;
    }
    console.error("[SUPABASE] Erro inesperado:", JSON.stringify(error));
    return false;
  }

  console.log("[SUPABASE] ID inserido com sucesso.");
  return false;
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

function getIncomingText(reqBody) {
  return reqBody?.text?.message?.trim() || null;
}

function getAudioUrl(reqBody) {
  return (
    reqBody?.audio?.audioUrl ||
    reqBody?.audio?.url ||
    reqBody?.message?.audio?.url ||
    reqBody?.message?.audioUrl ||
    reqBody?.voice?.url ||
    reqBody?.file?.url ||
    null
  );
}

function isAudioMessage(reqBody) {
  const type = String(reqBody?.type || reqBody?.messageType || "").toLowerCase();
  return type.includes("audio") || !!getAudioUrl(reqBody);
}

function inferAudioExtension(url) {
  const cleanUrl = String(url || "").split("?")[0].toLowerCase();
  if (cleanUrl.endsWith(".mp3")) return "mp3";
  if (cleanUrl.endsWith(".wav")) return "wav";
  if (cleanUrl.endsWith(".mpeg")) return "mpeg";
  if (cleanUrl.endsWith(".mpga")) return "mpga";
  if (cleanUrl.endsWith(".m4a")) return "m4a";
  if (cleanUrl.endsWith(".webm")) return "webm";
  if (cleanUrl.endsWith(".mp4")) return "mp4";
  return "ogg";
}

async function downloadAudioFile(url) {
  const extension = inferAudioExtension(url);
  const tempFilePath = path.join(os.tmpdir(), `fitlog-audio-${Date.now()}.${extension}`);

  const response = await axios({
    method: "GET",
    url,
    responseType: "stream",
    headers: { "Client-Token": process.env.ZAPI_CLIENT_TOKEN?.trim() },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  await new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(tempFilePath);
    response.data.pipe(writer);
    writer.on("finish", resolve);
    writer.on("error", reject);
  });

  return tempFilePath;
}

function convertToMp3(inputPath) {
  const outputPath = path.join(os.tmpdir(), `fitlog-audio-${Date.now()}.mp3`);
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioCodec("libmp3lame")
      .format("mp3")
      .on("end", () => resolve(outputPath))
      .on("error", reject)
      .save(outputPath);
  });
}

async function prepareAudioForTranscription(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".ogg") return await convertToMp3(filePath);
  return filePath;
}

async function transcribeAudio(filePath) {
  try {
    const preparedFilePath = await prepareAudioForTranscription(filePath);
    const form = new FormData();
    form.append("file", fs.createReadStream(preparedFilePath), {
      filename: path.basename(preparedFilePath),
    });
    form.append("model", "whisper-1");
    form.append("language", "pt");

    const response = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${process.env.OPENAI_API_KEY_V2}`,
        },
        maxContentLength: 25 * 1024 * 1024,
        maxBodyLength: 25 * 1024 * 1024,
      },
    );

    return { text: response.data?.text?.trim() || "", preparedFilePath };
  } catch (err) {
    console.error("❌ ERRO OPENAI WHISPER:", err.response?.status || err.message);
    throw err;
  }
}

async function getMessageFromWebhook(reqBody) {
  const textMessage = getIncomingText(reqBody);
  if (textMessage) return { message: textMessage, source: "text", transcription: null, error: null };

  if (isAudioMessage(reqBody)) {
    const audioUrl = getAudioUrl(reqBody);
    if (!audioUrl) return { message: null, source: "audio", transcription: null, error: "Sem URL." };

    const originalFilePath = await downloadAudioFile(audioUrl);
    let preparedFilePath = null;
    try {
      const result = await transcribeAudio(originalFilePath);
      preparedFilePath = result.preparedFilePath;
      return { message: result.text, source: "audio", transcription: result.text, error: null };
    } finally {
      try { if (fs.existsSync(originalFilePath)) fs.unlinkSync(originalFilePath); } catch {}
      try { if (preparedFilePath && fs.existsSync(preparedFilePath)) fs.unlinkSync(preparedFilePath); } catch {}
    }
  }
  return { message: null, source: "unknown", transcription: null, error: null };
}

// --- FUNÇÕES DB --- (Mantidas conforme seu código original)
async function getOrCreateUser(phone) {
  const { data, error } = await supabase.from("users").select("*").eq("phone", phone).maybeSingle();
  if (error) throw error;
  if (data) return { user: data, isNew: false };
  const { data: newUser, error: insertError } = await supabase.from("users").insert({ phone, active: true, awaiting_name: true }).select().single();
  if (insertError) throw insertError;
  return { user: newUser, isNew: true };
}
async function getWorkoutHistory(phone, exercise) {
  const { data } = await supabase.from("workouts").select("*").eq("user_phone", phone).ilike("exercise", `%${normalizeExercise(exercise)}%`).order("created_at", { ascending: false }).limit(10);
  return data || [];
}
async function getLastWorkoutAny(phone, exercise) {
  const { data } = await supabase.from("workouts").select("*").eq("user_phone", phone).ilike("exercise", `%${normalizeExercise(exercise)}%`).order("created_at", { ascending: false }).limit(1);
  return data?.[0] || null;
}
async function getPersonalRecord(phone, exercise) {
  const { data } = await supabase.from("workouts").select("*").eq("user_phone", phone).ilike("exercise", `%${normalizeExercise(exercise)}%`).order("weight_kg", { ascending: false }).limit(1);
  return data?.[0] || null;
}
async function getBestExercise(phone) {
  const { data } = await supabase.from("workouts").select("exercise, weight_kg").eq("user_phone", phone).not("weight_kg", "is", null).order("weight_kg", { ascending: false }).limit(5);
  return data || [];
}
async function saveWorkout(phone, data, daysAgo = 0) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(12, 0, 0, 0);
  const ne = normalizeExercise(data.exercise);
  await supabase.from("workouts").insert({ user_phone: phone, exercise: ne, sets: data.sets, reps: data.reps, weight_kg: data.weight_kg || null, notes: data.notes || null, gym: data.gym || null, muscle_group: getMuscleGroup(ne), created_at: daysAgo > 0 ? date.toISOString() : undefined });
}
async function saveMultipleWorkouts(phone, workouts, daysAgo = 0, gym = null) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(12, 0, 0, 0);
  const rows = workouts.map((w) => {
    const ne = normalizeExercise(w.exercise);
    return { user_phone: phone, exercise: ne, sets: w.sets, reps: w.reps, weight_kg: w.weight_kg || null, gym: w.gym || gym || null, muscle_group: getMuscleGroup(ne), created_at: daysAgo > 0 ? date.toISOString() : undefined };
  });
  await supabase.from("workouts").insert(rows);
}
async function getLastSessionByMuscleGroup(phone, muscleGroup) {
  const { data } = await supabase.from("workouts").select("*").eq("user_phone", phone).ilike("muscle_group", `%${muscleGroup}%`).order("created_at", { ascending: false }).limit(10);
  if (!data?.length) return [];
  const lastDate = new Date(data[0].created_at).toDateString();
  return data.filter((w) => new Date(w.created_at).toDateString() === lastDate);
}
async function getWorkoutsByGym(phone, gym, exercise) {
  let query = supabase.from("workouts").select("*").eq("user_phone", phone).ilike("gym", `%${gym}%`).order("created_at", { ascending: false });
  if (exercise) query = query.ilike("exercise", `%${normalizeExercise(exercise)}%`);
  const { data } = await query;
  return data || [];
}
async function getPRByGym(phone, exercise, gym) {
  const { data } = await supabase.from("workouts").select("*").eq("user_phone", phone).ilike("exercise", `%${normalizeExercise(exercise)}%`).ilike("gym", `%${gym}%`).not("weight_kg", "is", null).order("weight_kg", { ascending: false }).limit(1);
  return data?.[0] || null;
}
async function deleteLastWorkout(phone, exercise) {
  let q = supabase.from("workouts").select("id, exercise").eq("user_phone", phone).order("created_at", { ascending: false }).limit(1);
  if (exercise) q = q.ilike("exercise", `%${normalizeExercise(exercise)}%`);
  const { data } = await q;
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
  let q = supabase.from("workouts").select("*").eq("user_phone", phone).order("created_at", { ascending: false }).limit(1);
  if (exercise) q = q.ilike("exercise", `%${normalizeExercise(exercise)}%`);
  const { data } = await q;
  if (!data?.length) return null;
  const current = data[0];
  const fields = { sets: newData.sets ?? current.sets, reps: newData.reps ?? current.reps, weight_kg: newData.weight_kg !== undefined ? newData.weight_kg || null : current.weight_kg };
  if (newData.new_exercise) {
    const ne = normalizeExercise(newData.new_exercise);
    fields.exercise = ne;
    fields.muscle_group = getMuscleGroup(ne);
  }
  await supabase.from("workouts").update(fields).eq("id", current.id);
  return { ...current, ...fields };
}
async function updateWorkoutById(id, newData) {
  const { data: current } = await supabase.from("workouts").select("*").eq("id", id).single();
  if (!current) return null;
  const fields = { sets: newData.sets ?? current.sets, reps: newData.reps ?? current.reps, weight_kg: newData.weight_kg !== undefined ? newData.weight_kg || null : current.weight_kg };
  if (newData.new_exercise) {
    const ne = normalizeExercise(newData.new_exercise);
    fields.exercise = ne;
    fields.muscle_group = getMuscleGroup(ne);
  }
  await supabase.from("workouts").update(fields).eq("id", id);
  return { ...current, ...fields };
}
async function getWorkoutsByDate(phone, exercise, daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const start = date.toISOString().split("T")[0];
  const end = new Date(date.getTime() + 86400000).toISOString().split("T")[0];
  let q = supabase.from("workouts").select("*").eq("user_phone", phone).gte("created_at", `${start}T00:00:00`).lt("created_at", `${end}T00:00:00`).order("created_at", { ascending: true });
  if (exercise) q = q.ilike("exercise", `%${normalizeExercise(exercise)}%`);
  const { data } = await q;
  return data || [];
}
async function getWeeklySummary(phone) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const { data } = await supabase.from("workouts").select("*").eq("user_phone", phone).gte("created_at", weekAgo.toISOString()).order("created_at", { ascending: true });
  return data || [];
}
async function getTodayHydration(phone) {
  const today = new Date().toISOString().split("T")[0];
  const { data } = await supabase.from("hydration").select("*").eq("user_phone", phone).eq("date", today).order("created_at", { ascending: true });
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

// --- CLAUDE ---
async function askClaude(message, userName, recentHistory) {
  const greeting = userName ? `O nome do usuário é ${userName}.` : "";
  const historyContext = recentHistory?.length ? `Exercícios de hoje: ${recentHistory.slice(0, 3).map(w => `${w.exercise} ${w.sets}x${w.reps}${w.weight_kg ? ` ${w.weight_kg}kg` : ""}`).join(", ")}` : "";
  const response = await axios.post("https://api.anthropic.com/v1/messages", {
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: `Você é um assistente de treino pessoal via WhatsApp. ${greeting} ${historyContext}\nVocê APENAS entende sobre treinos e academia. IMPORTANTE: Responda SOMENTE com JSON puro para ações.`,
    messages: [{ role: "user", content: message }],
  }, { headers: { "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" } });
  return response.data.content[0].text.replace(/```json\n?/gi, "").replace(/```\n?/gi, "").trim();
}

async function askClaudeSuggest(muscleGroup, history, userName) {
  const response = await axios.post("https://api.anthropic.com/v1/messages", {
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system: `Você é um personal trainer. Monte um treino de ${muscleGroup} curto.`,
    messages: [{ role: "user", content: `Treino para ${userName}` }],
  }, { headers: { "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" } });
  return response.data.content[0].text;
}

// --- WHATSAPP UTILS ---
async function sendWhatsApp(phone, message) {
  await axios.post(ZAPI_URL, { phone, message }, { headers: { "Client-Token": process.env.ZAPI_CLIENT_TOKEN?.trim() } });
}
function formatWorkout(w, index) {
  const weight = w.weight_kg ? ` - ${w.weight_kg}kg` : "";
  const num = index !== undefined ? `${index + 1}. ` : "";
  return `${num}*${w.exercise}* - ${w.sets}x${w.reps}${weight}`;
}
function formatWaterBar(totalMl, goalMl) {
  const pct = goalMl > 0 ? Math.min(Math.round((totalMl / goalMl) * 100), 100) : 0;
  const filled = Math.round(pct / 10);
  return `${"🟦".repeat(filled)}${"⬜".repeat(10 - filled)} ${pct}%`;
}

// --- HANDLER PRINCIPAL ---
module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const messageId = req.body.messageId || req.body.baileysId || req.body.data?.messageId || (req.body.audio?.url ? req.body.audio.url.split("/").pop() : null);
  const phone = req.body.phone || req.body.data?.phone;

  console.log(`[DEBUG] Webhook ID: ${messageId} | Phone: ${phone}`);

  if (await isDuplicateWebhook(messageId)) {
    return res.status(200).json({ ok: true, info: "Already processed" });
  }

  console.log("Whisper Key V2 Check:", !!process.env.OPENAI_API_KEY_V2);

  try {
    const incoming = await getMessageFromWebhook(req.body);
    const message = incoming.message?.trim();

    if (!message) {
      if (incoming.source === "audio") {
        await sendWhatsApp(phone, incoming.error || "Não entendi o áudio 🙏");
      }
      return res.status(200).json({ ok: true });
    }

    const { user, isNew } = await getOrCreateUser(phone);

    if (incoming.source === "audio" && incoming.transcription) {
      await sendWhatsApp(phone, `🎧 Entendi:\n"${message}"`);
    }

    if (isNew) {
      await sendWhatsApp(phone, `Olá! 👋 Como você quer ser chamado?`);
      return res.status(200).json({ ok: true });
    }

    if (user.awaiting_name && !user.name) {
      const name = message.split(" ")[0];
      await supabase.from("users").update({ name, awaiting_name: false }).eq("phone", phone);
      await sendWhatsApp(phone, `Perfeito, ${name}! 💪 Bora treinar!`);
      return res.status(200).json({ ok: true });
    }

    const recentHistory = await getWorkoutsByDate(phone, null, 0);
    const reply = await askClaude(message, user.name, recentHistory);
    const parsed = extractJsonObject(reply);
    const plainReply = removeJsonFromText(reply);

    if (!parsed) {
      await sendWhatsApp(phone, plainReply || "Não entendi 💪");
      return res.status(200).json({ ok: true });
    }

    const daysAgo = parsed.days_ago || 0;

    // AÇÕES
    if (parsed.action === "get_name") {
      await sendWhatsApp(phone, user.name ? `Seu nome é *${user.name}*` : "Não sei seu nome.");
    } else if (parsed.action === "save_workout") {
      await saveWorkout(phone, parsed, daysAgo);
      await sendWhatsApp(phone, `✅ *${parsed.exercise}* salvo, ${user.name}!`);
    } else if (parsed.action === "get_history") {
      const workouts = await getWorkoutsByDate(phone, parsed.exercise, daysAgo);
      const list = workouts.map((w, i) => formatWorkout(w, i)).join("\n");
      await sendWhatsApp(phone, list || "Nenhum treino.");
    } else if (parsed.action === "get_weekly_summary") {
      const workouts = await getWeeklySummary(phone);
      await sendWhatsApp(phone, `Semana: ${workouts.length} exercícios.`);
    } else if (parsed.action === "log_water") {
      await addHydration(phone, parsed.amount_ml);
      const total = await getTotalHydrationToday(phone);
      await sendWhatsApp(phone, `💧 +${parsed.amount_ml}ml! Total: ${total}ml`);
    } else {
      await sendWhatsApp(phone, plainReply || "Processado 💪");
    }

  } catch (err) {
    console.error("Erro Final:", err.message);
    if (phone) await sendWhatsApp(phone, "Tive um problema agora. Tente de novo 🙏");
  }

  return res.status(200).json({ ok: true });
};