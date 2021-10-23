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
            const tracksDiv = document.createElement('DIV');
            const trackWrap = document.getElementById('tracks-wrap');

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
    const playlistXL = document.getElementById('playlist-xl');
    const imgPlaylist = playlistXL.querySelector('.header img');
    const nombrePlaylist = playlistXL.querySelector('.header h2');
    const ownerPlaylist = playlistXL.querySelector('.header .owner');
    const featPlaylist = playlistXL.querySelector('.header .ft');
    const tracksPlaylist = playlistXL.querySelector('.header .tracks');
    const listaPlaylist = playlistXL.querySelector('.lista-playlist');
    let tracks = document.createElement('DIV');
    
    let playlist = null;
    let cantPlaylists = globalThis.playlists.length;
    for(let i = 0; i < cantPlaylists; i++){
        let pl = globalThis.playlists[i];
        if(pl.id == playlist_id){
            playlist = pl;
            break;
        }
    }
    
    console.log(playlist);
    tracks.setAttribute('id', 'tracks');
    imgPlaylist.setAttribute('src', playlist.img_url);
    nombrePlaylist.textContent = playlist.name;
    ownerPlaylist.textContent = playlist.owner;
    
    if(playlist.collaborative){
        // console.log(data);
    }

    tracksPlaylist.textContent = `${playlist.tracks.total} Canciones`;
    
    for (const track of playlist.tracks) {        
        let trackDiv = document.createElement('DIV');
        let imgTrack = document.createElement('IMG');
        let div = document.createElement('DIV');
        let nameTrack = document.createElement('H3');
        let artistsTrack = document.createElement('H4');

        trackDiv.classList.add('track');

        imgTrack.setAttribute('src', track.img_url);
        nameTrack.textContent = track.name;
        artistsTrack.textContent = track.artists;

        div.appendChild(nameTrack);
        div.appendChild(artistsTrack);
        trackDiv.appendChild(imgTrack);
        trackDiv.appendChild(div);
        tracks.appendChild(trackDiv);
    }
    
    let tracksViejo = listaPlaylist.querySelector('#tracks');
    if(tracksViejo){
        listaPlaylist.replaceChild(tracks, tracksViejo);
    } else {
        listaPlaylist.appendChild(tracks);
    }
        
    // article.addEventListener('click', (evt) => {
    //     let elem = evt.target;
    //     while(!elem.classList.contains('playlist-id')){
    //         if(elem.classList.contains('playlist')){
    //             elem = elem.querySelector('.playlist-id');
    //             break;
    //         }
    //         elem = elem.parentNode;
    //     }
        
    //     setTracks(elem.textContent);            
    // },
    // true);
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
                                uri: item.track.uri
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
    const playlistsWrap = document.getElementById('playlist-bar-wrap');
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
        
        playlist.collaborative ? collaborative.textContent = 'people' : collaborative.setAttribute('hidden', 'hidden'); 
        
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



