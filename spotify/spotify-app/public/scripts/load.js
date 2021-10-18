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

