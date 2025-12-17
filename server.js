const express = require('express');
const Replicate = require('replicate');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>מערכת וידאו ללקוח</title>
    <style>
        body { font-family: sans-serif; background: #f0f2f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
        .card { background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); width: 100%; max-width: 500px; text-align: center; }
        h1 { color: #333; margin-bottom: 20px; }
        .input-group { margin-bottom: 15px; text-align: right; }
        label { font-size: 14px; font-weight: bold; display: block; margin-bottom: 5px; }
        input, textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; }
        button { background: #007bff; color: white; border: none; padding: 12px; width: 100%; border-radius: 5px; font-size: 16px; cursor: pointer; font-weight: bold; }
        button:disabled { background: #ccc; }
        .status { margin-top: 15px; font-size: 14px; color: #666; }
        video { width: 100%; margin-top: 20px; border-radius: 10px; }
    </style>
</head>
<body>
    <div class="card">
        <h1>🎬 יצירת סרטון AI</h1>
        
        <div class="input-group" style="background: #e9f5ff; padding: 10px; border-radius: 8px;">
            <label>🔑 מפתח API (שלך):</label>
            <input type="password" id="apiKey" placeholder="הדבק כאן את ה-Key מ-Replicate">
        </div>

        <div class="input-group">
            <label>📝 תאור הסרטון (באנגלית):</label>
            <textarea id="prompt" rows="3" placeholder="A cinematic drone shot of a beach..."></textarea>
        </div>

        <button onclick="generate()" id="btn">צור סרטון</button>
        <div id="status" class="status"></div>
        <div id="videoArea"></div>
    </div>

    <script>
        async function generate() {
            const apiKey = document.getElementById('apiKey').value;
            const prompt = document.getElementById('prompt').value;
            const btn = document.getElementById('btn');
            const status = document.getElementById('status');
            
            if(!apiKey || !prompt) return alert('נא למלא מפתח ותיאור');

            btn.disabled = true;
            btn.innerText = 'מייצר סרטון... (המתן כ-2 דקות)';
            status.innerText = 'שולח בקשה לשרת...';
            
            try {
                const res = await fetch('/api/run', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ apiKey, prompt })
                });
                
                const data = await res.json();
                if(data.error) throw new Error(data.error);
                
                status.innerText = 'הסרטון מוכן!';
                document.getElementById('videoArea').innerHTML = '<video src="'+data.url+'" controls autoplay loop></video>';
            } catch(e) {
                status.innerText = 'שגיאה: ' + e.message;
            } finally {
                btn.disabled = false;
                btn.innerText = 'צור סרטון';
            }
        }
    </script>
</body>
</html>
  `);
});

app.post('/api/run', async (req, res) => {
  try {
    const replicate = new Replicate({ auth: req.body.apiKey });
    const output = await replicate.run(
      "kwaivgi/kling-v1.6-pro",
      { input: { prompt: req.body.prompt, duration: 5 } }
    );
    const url = Array.isArray(output) ? output[0] : output;
    res.json({ url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const listener = app.listen(process.env.PORT, () => {
  console.log('Server started');
});
