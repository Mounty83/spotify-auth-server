require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const qs = require("querystring");

const app = express();
const PORT = process.env.PORT || 8888;

app.use(cors({
    origin: "*", 
  }));
  
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

app.get("/login", (req, res) => {
  const scopes = [
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing",
    "playlist-read-private"
  ];

  const url = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=${encodeURIComponent(scopes.join(" "))}&show_dialog=true`;

  res.redirect(url);
});

app.get("/callback", async (req, res) => {
  const code = req.query.code;

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      qs.stringify({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const access_token = response.data.access_token;

    res.send(`
        <html>
          <body style="background:#111;color:#fff;font-family:sans-serif;text-align:center;padding-top:80px">
            <h2>✅ Connexion réussie !</h2>
            <p>Tu peux maintenant retourner dans Nexyo.</p>
            <script>
  // Envoie le token à la fenêtre d’origine (Nexyo)
  window.opener.postMessage(
    { spotify_token: '${access_token}' },
    '*'
  );
  setTimeout(() => {
    window.close();
  }, 1000);
</script>
          </body>
        </html>
      `);
      
      
  } catch (err) {
    console.error("Erreur dans /callback :", err.response?.data || err.message);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Serveur Spotify Auth lancé sur le port ${PORT}`);
});
