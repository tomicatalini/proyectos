$('#form').hide();
$('#playlist-other').click( () => {
    $('#form').toggle('slow');
    if($('#form').css('display') != 'none'){
        $('#form input').focus();
    } else {
        $('#form input').blur();
    } 
})