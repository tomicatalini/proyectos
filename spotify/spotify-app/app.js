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

//GlOBAL VARIABLES
const spotifyClientId = 'f86de6d8a82e43d499d86dc1ad93b483';
const spotifyClientSecret = '99cc9f4e02434fd7b176132f505766b2';
const spotifyRedirectUri = 'http://localhost:3000/callback';
let stateKey = 'spotifyAuthState';

//ROUTS
app.get('/', () => {
    res.redirect('/public/index.html');
});

app.get('/login', (req, res) => {
    let spotifyScopes = 'user-read-private user-read-email user-library-read user-modify-playback-state';
    let spotifyState = generateRandomString(16);
    res.cookie(stateKey, spotifyState);

    console.log(querystring.stringify({
        response_type: 'code',
        client_id: spotifyClientId,
        scope: spotifyScopes,
        redirect_uri: spotifyRedirectUri,
        state: spotifyState
    }));

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
                // let spotifyAccessToken =  body.access_token;
                // let spotifyRefreshToken = body.refresh_token;
                
                let data = {
                    access_token: body.access_token,
                    refresh_token: body.refresh_token};

                console.log(data.access_token);
                
                res.redirect('http://localhost:3000/index.html#' + querystring.stringify(data));

                // const opcionesUserInfo = {
                //     url: 'https://api.spotify.com/v1/me',
                //     headers: { 'Authorization': 'Bearer ' + spotifyAccessToken},
                //     json: true
                // }

                // request.get(opcionesUserInfo, (error, response, body) => { 
                //     //console.log(body);
                // });
            
                //res.redirect(`/refresh_token/:${spotifyRefreshToken}`);
                // res.redirect(`/userAlbums/:${spotifyAccessToken}`);
                
            }
        });

        
    } 
});

/**
 * Resfrescar token
 */
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
        //console.log(body);
    })
});

app.get('/index.html', (req, res) => {
    res.redirect('/currentTrack/:' + req.params.access_token);
});

/**
 * 
 */
 app.get('/currentTrack/:access_token', (req,res) => {
    console.log('obtener current song');
    
    let spotifyAccessToken = req.params.access_token.substring(1);
    
    const opcionesUserInfo = {
        url: 'https://api.spotify.com/v1/me/player',
        headers: { 'Authorization': 'Bearer ' + spotifyAccessToken},
        json: true
    }

    request.get(opcionesUserInfo, (error, response, body) => {
        if(error){
            console.log(error);
            res.send(error);
        } else {
            res.redirect('index.html');
        }
    })
});
/**
 * 
 */
 app.get('/anterior/:access_token', (req,res) => {
    console.log(' **** Cambiar anterior cancion ****');
    
    let spotifyAccessToken = req.params.access_token.substring(1);
    
    const opcionesUserInfo = {
        url: 'https://api.spotify.com/v1/me/player/previous',
        headers: { 'Authorization': 'Bearer ' + spotifyAccessToken},
        json: true
    }

    request.post(opcionesUserInfo, (error, response, body) => {
        if(error){
            console.log(error);
            res.send(error);
        } else {
            res.redirect()
        }
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