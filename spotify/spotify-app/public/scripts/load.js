let parametros = getHashParams(window.location.hash);
let server_status = parametros.status || null;

if(server_status){
    if(server_status !== '200') {
        console.log('NO FUNCIONA EL SERVER BRO');
    } else {
        const aside_der_tracks = document.querySelector('#aside-der #tracks-wrap');

        if(aside_der_tracks.children.length == 0){
            document.getElementById('aside-der').setAttribute('hidden','hidden');
            document.getElementById('header').style.width = 'calc(100% - 15%)';
        }
        
        solicitar('http://localhost:3000/me/profile')
            .then(data => {                
                if(data){
                    $('#user-name').text(data.id);
                } else {
                    console.log('No hay datos del usuario');
                }
            });
        
        solicitar('http://localhost:3000/me/devices')
            .then( data => {
                console.log(data);
                const devicesDiv = document.getElementById('devices');

                for(let device of data.devices){
                    let idHidden = document.createElement('SPAN');
                    let activeHidden = document.createElement('SPAN');
                    let name = document.createElement('P');
                    let type = document.createElement('P');
                    const deviceDiv = document.createElement('DIV');

                    idHidden.setAttribute('hidden','hidden');
                    activeHidden.setAttribute('hidden','hidden');                    
                    deviceDiv.setAttribute('id','device');

                    idHidden.textContent = device.id;
                    activeHidden.textContent = device.is_active;
                    name.textContent = device.name;
                    type.textContent = device.type;

                    deviceDiv.appendChild(idHidden);
                    deviceDiv.appendChild(activeHidden);
                    deviceDiv.appendChild(name);
                    deviceDiv.appendChild(type);

                    devicesDiv.appendChild(deviceDiv);
                }
            });        
    
        //Cargar REPRODUCTOR con datos de la ultima canción que se escuchó.
        solicitar('http://localhost:3000/me/currentTrack/recently-played')
        .then( data => {
            if(data.error){
                console.log(`${data.status}: ${data.message}`);
            } else {
                const recentlyTrackName = document.querySelector('#actual #nombre');
                const recentlyTrackArtist = document.querySelector('#actual #artista');
                const currentImg = document.querySelector('#actual #currentImg');

                recentlyTrackName.textContent = data.items[0].track.name;
                recentlyTrackArtist.textContent = "";
                let artistas = data.items[0].track.artists.length;
                for (let i = 0; i < artistas; i++) {
                    if(i == (artistas - 1)){
                        recentlyTrackArtist.textContent += data.items[0].track.artists[i].name;
                    } else {
                        recentlyTrackArtist.textContent += `${data.items[0].track.artists[i].name}, `;
                    }                        
                }

                currentImg.setAttribute('src', data.items[0].track.album.images[2].url);
            }
        });
        
        if($('#aside-der').attr('hidden') == 'hidden'){
            $('header').css('width', 'calc(100% - 20%)');
        }

        //MENU
        $('#other #user-name').hide();

        $('#playlist-other').focus( () => {
            $('#other #user-name').show("slow");
        });
        $('#playlist-other').blur( function(){
            if(!this.classList.contains("onfocus")){
                $('#other #user-name').hide("slow");                
            }
        });

        let items = document.querySelectorAll('.menu-item');
        for (let btn of items) {
            btn.addEventListener('click', () => {
                let items = document.querySelectorAll('.menu-item');
                for(let btn of items){
                    btn.classList.toggle("onfocus", false);
                }
                if(btn.getAttribute('id') != 'playlist-other'){
                    $('#other #user-name').hide("slow");
                }
                btn.classList.add("onfocus");
            });
        }
    }
} else {
    console.log('No hubo respuesta del servidor');
}


//FUNCIONES
function getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
    q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
        hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
}

function solicitar(url){
    let resultado = fetch(url)
                            .then(res => res.json());

    return resultado;
}

