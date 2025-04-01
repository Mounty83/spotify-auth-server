// spotify-auth-server.js – version Render
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

require("dotenv").config();
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

app.get("/login", (req, res) => {
  const scope = [
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing",
    "playlist-read-private"
  ].join(" ");

  const authUrl = "https://accounts.spotify.com/authorize?" +
    new URLSearchParams({
      response_type: "code",
      client_id,
      scope,
      redirect_uri,
    }).toString();

  res.redirect(authUrl);
});

app.get("/callback", async (req, res) => {
  const code = req.query.code || null;

  try {
    const tokenRes = await axios.post("https://accounts.spotify.com/api/token", new URLSearchParams({
      code,
      redirect_uri,
      grant_type: "authorization_code"
    }), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + Buffer.from(client_id + ":" + client_secret).toString("base64")
      }
    });

    const { access_token, refresh_token } = tokenRes.data;

    res.redirect(`https://nexyo-app.onrender.com/?access_token=${access_token}`);

  } catch (err) {
    console.error("Erreur lors du callback Spotify :", err.message);
    res.status(500).send("Erreur lors de l'authentification avec Spotify.");
  }
});

const PORT = process.env.PORT || 8888;

app.listen(PORT, () => {
  console.log(`✅ Serveur Spotify Auth lancé sur le port ${PORT}`);
});

