
$(document).ready(function () {
    $('#login-form').submit(function (event) {
        var pseudo = $('#pseudo').val();
        var mdp = $('#mdp').val();
        var val_pseudo = 'elisa'; //test temporaire mais à adapter au parcours de la bdd
        var val_mdp = 'ranja';

        if (pseudo !== val_pseudo || mdp !== val_mdp) { //adapter
            $('.erreur-message').show();
            event.preventDefault(); // Empêche l'envoi du formulaire
        } else {
            window.location.href = 'test_connexion.html';
        }
    });
});