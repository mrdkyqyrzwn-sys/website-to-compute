const express = require('express');
const Replicate = require('replicate');
const app = express();

app.use(express.json());

// 1. זה מה שהלקוח רואה (HTML בעברית)
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>מערכת וידאו ללקוח</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f7f6; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
        .card { background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); width: 100%; max-width: 480px; text-align: center; }
        h1 { color: #2c3e50; margin-bottom: 30px; font-size: 24px; }
        .input-group { margin-bottom: 20px; text-align: right; }
        label { display: block; margin-bottom: 8px; font-weight: bold; color: #34495e; }
        input[type="password"], textarea { width: 100%; padding: 12px; border: 1px solid #bdc3c7; border-radius: 8px; box-sizing: border-box; font-size: 14px; transition: border-color 0.3s; }
        input:focus, textarea:focus { border-color: #3498db; outline: none; }
        button { background-color: #3498db; color: white; padding: 14px; border: none; border-radius: 8px; width: 100%; font-size: 16px; font-weight: bold; cursor: pointer; transition: background 0.3s; }
        button:hover { background-color: #2980b9; }
        button:disabled { background-color: #95a5a6; cursor: not-allowed; }
        .status { margin-top: 20px; font-size: 14px; color: #7f8c8d; }
        video { width: 100%; margin-top: 20px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
    </style>
</head>
<body>
    <div class="card">
        <h1>🎬 מחולל וידאו AI</h1>
        
        <div class="input-group">
            <label>🔑 מפתח API (מהלקוח):</label>
            <input type="password" id="apiKey" placeholder="הדבק כאן מפתח Replicate (r8_...)" />
        </div>

        <div class="input-group">
            <label>📝 תאור הסרטון (באנגלית):</label>
            <textarea id="prompt" rows="3" placeholder="למשל: A drone shot of a futuristic city..."></textarea>
        </div>

        <button onclick="generate()" id="btn">צור סרטון</button>
        
        <div id="status" class="status"></div>
        <div id="videoContainer"></div>
    </div>

    <script>
        async function generate() {
            const apiKey = document.getElementById('apiKey').value;
            const prompt = document.getElementById('prompt').value;
            const btn = document.getElementById('btn');
            const status = document.getElementById('status');
            const container = document.getElementById('videoContainer');

            if (!apiKey) return alert('נא להזין מפתח API');
            if (!prompt) return alert('נא לכתוב תיאור לסרטון');

            btn.disabled = true;
            btn.innerText = "מייצר סרטון... (2-3 דקות)";
            status.innerText = "שולח בקשה לשרת...";
            container.innerHTML = '';

            try {
                const response = await fetch('/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ apiKey, prompt })
                });

                const data = await response.json();

                if (data.error) throw new Error(data.error);

                status.innerText = "הסרטון מוכן!";
                container.innerHTML = '<video src="' + data.url + '" controls autoplay loop></video>';
                
            } catch (error) {
                status.innerText = "שגיאה: " + error.message;
                alert(error.message);
            } finally {
                btn.disabled = false;
                btn.innerText = "צור סרטון";
            }
        }
    </script>
</body>
</html>
  `);
});

// 2. זה המנוע שמדבר עם Replicate
app.post('/generate', async (req, res) => {
  try {
    const { apiKey, prompt } = req.body;
    const replicate = new Replicate({ auth: apiKey });

    // שימוש במודל Kling Pro (איכותי מאוד)
    const output = await replicate.run(
      "kwaivgi/kling-v1.6-pro",
      {
        input: {
          prompt: prompt,
          duration: 5
        }
      }
    );

    const videoUrl = Array.isArray(output) ? output[0] : output;
    res.json({ url: videoUrl });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const listener = app.listen(process.env.PORT, () => {
  console.log('App listening on port ' + listener.address().port);
});
