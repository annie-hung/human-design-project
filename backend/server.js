// server.js
const express = require('express');
const cors    = require('cors');
const OpenAI  = require('openai');
require('dotenv').config();

const app = express();
app.use(cors({ origin: 'https://annie-hung.github.io' })); // 正式上線請改成你的 GitHub Pages 網址
app.use(express.json());

const client = new OpenAI({
  apiKey:  process.env.GEMINI_API_KEY,      
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/', 
});

app.post('/api/human-design', async (req, res) => {
  const { name, year, month, day, hour, minute, city } = req.body;

  // 基本驗證
  if (!year || !month || !day || !hour || !minute || !city) {
    return res.status(400).json({ error: '請完整填寫所有欄位' });
  }

  const prompt = `
    你是人類圖解讀師。請根據以下出生資料，用繁體中文提供簡短但專業的人類圖分析。
    姓名：${name}
    出生：${year}年${month}月${day}日 ${String(hour).padStart(2,'0')}:${minute}
    出生地：台灣 ${city}

    請用 JSON 格式回答，包含以下欄位（每欄位不超過 40 字）：
    {
      "name": "稱呼",
      "birthInfo": "出生資訊摘要",
      "type": "能量類型",
      "authority": "內在權威說明",
      "profile": "人生角色",
      "notSelf": "非我主題",
      "advice": "個人核心建議"
    }
    只回傳 JSON，不要其他文字。
  `;

  try {
    const response = await client.chat.completions.create({
      model: 'sonar-pro',
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = response.choices[0].message.content.trim();
    // 解析 AI 回傳的 JSON
    const result = JSON.parse(raw);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI 分析失敗，請稍後再試' });
  }
});

app.get('/', (req, res) => res.send('Human Design API is running ✦'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
