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
            })
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

