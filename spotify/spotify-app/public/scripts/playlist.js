function solicitar(url){
    let resultado = fetch(url)
                            .then(res => res.json());

    return resultado;
}

$('#misPlaylist').click( () => {

    solicitar('http://localhost:3000/me/playlists').then( data => {
        const divCentro = document.getElementById("centro");        
        const divCentroWrap = document.createElement('div');
        divCentroWrap.classList.add('centro-wrap');        
        
        for (const playlist of data.items) {
            console.log(playlist);
            
            let article = document.createElement("ARTICLE");
            let imgPlaylist = document.createElement("IMG");
            let divData = document.createElement('DIV');
            let divDataHeader = document.createElement('DIV');
            let name = document.createElement('H3');
            let divDataFooter = document.createElement('DIV');
            let spanCantidad = document.createElement('SPAN');
            let spanColaborativo = document.createElement('SPAN');

            article.classList.add('playlist');
            imgPlaylist.setAttribute('src', playlist.images[0].url);
            divData.classList.add('data');
            divDataHeader.classList.add('data-header');
            name.classList.add('name');
            name.innerHTML = playlist.name;
            divDataFooter.classList.add('data-footer');
            spanCantidad.classList.add('cantidad');
            spanCantidad.innerHTML = `(${playlist.tracks.total})`;
            
            if(!playlist.collaborative){
                spanColaborativo.hidden = true;
            } else {
                spanColaborativo.classList.add('material-icons-outlined')
                spanColaborativo.innerHTML = 'people';
            }

            article.appendChild(imgPlaylist);
            divDataHeader.appendChild(name);
            divData.appendChild(divDataHeader);            
            divDataFooter.appendChild(spanCantidad);            
            divDataFooter.appendChild(spanColaborativo);            
            divData.appendChild(divDataFooter);
            article.appendChild(divData);
            
            divCentro.appendChild(article);
        }

        // divCentro.appendChild(divCentroWrap);
    });

});