function solicitar(url){
    let resultado = fetch(url)
                            .then(res => res.json());

    return resultado;
}
function solicitarPOST(url, ops){
    let resultado = fetch(url, ops)
                            .then(res => res.json());

    return resultado;
}

function setTracks(playlistId){
    console.log(playlistId);
    solicitar('/playlist/' + playlistId).then( data => {
        if(data){
            const aside_der = document.getElementById('aside-der');
            const tituloSelectedPlaylist = document.querySelector('#aside-der h2');
            const tracksDiv = document.createElement('DIV');
            const trackWrap = document.getElementById('tracks-wrap');

            let tracksDivExistente = document.getElementById('tracks');

            tracksDiv.setAttribute('id', 'tracks');            
            tituloSelectedPlaylist.textContent = data.name;

            for (const track of data.tracks.items) {
                console.log(track);
                let trackUri = document.createElement('SPAN');
                trackUri.setAttribute('hidden', 'hidden');
                trackUri.classList.add('uriHidden');
                trackUri.textContent = track.track.uri;

                let img = document.createElement('IMG');
                img.setAttribute('src', track.track.album.images[0].url);
                let imgDiv = document.createElement('DIV');
                imgDiv.classList.add('img');
                imgDiv.appendChild(img);

                let name = document.createElement('SPAN');
                name.classList.add('name');
                name.textContent = track.track.name;

                let artists = document.createElement('SPAN');
                artists.classList.add('artists');
                for (const artName of track.track.artists) {
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

            if(tracksDivExistente){
                trackWrap.replaceChild(tracksDiv,tracksDivExistente);
            } else {
                trackWrap.appendChild(tracksDiv);
            }

            if(aside_der.getAttribute('hidden') == 'hidden'){
                aside_der.removeAttribute('hidden');
                document.getElementById('header').style.width = 'calc(100% - 15% - 35%)';
            }
        }
    });
}

function armarPlaylist(data) {
    const divCentro = document.getElementById("centro");        
    const divCentroWrap = document.createElement('div');
    divCentroWrap.classList.add('centro-wrap');
    
    for (const playlist of data.items) {        
        let article = document.createElement('ARTICLE');
        article.classList.add('playlist');
        
        let playlistImg = document.createElement('IMG');
        playlistImg.setAttribute('src', playlist.images[0].url);
        
        let playlistId = document.createElement('SPAN');
        playlistId.classList.add('playlist-id');
        playlistId.textContent = playlist.id;
        playlistId.setAttribute('hidden', 'hidden');

        let data = document.createElement('DIV');
        data.classList.add('data');
        
        let dataHeader = document.createElement('DIV');
        dataHeader.classList.add('data-header');
        
        let playlistName = document.createElement('H3');
        playlistName.classList.add('name');
        playlistName.innerHTML = playlist.name;
        dataHeader.appendChild(playlistName);
        
        let dataFooter = document.createElement('DIV');
        dataFooter.classList.add('data-footer');
        
        let songs = document.createElement('SPAN');
        songs.classList.add('cantidad');
        songs.innerHTML = `${playlist.tracks.total} Cantidad`;
        
        let collaborative = document.createElement('SPAN');
        if(!playlist.collaborative){
            collaborative.hidden = true;
        } else {
            collaborative.classList.add('material-icons-outlined')
            collaborative.innerHTML = 'people';
        }                        

        article.appendChild(playlistImg);
        article.appendChild(data);
        data.appendChild(playlistId);
        data.appendChild(dataHeader);            
        dataFooter.appendChild(songs);            
        dataFooter.appendChild(collaborative);            
        data.appendChild(dataFooter);
        
        article.addEventListener('click', (evt) => {
            let elem = evt.target;
            while(!elem.classList.contains('playlist-id')){
                if(elem.classList.contains('playlist')){
                    elem = elem.querySelector('.playlist-id');
                    break;
                }
                elem = elem.parentNode;
            }
            
            setTracks(elem.textContent);            
        },
        true);

        divCentroWrap.appendChild(article);
    }
    divCentro.appendChild(divCentroWrap);
}

$('#misPlaylist').click( () => {

    solicitar('http://localhost:3000/me/playlists').then( data => {
        if(data){
            // armarPlaylist(data);
            setPlaylistBar(data);
        } else {
            console.log('No hay datos del usuario');
        }
    });

});

$('#misPlaylist').focus( () => {

    solicitar('http://localhost:3000/me/playlists').then( data => {
        if(data){
            // armarPlaylist(data);
            setPlaylistBar(data);
        } else {
            console.log('No hay datos del usuario');
        }
    });

});

$('#misPlaylist').focus();


$('#other #user-name').keypress( (evt) => {
    if(evt.key == 'Enter'){
        let user = evt.target.value ? evt.target.value : "no cargo nada";
        solicitar('http://localhost:3000/other/playlists/' + user)
            .then(data => {                
                if(data){
                    // armarPlaylist(data);
                    setPlaylistBar(data);
                } else {
                    console.log('No hay datos del usuario');
                }
            });
    }
});

function setPlaylistBar(data){
    const playlistsWrap = document.getElementById('playlist-bar-wrap');
    const playlists = document.createElement('DIV');
    playlists.setAttribute('id', 'playlists-bar');

    for( let playlist of data.items){
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

        playlists.appendChild(playlistDiv);
    }

    let playlistsViejo = playlistsWrap.querySelector('#playlists-bar');
    if(playlistsViejo){
        playlistsWrap.replaceChild(playlists, playlistsViejo);
    } else{
        playlistsWrap.appendChild(playlists);
    } 
}

