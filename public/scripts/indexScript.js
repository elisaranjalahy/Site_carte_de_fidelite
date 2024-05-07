$(document).ready(function () {
    $("button[class^='boutonAfficher']").click(function () {
        var etat = $(this).attr("etat");
        if (etat === "fermer") {
            $(this).siblings("ul[class^='paragrapheCache']").show();
            $(this).text("Fermer informations");
            $(this).attr("etat", "afficher");
        } else {
            $(this).siblings("ul[class^='paragrapheCache']").hide();
            $(this).text("Afficher informations");
            $(this).attr("etat", "fermer");
        }
    });
});
