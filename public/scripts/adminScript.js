$(document).ready(function () {
    $("button[class^='boutonAfficher']").click(function () {
        var etat = $(this).attr("etat");
        if (etat === "fermer") {
            $(this).closest(".infoClient").find("ul[class^='paragrapheCache']").show();
            $(this).text("Fermer informations");
            $(this).attr("etat", "afficher");
        } else {
            $(this).closest(".infoClient").find("ul[class^='paragrapheCache']").hide();
            $(this).text("Afficher informations");
            $(this).attr("etat", "fermer");
        }
    });

    $(".btnAjouterClient").click(function () {
        var etat = $(this).attr("etat");
        if (etat === "fermer") {
            $(this).closest(".blocGestion").find(".formCache").show();
            $(this).text("Fermer");
            $(this).attr("etat", "afficher");
        } else {
            $(this).closest(".blocGestion").find(".formCache").hide();
            $(this).text("Ajouter un nouveau client");
            $(this).attr("etat", "fermer");
        }
    });
});
