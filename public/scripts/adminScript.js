$(document).ready(function () {
    $("button[class^='btn btn-primary']").click(function () {
        var etat = $(this).attr("etat");
        var target = $(this).closest(".card-body").find("ul[class^='paragrapheCache']");

        if (etat === "fermer") {
            target.show();
            $(this).text("Fermer informations");
            $(this).attr("etat", "afficher");
        } else {
            target.hide();
            $(this).text("Afficher informations");
            $(this).attr("etat", "fermer");
        }
    });
});
