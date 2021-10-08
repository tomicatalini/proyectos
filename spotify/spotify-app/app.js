const express = require('express');
const request = require('request');
const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');

const app = express();
//SETTINGS
app.set('port', 3000);

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());


const spotifyClientId = 'f86de6d8a82e43d499d86dc1ad93b483';
const spotifyClientSecret = '99cc9f4e02434fd7b176132f505766b2';
const spotifyRedirectUri = 'http://localhost:3000/callback';

let stateKey = 'spotifyAuthState';

app.get('/login', (req, res) => {
    let spotifyScopes = 'user-read-private user-read-email';
    let spotifyState = generateRandomString(16);
    res.cookie(stateKey, spotifyState);

    res.redirect('https://accounts.spotify.com/authorize?' +
                    querystring.stringify({
                        response_type: 'code',
                        client_id: spotifyClientId,
                        scope: spotifyScopes,
                        redirect_uri: spotifyRedirectUri,
                        state: spotifyState
                    }));
});

app.get('/callback', (req, res) => {

    let spotifyCode = req.query.code || null;
    let spotifyState = req.query.state || null;
    let spotifyStoredState = req.cookies ? req.cookies[stateKey] : null;

    if(spotifyCode === null || spotifyState !== spotifyStoredState){
        console.log('Error');
    } else {
        let spotifyUrl = 'https://accounts.spotify.com/api/token';
        const spotifyAuthoForm = {
            url: spotifyUrl,
            form: {
                grant_type: 'authorization_code',
                code: spotifyCode,
                redirect_uri: spotifyRedirectUri
            },
            headers: {
                'Authorization': 'Basic ' + (new Buffer(spotifyClientId + ':' + spotifyClientSecret).toString('base64'))
            },
            json: true
        };

        request.post(spotifyAuthoForm, (error, response, body) => {
            if(error){
                console.log('Se pudrio la momia: ', error);
            } else {
                var spotifyAccessToken = body.access_token,
                    spotifyRefreshToken = body.refresh_token;
                
                const opcionesUserInfo = {
                    url: 'https://api.spotify.com/v1/me',
                    headers: { 'Authorization': 'Bearer ' + spotifyAccessToken},
                    json: true
                }

                request.get(opcionesUserInfo, (error, response, body) => {
                    console.log(body);
                })
            
                res.redirect(`/refresh_token/:${spotifyRefreshToken}`);
            }
        });

        
    } 
});

app.get('/refresh_token/:refresh_token', (req, res) => {
    let refresh_token_algo = req.params.refresh_token.substring(1);
    let spotifyUrl = 'https://accounts.spotify.com/api/token';
    const spotifyAuthoForm = {
        url: spotifyUrl,
        form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token_algo
        },
        headers: {
            'Authorization': 'Basic ' + (new Buffer(spotifyClientId + ':' + spotifyClientSecret).toString('base64'))
        },
        json: true
    };
    request.post(spotifyAuthoForm, (error, response, body) => {
        console.log(body);
    })
});



console.log(`Server activo en el puerto ${app.get('port')}`);
app.listen(app.get('port'));

//FUNCIONES RANDOM

var generateRandomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };