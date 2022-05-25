require('dotenv').config();
const express = require('express');
const spotifywebapi = require('spotify-web-api-node');
const cors = require('cors');
const app = express();
const router = express.Router();
const serverless = require('serverless-http');
app.use(express.json());
app.use(cors());
const spotify = new spotifywebapi({
  redirectUri: process.env.REDIRECT_LINK,
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET_ID,
});
let accessToken;

app.post('/login', async (req, res) => {
  const code = req.body.code;

  await spotify
    .authorizationCodeGrant(code)
    .then(data => {
      accessToken = data.body.access_token;

      res.json({
        accesstoken: data.body.access_token,
        refreshToken: data.body.refresh_token,
        expiresin: data.body.expires_in,
      });
    })
    .catch(err => {
      // console.log(err);
      // res.send(err);
      res.sendStatus(404);
    });
  console.log(accessToken);
  spotify.setAccessToken(accessToken);
});

app.post('/refresh', (req, res) => {
  const refreshToken = req.body.refreshToken;
  const spotifyApi = new spotifywebapi({
    redirectUri: process.env.REDIRECT_LINK,
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET_ID,
    refreshToken,
  });

  spotifyApi
    .refreshAccessToken()
    .then(data => {
      res.json({
        accessToken: data.body.access_token,
        expiresIn: data.body.expires_in,
      });
    })
    .catch(err => {
      console.log(err);
      res.sendStatus(400);
    });
});
async function searchArtist(artist) {
  const res = await spotify.searchArtists(artist, { limit: 1 });
  // console.table(res.body.artists.items);
  const albums = await spotify.getArtistAlbums(res.body.artists.items[0].id);
  console.log(albums.body.items);
  return albums.body.items;
}
app.post('/', (req, res) => {
  req.body.search.forEach(item => searchArtist(item));
});
// app.listen(3001, console.log('listening on port 3001'));
app.listen(process.env.PORT || 5000);
// module.exports = app;
// module.exports.handler = serverless(app);
