
$(document).ready(function () {



    $("button[class^='boutonAfficher']").click(function () {
        var etat = $(this).attr("etat");

        if (etat === "afficher") {
            $(this).closest(".infoClient").find("ul[class^='paragrapheCache']").show();
            $(this).text("Fermer informations");
            $(this).attr("etat", "fermer");
        } else {
            $(this).closest(".infoClient").find("ul[class^='paragrapheCache']").hide();
            $(this).text("Afficher informations");
            $(this).attr("etat", "afficher");
            setTimeout(function () {
                location.reload();
            }, 400);
        }
    });

    $(".btnAjouterClient").click(function () {
        var etat = $(this).attr("etat");
        if (etat === "afficher") {
            $(this).closest(".blocGestion").find(".formCache").show();
            $(this).text("Fermer");
            $(this).attr("etat", "fermer");
        } else {
            $(this).closest(".blocGestion").find(".formCache").hide();
            $(this).text("Ajouter un nouveau client");
            $(this).attr("etat", "afficher");
        }
    });

    $(".boutonModifier").click(function () {
        var input = $(".modifClient");
        var span = $(".defaut");
        if (span.is(":visible")) {
            span.hide();
            input.show();
            $(".boutonModifier").hide();
            $(".boutonSave").show();
            $(".boutonAnnuler").show();
        }
    });



    $(".boutonAnnuler").click(function () {
        var input = $(".modifClient");
        var span = $(".defaut");
        span.show();
        input.hide();
        $(".boutonModifier").show();
        $(".boutonSave").hide();
        $(this).hide();

    });



    $("#formClient").submit(function (event) {
        var input = $(".modifClient");
        var span = $(".defaut");
        span.show();
        input.hide();
        $(".boutonModifier").show();
        $(".boutonSave").hide();
        location.reload();
    });






});
