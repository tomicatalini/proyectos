const express = require('express');
const request = require('request');
const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
// const { query } = require('express');

const app = express();
//SETTINGS
app.set('port', 3000);

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser())
   .use(express.json())
   .use(express.urlencoded({ extended: true }));

//GlOBAL VARIABLES
const client_id = 'f86de6d8a82e43d499d86dc1ad93b483';
const client_secret = '99cc9f4e02434fd7b176132f505766b2';
const redirect_uri = 'http://localhost:3000/callback';
let state_key = 'spotifyAuthState';

//ROUTS
app.get('/', (req, res) => {
    console.log('raiz');   
});

app.get('/index.html', (req, res) => {
    console('/index.html');
});

app.get('/login', (req, res) => {
    console.log('/login');

    let scopes = 'user-read-private user-read-email ' //user info
                        + 'user-read-playback-state user-modify-playback-state user-read-currently-playing ' //Spotify Conect
                        + 'playlist-read-private playlist-read-collaborative';
    let state = generateRandomString(16);
    
    res.cookie(state_key, state);

    let params = {
        response_type: 'code',
        client_id: client_id,
        scope: scopes,
        redirect_uri: redirect_uri,
        state: state
    };

    res.redirect('https://accounts.spotify.com/authorize?' + querystring.stringify(params));
});

/*
 * 
 */
app.get('/callback', (req, res) => {    
    console.log('/callback');
    let code = req.query.code || null;
    let state = req.query.state || null;
    let stored_state = req.cookies ? req.cookies[state_key] : null;

    if(code === null || state !== stored_state){
        console.log('Error');
    } else {
        res.clearCookie(state_key);
        let spotifyUrl = 'https://accounts.spotify.com/api/token';
        
        const reqInfo = {
            url: spotifyUrl,
            form: {
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirect_uri
            },
            headers: {
                'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
            },
            json: true
        };

        request.post(reqInfo, (error, response, body) => {
            const data = {}
            if(!error && response.statusCode){
                app.locals.access_token = body.access_token;
                app.locals.refresh_token = body.refresh_token;
                
                data.status = response.statusCode;                
            } else {                
                console.log('Se pudrio la momia: ', error);
                data.server_status = 'ERROR';
                console.log(error);
            }

            res.redirect('http://localhost:3000/index.html#' + querystring.stringify(data));
        });        
    } 
});

app.get('/me/profile', (req, res) => {
    console.log('/me/profile');
    let access_token = app.locals.access_token;
    const opciones = {
        url: 'https://api.spotify.com/v1/me',
        headers: {
            'authorization': 'Bearer ' + access_token,
            'content-type': 'application/json'
        },
        json: true
    }

    request.get(opciones, (error, response, body) => {
        if(!error && response.statusCode){
            res.json(body);
        } else {
            console.log(response.statusCode);
            console.log(error);
        }
    });
});

app.get('/me/playlists', (req, res) => {
    console.log('/me/playlists');
    let access_token = app.locals.access_token;
    const opciones = {
        url: 'https://api.spotify.com/v1/me/playlists',
        headers : {
            'authorization': 'Bearer ' + access_token,
            'content-type': 'application/json'
        },
        json: true
    };

    request.get(opciones, (error, response, body) => {
        if(!error && response.statusCode === 200){
            res.json(body);
        } else {
            console.log(response.statusCode);
            console.log(error);
            res.send(error);
        }
    });
});

app.get('/me/devices', (req, res) => {
    console.log('/me/player/devices');
    let access_token = app.locals.access_token;
    const opciones = {
        url: 'https://api.spotify.com/v1/me/player/devices',
        headers : {
            'authorization': 'Bearer ' + access_token,
            'content-type': 'application/json'
        },
        json: true
    };

    request.get(opciones, (error, response, body) => {
        if(!error && response.statusCode === 200){
            console.log(body);
            res.json(body);
        } else {
            console.log(response.statusCode);
            console.log(error);
            res.send(error);
        }
    });
});

app.get('/playlist/:playlist_id', (req, res) => {
    console.log('/playlist');
    let access_token = app.locals.access_token;
    let playlist_id = req.params.playlist_id;
    const opciones = {
        url: 'https://api.spotify.com/v1/playlists/' + playlist_id,
        headers: {
            'authorization': 'Bearer ' + access_token,
            'content-type': 'application/json'
        },
        json: true
    }

    request.get(opciones, (error, response, body) => {
        if(!error && response.statusCode === 200){
            console.log(body);
            res.json(body);
        } else {
            console.log(response.statusCode);
            console.log(error);
            res.send(error);
        }
    })
});

app.get('/other/playlists/:user_id', (req, res) => {
    console.log('/other/playlists');
    let access_token = app.locals.access_token;
    let user_id = req.params.user_id;
    console.log(user_id);
    const opciones = {
        url: `https://api.spotify.com/v1/users/${user_id}/playlists`,
        headers: {
            'authorization': 'Bearer ' + access_token,
            'content-type': 'application/json'
        },
        json: true
    }

    request.get(opciones, (error, response, body) => {
        if(!error && response.statusCode === 200){
            res.json(body);
        } else {
            console.log(response.statusCode);
            console.log(error);
        }
    })
});

app.get('/other/profile/:user_id', (req, res) => {
    console.log('/other/profile');
    let access_token = app.locals.access_token;
    let user_id = req.params.user_id.substring(1);
    const opciones = {
        url: `https://api.spotify.com/v1/users/${user_id}`,
        headers: {
            'authorization': 'Bearer ' + access_token,
            'content-type': 'application/json'
        },
        json: true
    }

    request.get(opciones, (error, response, body) => {
        if(!error && response.statusCode === 200){
            res.json(body);
        } else {
            console.log(response.statusCode);
            console.log(error);
        }
    })
});

// app.get('/tracks/:id-playlist', (req, res) => {

// });

/**
 * 
 */
 app.get('/currentTrack/currently-playing', (req,res) => {
    console.log('/currentTrak/currently-playing');    
    if(req.method === 'GET'){        
        let access_token = app.locals.access_token;
        const queryData = {};
        if(access_token){  
            queryData.market = 'ES';          
            const opciones = {
                url: 'https://api.spotify.com/v1/me/player/currently-playing?' + querystring.stringify(queryData),
                headers: { 
                    'Authorization': 'Bearer ' + access_token,
                    'Content-Type': 'application/json'
                },
                json: true
            }
            
            request.get(opciones, (error, response, body) => {
                if(!error && response.statusCode === 200){                    
                    res.json(body);
                } else if(!error && response.statusCode === 204) {
                    console.log('NO HAY DISPOSITIVOS ESCUCHANDO');
                } else {
                    console.log(response.statusCode);
                    console.log(error);                    
                }
            });            
        } else {
            console.log('No funciona el resfrescameElToken che');
        }
    } else {
        console.log('No se realizo la peticion con el METODO correspondiente');
    }
});
 app.get('/currentTrack', (req,res) => {
    console.log('currenttrak');    
    if(req.method === 'GET'){        
        let access_token = app.locals.access_token;
        if(access_token){            
            const opciones = {
                url: 'https://api.spotify.com/v1/me/player',
                headers: { 
                    'Authorization': 'Bearer ' + access_token,
                    'Content-Type': 'application/json'
                },
                json: true
            }
            
            request.get(opciones, (error, response, body) => {
                if(!error && response.statusCode === 200){                    
                    res.json(body);
                } else if(!error && response.statusCode === 204) {
                    console.log('NO HAY DISPOSITIVOS ESCUCHANDO');
                } else {
                    console.log(response.statusCode);
                    console.log(error);                    
                }
            });            
        } else {
            console.log('No funciona el resfrescameElToken che');
        }
    } else {
        console.log('No se realizo la peticion con el METODO correspondiente');
    }
});

app.get('/me/currentTrack/recently-played', (req, red) => {
    console.log('/me/currentTrack/recently-played');
    let access_token = app.locals.access_token;
        if(access_token){            
            const opciones = {
                url: 'https://api.spotify.com/v1/me/player/recently-played',
                headers: {
                    'Accept': 'application/json', 
                    'Authorization': 'Bearer ' + access_token,
                    'Content-Type': 'application/json'
                },
                json: true
            }
            
            request.get(opciones, (error, response, body) => {
                if(!error && response.statusCode === 200){                    
                    console.log(body);
                    res.json(body);
                } else if(!error && response.statusCode === 204) {
                    console.log('NO HAY DISPOSITIVOS ESCUCHANDO');
                } else {
                    console.log(response.statusCode);
                    console.log(error);                    
                }
            });
        }
});

/**
 * 
 */
 app.get('/change/:accion', (req,res) => {
    console.log(' **** Cambiar anterior cancion ****');
    let accion = req.params.accion.substring(1) || null;
    let access_token = app.locals.access_token;

    const opcionesUserInfo = {
        url: 'https://api.spotify.com/v1/me/player/' + accion,
        headers: { 'Authorization': 'Bearer ' + access_token},
        json: true
    }

    request.post(opcionesUserInfo, (error, response, body) => {
        const data = {}
        if(!error && response.statusCode === 204){
            data.server_status = 'OK';
            res.redirect('http://localhost:3000/index.html#' + querystring.stringify(data));
        } else {
            console.log(error);
            res.send(error);
        }
    })
});

app.get('/active/:accion', (req,res) => {
    console.log(' **** activar anterior cancion ****');
    let accion = req.params.accion.substring(1) || null;
    let access_token = app.locals.access_token;

    const opcionesUserInfo = {
        url: 'https://api.spotify.com/v1/me/player/' + accion,
        headers: { 'Authorization': 'Bearer ' + access_token},
        json: true
    }

    request.put(opcionesUserInfo, (error, response, body) => {
        const data = {}
        if(!error && response.statusCode === 204){
            data.server_status = 'OK';
            res.redirect('http://localhost:3000/index.html#' + querystring.stringify(data));
        } else {
            console.log(error);
            res.send(error);
        }
    })
});

app.get('/refresh/:caller', (req, res) => {
    console.log('/refresh');
    let caller = req.params.caller.substring(1);
    const ops = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            grant_type: 'refresh_token',
            refresh_token: app.locals.refresh_token
        },
        headers: {
            'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
        },
        json: true
    };

    request.post(ops, (error, response, body) => {
        if(!error && response.statusCode === 200){
            if(body.access_token){
                app.locals.access_token = body.access_token;
            } else {
                console.log('No hay access_token nuevo');
            }
        } else {
            console.log(response.statusCode);
            console.log(error);
        }
    });

    res.redirect('http://localhost:3000/' + caller);
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

async function refrescameElToken(){
    console.log('funcion refrescameElToken')
    const reqInfo = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            grant_type: 'refresh_token',
            refresh_token: app.locals.refresh_token
        },
        headers: {
            'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
        },
        json: true
    };

    let promise = new Promise(function(resolve) {
        request.post(reqInfo, (error, response, body) => {
            if(!error && response.statusCode === 200){
                console.log('refresh success');
                resolve(body.access_token);
            } else {
                console.log(response.statusCode);
                console.log('refresh error');
                resolve(undefined);
            }
        });
    });
    console.log('sale de la funcion');
    let access_token = await promise;
    return access_token;
}