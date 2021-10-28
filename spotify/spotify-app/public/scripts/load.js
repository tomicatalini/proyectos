let parametros = getHashParams(window.location.hash);
let server_status = parametros.status ? parametros.status : null;
var listening = false;
let hora_actual = new Date().getHours();

if(server_status){
    if(server_status !== '200') {
        console.log('NO FUNCIONA EL SERVER BRO');
    } else {
        
        // //header cambie de color al scrollear
        // const headerPrueba = document.getElementById('header');
        // const mainPrueba = document.querySelector('.main');        
        // let scroll_pos = 0;

        // mainPrueba.onscroll = function(e){            
        //     scroll_pos = mainPrueba.scrollTop;
        //     if(scroll_pos > 100) {
        //         headerPrueba.style.backgroundColor = `rgba(35,61,96,1)`;
        //         headerPrueba.style.transition = 'all 0.5s ease-in';
        //     } else {
        //         headerPrueba.style.backgroundColor = `rgba(35,61,96,0)`;
        //     }
        // };

        // //cambiar título según horario
        // let titulo = document.querySelector('.main .titulo');
        // if(hora_actual >= 7 && hora_actual <= 13){
        //     titulo.textContent = '¡Buenos Dias!';
        // } else if(hora_actual > 13 && hora_actual <= 20){
        //     titulo.textContent = '¡Buenas Tardes!';
        // } else {
        //     titulo.textContent = '¡Buenas Noches!';
        // }


        /**
         * Solicitud datos personales (user_name) y setearlo.
         */
        solicitar('http://localhost:3000/me/profile')
            .then(data => data ? $('#user-name').text(data.id) : "")
            .catch(error => console.log(error));
        
        // //Expandir header en caso de que la barra lateral derecha se encuentre en estado HIDDEN
        // if($('#aside-der').attr('hidden') == 'hidden'){
        //     $('header').css('width', 'calc(100% - 15%)');
        // }
        
        // /**
        //  * Busca y setea los dispositivos "disponibles", resalta aquel que se encuentre activo
        //  */
        // solicitar('http://localhost:3000/me/devices')
        //     .then( data => {
        //         const devicesWrapDiv = document.getElementById('devices-wrap');
        //         const devicesDiv = document.createElement('DIV');
        //         devicesDiv.setAttribute('id', 'devices');

        //         for(let device of data.devices){
        //             let idHidden = document.createElement('SPAN');
        //             let activeHidden = document.createElement('SPAN');
        //             let img = document.createElement('SPAN');
        //             let name = document.createElement('SPAN');
        //             const deviceDiv = document.createElement('DIV');

        //             idHidden.setAttribute('hidden','hidden');
        //             activeHidden.setAttribute('hidden','hidden');                    
                    
        //             idHidden.classList.add('id');
        //             activeHidden.classList.add('activo');
        //             name.classList.add('nombre');
        //             deviceDiv.classList.add('device');
        //             img.classList.add('material-icons');

        //             idHidden.textContent = device.id;
        //             activeHidden.textContent = device.is_active;
        //             name.textContent = (device.type.toLowerCase() == 'computer') ? 'computer' : device.name;
        //             img.textContent = device.type.toLowerCase();

        //             deviceDiv.appendChild(idHidden);
        //             deviceDiv.appendChild(activeHidden);
        //             deviceDiv.appendChild(img);
        //             deviceDiv.appendChild(name);

                    
        //             if(activeHidden.textContent == 'true'){
        //                 listening = true;
        //                 deviceDiv.style.color = 'rgba(255,255,255,1)';
        //             }
                    
        //             devicesDiv.appendChild(deviceDiv);
        //         }

        //         devicesWrapDiv.appendChild(devicesDiv);

        //         //Cargar REPRODUCTOR con datos de la ultima canción que se escuchó.
        //         if(listening){
        //             solicitar('http://localhost:3000/me/currentTrack/currently-playing')
        //                 .then( data2 => {
        //                     if(data2.error){
        //                         console.log(`${data2.status}: ${data2.message}`);
        //                     } else {
        //                         setTrack(data2);
        //                     }
        //                 });
        //         } else {
        //             solicitar('http://localhost:3000/me/currentTrack/recently-played')
        //                 .then( data2 => {
        //                     if(data2.error){
        //                         console.log(`${data2.status}: ${data2.message}`);
        //                     } else {
        //                         setTrack(data2);
        //                     }
        //                 });
        //         }
        //     });       

        // /**
        //  * Set eventos del menu
        //  */
        // $('#playlist-other').focus( () => {
        //     $('#other #user-name').show("slow");
        // });
        // $('#playlist-other').blur( function(){
        //     if(!this.classList.contains("onfocus")){
        //         $('#other #user-name').hide("slow");                
        //     }
        // });
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

function setTrack(data){
    const recentlyTrackName = document.querySelector('#actual #nombre');
    const recentlyTrackArtist = document.querySelector('#actual #artista');
    const currentImg = document.querySelector('#actual #currentImg');

    let name = "";
    let artists = [];
    let imgURL = "";
    
    if(data.item){
        name = data.item.name;
        artists = data.item.artists;
        imgURL = data.item.album.images[2].url;
    } else {
        name = data.items[0].track.name;
        artists = data.items[0].track.artists;
        imgURL = data.items[0].track.album.images[2].url;
    }

    recentlyTrackName.textContent = name;
    recentlyTrackArtist.textContent = "";
    let artistas = artists.length;
    for (let i = 0; i < artistas; i++) {
        if(i == (artistas - 1)){
            recentlyTrackArtist.textContent += artists[i].name;
        } else {
            recentlyTrackArtist.textContent += `${artists[i].name}, `;
        }                        
    }

    currentImg.setAttribute('src', imgURL);
}

$('#aside-der button').click(() => {
    console.log(globalThis.queue);
    for (const track of globalThis.queue) {        
        let post = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({'uri': track.uri})                        
        }
        fetch('http://localhost:3000/me/add/queue', post)
        .then(res => res.json())
        .then(data => console.log(data))
        .catch(error => console.log(error))        
    }
});
