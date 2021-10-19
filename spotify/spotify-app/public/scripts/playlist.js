// const e = require("express");

function solicitar(url){
    let resultado = fetch(url)
                            .then(res => res.json());

    return resultado;
}

function setTracks(playlistId){
    console.log(playlistId);
    solicitar('/playlist/' + playlistId).then( data => {
        if(data){
            const titulo = document.querySelector('#aside-der #header');
            titulo.textContent = data.name;

            const tracksDiv = document.getElementById('tracks');

            for (const track of data.tracks.items) {
                console.log(track);
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

                let accionesDiv = document.createElement('DIV');
                accionesDiv.classList.add('acciones');

                let song = document.createElement('DIV');
                song.classList.add('song');
                song.appendChild(imgDiv);
                song.appendChild(dataDiv);
                song.appendChild(accionesDiv);

                tracksDiv.appendChild(song);
            }
        }
    });
}

function armarPlaylist(data) {
    const divCentro = document.getElementById("centro");        
    const divCentroWrap = document.createElement('div');
    divCentroWrap.classList.add('centro-wrap');
    
    for (const playlist of data.items) {
        console.log(playlist);
        
        let article = document.createElement('ARTICLE');
        article.classList.add('playlist');
        
        let playlistImg = document.createElement('IMG');
        playlistImg.setAttribute('src', playlist.images[0].url);
        
        let playlistId = document.createElement('SPAN');
        playlistId.classList.add('playlist-id');
        playlistId.textContent = playlist.id;

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
            // let playlistId = evt.target.getElementById('playlist-id').textContent;
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
            armarPlaylist(data);
        } else {
            console.log('No hay datos del usuario');
        }
    });

});

$('#other #user-name').keypress( (evt) => {
    if(evt.key == 'Enter'){
        let user = evt.target.value ? evt.target.value : "no cargo nada";
        solicitar('http://localhost:3000/other/playlists/' + user)
            .then(data => {                
                if(data){
                    armarPlaylist(data);
                } else {
                    console.log('No hay datos del usuario');
                }
            });
    }
});


