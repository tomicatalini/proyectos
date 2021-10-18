// import $ from "jquery";

let parametros = getHashParams(window.location.hash);
let server_status = parametros.status || null;

if(server_status){
    console.log(server_status);
    if(server_status !== '200') {
        console.log('NO FUNCIONA EL SERVER BRO');
    } else {
        solicitar('http://localhost:3000/me/profile')
            .then(data => {                
                if(data){
                    console.log(data);
                    $('#user-name').text(data.id);
                } else {
                    console.log('No hay datos del usuario');
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

        // $('#other #user-name').keypress( (evt) => {
        //     if(evt.key == 'Enter'){
        //         let user = evt.target.value ? evt.target.value : "no cargo nada";
        //         solicitar('http://localhost:3000/other/playlists/' + user)
        //             .then(data => {                
        //                 if(data){
        //                     const divCentro = document.getElementById("centro");        
        //                     const divCentroWrap = document.createElement('div');
        //                     divCentroWrap.classList.add('centro-wrap');        
                            
        //                     for (const playlist of data.items) {
        //                         console.log(playlist);
                                
        //                         let article = document.createElement("ARTICLE");
        //                         let imgPlaylist = document.createElement("IMG");
        //                         let divData = document.createElement('DIV');
        //                         let divDataHeader = document.createElement('DIV');
        //                         let name = document.createElement('H3');
        //                         let divDataFooter = document.createElement('DIV');
        //                         let spanCantidad = document.createElement('SPAN');
        //                         let spanColaborativo = document.createElement('SPAN');

        //                         article.classList.add('playlist');
        //                         imgPlaylist.setAttribute('src', playlist.images[0].url);
        //                         divData.classList.add('data');
        //                         divDataHeader.classList.add('data-header');
        //                         name.classList.add('name');
        //                         name.innerHTML = playlist.name;
        //                         divDataFooter.classList.add('data-footer');
        //                         spanCantidad.classList.add('cantidad');
        //                         spanCantidad.innerHTML = `(${playlist.tracks.total})`;
                                
        //                         if(!playlist.collaborative){
        //                             spanColaborativo.hidden = true;
        //                         } else {
        //                             spanColaborativo.classList.add('material-icons-outlined')
        //                             spanColaborativo.innerHTML = 'people';
        //                         }

        //                         article.appendChild(imgPlaylist);
        //                         divDataHeader.appendChild(name);
        //                         divData.appendChild(divDataHeader);            
        //                         divDataFooter.appendChild(spanCantidad);            
        //                         divDataFooter.appendChild(spanColaborativo);            
        //                         divData.appendChild(divDataFooter);
        //                         article.appendChild(divData);
                                
        //                         divCentroWrap.appendChild(article);
        //                     }
        //                     divCentro.appendChild(divCentroWrap);
        //                 } else {
        //                     console.log('No hay datos del usuario');
        //                 }
        //             });
        //     }
        // });


        let items = document.querySelectorAll('.menu-item');
        console.log(items);
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

