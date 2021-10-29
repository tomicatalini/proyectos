function solicitar(url){
    let resultado = fetch(url)
                            .then(res => res.json())
                            .catch(error => error);

    return resultado;
}
function solicitarPOST(url, ops){
    let resultado = fetch(url, ops)
                            .then(res => res.json())
                            .catch(error => error);

    return resultado;
}

function setTracks(playlistId){
    solicitar('/playlist/' + playlistId).then( data => {
        if(data){
            let tracksGLobal = [];

            const aside_der = document.getElementById('aside-der');
            const tituloSelectedPlaylist = document.querySelector('#aside-der h2');
            const totalTracks = document.querySelector('#aside-der #header #nro_tracks');
            const tracksDiv = document.createElement('DIV');
            const trackWrap = document.getElementById('tracks-container');

            let tracksDivExistente = document.getElementById('tracks');

            tracksDiv.setAttribute('id', 'tracks');            
            tituloSelectedPlaylist.textContent = data.name;

            for (const track of data.tracks.items) {
                let datosTrack = {
                    id: track.track.id,
                    nombre: track.track.name,
                    artistas: track.track.artists,
                    img_url: track.track.album.images[2].url,
                    uri: track.track.uri
                }

                tracksGLobal.unshift(datosTrack);

                let trackUri = document.createElement('SPAN');
                trackUri.setAttribute('hidden', 'hidden');
                trackUri.classList.add('uriHidden');
                trackUri.textContent = datosTrack.uri;

                let img = document.createElement('IMG');
                img.setAttribute('src', datosTrack.img_url);
                let imgDiv = document.createElement('DIV');
                imgDiv.classList.add('img');
                imgDiv.appendChild(img);

                let name = document.createElement('SPAN');
                name.classList.add('name');
                name.textContent = datosTrack.nombre;

                let artists = document.createElement('SPAN');
                artists.classList.add('artists');
                for (const artName of datosTrack.artistas) {
                    artists.textContent += artName.name +', ';
                }
                artists.textContent = artists.textContent.substring(0, artists.textContent.length - 2);

                let dataDiv = document.createElement('DIV');
                dataDiv.classList.add('data');
                dataDiv.appendChild(name);
                dataDiv.appendChild(artists);
                dataDiv.appendChild(trackUri);
                
                const agregarQueue = document.createElement('SPAN');
                agregarQueue.classList.add('material-icons');
                agregarQueue.textContent = 'add';
                agregarQueue.onclick = function(evt){
                    let uriSpan = evt.target.parentNode.parentNode.querySelector('.data .uriHidden');
                    console.log(uriSpan.textContent);
                    let postOps = {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({'uri': uriSpan.textContent })                        
                    }
                    solicitarPOST('http://localhost:3000/me/add/queue', postOps)
                        .then( data => {
                            console.log(data);
                        });
                }
                
                let accionesDiv = document.createElement('DIV');
                accionesDiv.classList.add('acciones');
                accionesDiv.appendChild(agregarQueue);


                let song = document.createElement('DIV');
                song.classList.add('song');
                song.appendChild(imgDiv);
                song.appendChild(dataDiv);
                song.appendChild(accionesDiv);

                tracksDiv.appendChild(song);
            }

            for (let playlist of globalThis.playlists) {
                if(playlist.id == playlistId){
                    playlist.track = tracksGLobal;
                }
            }

            if(tracksDivExistente){
                trackWrap.replaceChild(tracksDiv,tracksDivExistente);
            } else {
                trackWrap.appendChild(tracksDiv);
            }

            if(aside_der.getAttribute('hidden') == 'hidden'){
                aside_der.removeAttribute('hidden');
                document.getElementById('header').style.width = 'calc(100% - 15% - 35%)';
            }

            return datosPlaylist;
        }
        return null;
    });
}

function setPlaylist(playlist_id) {
    const plId = document.querySelector('#mi-library .datos .id');

    if(plId.textContent != playlist_id){
        const pl = document.getElementById('mi-library');        
        const plImg = pl.querySelector('header img');
        const plName = pl.querySelector('header h2');
        const plOwner = pl.querySelector('header .owner');
        const plTracks = pl.querySelector('header .tracks');
        const plTable = pl.querySelector('.table');
        const plTableTbody = pl.querySelector('.table .tbody');
        const plTableTbodyNew = document.createElement('DIV');
        
        //GET PLAYLIST
        let playlists = globalThis.playlists;
        let playlist = playlists ? playlists.filter(pl => pl.id == playlist_id)[0] : null;
        
        //SET HEADER
        plId.textContent = playlist.id;
        plImg.setAttribute('src', playlist.img_url);
        plName.textContent = playlist.name;
        plOwner.textContent = playlist.owner;
        plTracks.textContent = `${playlist.tracks.length} canciones`;             
        
        //SET TABLE BODY (TRACKS)
        let i = 1;
        for (const track of playlist.tracks) {     
            let contenedor = document.createElement('DIV');
            let number = document.createElement('SPAN');
            let id = document.createElement('SPAN');
            let div = document.createElement('DIV');
            let data = document.createElement('DIV');
            let img = document.createElement('IMG');
            let title = document.createElement('P');
            let artists = document.createElement('P');
            let duration = document.createElement('SPAN');
            let actions = document.createElement('SPAN');

            number.textContent = `${i}`;
            number.classList.add('t-count');
            id.textContent = track.id;
            id.classList.add('t-id');
            id.setAttribute('hidden', 'hidden');
            img.setAttribute('src', track.img_url);
            title.textContent = track.name;
            title.classList.add('title');
            artists.textContent = track.artists;
            artists.classList.add('artists');
            data.classList.add('data');
            data.appendChild(title);
            data.appendChild(artists);
            div.appendChild(img);
            div.appendChild(data);
            div.classList.add('t-title');

            duration.textContent = new Date(track.duration).toString().substring(20,25);
            duration.classList.add('t-duration');
            actions.textContent = '+';
            actions.classList.add('t-actions');
            
            contenedor.appendChild(number);
            contenedor.appendChild(id);
            contenedor.appendChild(div);
            contenedor.appendChild(duration);
            contenedor.appendChild(actions);
            contenedor.classList.add('track');
            
            plTableTbodyNew.appendChild(contenedor);
            i++;
        }

        plTableTbody ? plTableTbody.remove() : null;
        plTableTbodyNew.classList.add('tbody');
        plTable.appendChild(plTableTbodyNew);
    }   
}

function addPlaylistsQueue(tracks, playlist_name){
    const tracksWrap = document.querySelector('#aside-der #tracks-wrap');
    for(let track of tracks){
        let trackCard = document.createElement('DIV');
        let datos = document.createElement('DIV');
        let acciones = document.createElement('DIV');
        let playlistDiv = document.createElement('DIV');
        let id = document.createElement('SPAN');
        let name = document.createElement('H3');
        let artistas = document.createElement('SPAN');
        let playlistName = document.createElement('SPAN');
        let removeIcon = document.createElement('SPAN');
        
        id.classList.add('id');
        id.setAttribute('hidden','hidden');
        id.textContent = track.id;
        name.textContent = track.name;
        artistas.classList.add('artists');
        artistas.textContent = track.artists;
        datos.classList.add('datos');
        datos.appendChild(id);
        datos.appendChild(name);
        datos.appendChild(artistas);
        playlistName.textContent = playlist_name;
        playlistDiv.classList.add('playlist');
        playlistDiv.appendChild(playlistName);
        removeIcon.classList.add('material-icons');
        removeIcon.textContent = 'remove';
        removeIcon.addEventListener('click', (e) => {
            globalThis.queue = globalThis.queue.filter(item => item.id != track.id);
            document.getElementById('tracks-wrap').removeChild(e.target.parentNode.parentNode);
        });
        acciones.classList.add('acciones');
        acciones.appendChild(removeIcon);
        trackCard.classList.add('track');
        trackCard.appendChild(datos);
        trackCard.appendChild(playlistDiv);
        trackCard.appendChild(acciones);

        tracksWrap.appendChild(trackCard);
    }
    let lista = globalThis.queue ? globalThis.queue.concat(tracks) : tracks;
    globalThis.queue = lista;
}

/**
 * Setea una variable global (playlists) con las playlists de un usuario 
 * @param {Nombre usuario de las playlists} user 
 */
function getPlaylists(url) {
    fetch(url)
        .then(res => res.json())
        .then(data => {
            let playlistsGlobal = [];
            try{

                for(let playlist of data.items){                
                    
                    let datosPlaylist = {
                        id: playlist.id,
                        name: playlist.name,
                        img_url: playlist.images[0].url,
                        tracks: [],
                        isCollaborative: playlist.collaborative,
                        owner: playlist.owner.display_name
                    }
    
                    playlistsGlobal.unshift(datosPlaylist);
                }
                return Promise.resolve(playlistsGlobal);
            } catch(exception){
                return Promise.reject(exception);
            }
        })
        .then(data => {
            for (const playlist of data) {
                fetch('http://localhost:3000/playlist/' + playlist.id)
                    .then(res => res.json())
                    .then(track => {
                        for (let item of track.tracks.items) {
                            let datosTrack = {
                                id: item.track.id,
                                name: item.track.name,
                                artists: "",
                                img_url: item.track.album.images[2].url,
                                uri: item.track.uri,
                                duration: item.track.duration_ms
                            }
        
                            let cantArtistas = item.track.artists.length - 1;
                            for(let j = 0; j <= cantArtistas; j++){
                                if(j == cantArtistas){
                                    datosTrack.artists += item.track.artists[j].name;
                                } else {
                                    datosTrack.artists += `${item.track.artists[j].name}, `;
                                }
                            }
        
                            playlist.tracks.unshift(datosTrack);
                        }
                    });                
            }
            globalThis.playlists = data;
            console.log(globalThis.playlists);
        })
        .catch(error => console.log(error))
        .finally(() => setPlaylistBar());  
}

/**
 * Muestra en pantalla las playlists del usuario
 */
function setPlaylistBar(){
    const playlistsWrap = document.getElementById('user-playlists');
    const playlists = document.createElement('DIV');
    playlists.setAttribute('id', 'playlists-bar');

    for( let playlist of globalThis.playlists){
        
        let playlistDiv = document.createElement('DIV');
        let id = document.createElement('SPAN');
        let name = document.createElement('SPAN');
        let collaborative = document.createElement('SPAN');

        id.setAttribute('hidden','hidden');

        playlistDiv.classList.add('playlist');
        id.classList.add('id');
        name.classList.add('name');
        collaborative.classList.add('material-icons-outlined');
        
        id.textContent = playlist.id;
        name.textContent = playlist.name;
        
        playlist.isCollaborative ? collaborative.textContent = 'people' : collaborative.setAttribute('hidden', 'hidden'); 
        
        playlistDiv.appendChild(id);
        playlistDiv.appendChild(name);
        playlistDiv.appendChild(collaborative);

        playlistDiv.addEventListener('click', () => setPlaylist(playlist.id));
        playlists.appendChild(playlistDiv);
    }

    let playlistsViejo = playlistsWrap.querySelector('#playlists-bar');
    if(playlistsViejo){
        playlistsWrap.replaceChild(playlists, playlistsViejo);
    } else{
        playlistsWrap.appendChild(playlists);
    }
}

//$('#misPlaylist').click( () => getPlaylists('http://localhost:3000/me/playlists')); 
$('#misPlaylist').focus( () => getPlaylists('http://localhost:3000/me/playlists'));

$('#misPlaylist').focus();


$('#other #user-name').keypress( (evt) => {
    if(evt.key == 'Enter'){
        let user = evt.target.value ? evt.target.value : "no cargo nada";

        getPlaylists(`http://localhost:3000/other/playlists/${user}`);
    }
});

$('#playlist-xl button').click( () => {

});







function removeTrack(id) {
    globalThis.queue.filter(track => track.id !== id);
}

