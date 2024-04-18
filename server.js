const express = require("express");
const bodyParser = require("body-parser");

const server = express();
const port = 8080;

const path = require("path");
server.set("view engine", "ejs");
server.set("views", path.join(__dirname, "views"));
server.use(express.static(path.join(__dirname, "public")));

// bodyParser permet d'analyser les données du corps des requêtes
server.use(bodyParser.urlencoded({ extended: true }));


//creation de la pool
const pg = require("pg");
const pool = new pg.Pool({
    host: "localhost",
    database: "my_database",
    password: "raliz",
    port: 5432
});



let cadeaux = []; //tous les cadeaux proposés par le site
let sessionStart = false;
let pageActuelle = "connexion";
let erreur = "";
let estDeco = true;



function toRender() { //comme un tableau de tous les éléments à rendre mais bien actualisé à chaque fois
    return {
        cadeaux: cadeaux,
        sessionStart: sessionStart,
        pageActuelle: pageActuelle,
        erreur: erreur,
        estDeco: estDeco

    };
}


//Fonctions

// récupérer les éléments de la table "cadeaux" depuis la base de données et les stocker dans le tableau "cadeaux"
async function remplirTableauCadeau() {
    const client = await pool.connect();
    try {
        const resultats = await client.query('SELECT * FROM cadeaux');
        cadeaux = resultats.rows;

    } catch (error) {
        console.error('Erreur lors de la récupération des données de la table cadeaux', error.message);
    } finally {
        client.release();
    }
}

// appel de la fonction pour remplir le tableau "cadeau" au démarrage du serveur
remplirTableauCadeau()
    .then(() => {
        console.log('Le tableau "cadeaux" a été rempli avec succès.');
    })
    .catch(err => {
        console.error('Erreur lors du remplissage du tableau "cadeaux":', err);
    });


//middleware pour gerer l'accessibilité au routes
async function estConnecté(req, res, next) {
    // vérifie si le cookie d'authentification existe
    console.log("Alors");
    console.log(req.path);

    if (sessionStart) { //connecté
        if (pageActuelle !== "connexion" /*chemin actuek*/ && req.path === "/connexion" /*chemin demandé*/) {
            res.clearCookie('monCookie'); //déconnecte l'user
            sessionStart = false;
            console.log("yo");
            estDeco = true;
            res.render(pageActuelle, toRender());
        } else {
            console.log("ras");
            next();
        }


    } else { //pas connecté

        if (req.path !== "/connexion") { //demande d'acceder à une page du site
            if (req.path == "/connexion?erreur=authentification") {
                erreur = "authentification";
                next();
            } else {
                erreur = "connexion";
                next();

            }

        } else {
            console.log("pas co");
            next();
        }

    }

}

/*function toLogOut(req, res, next) {
    if (req.path == "")
}*/

function errCo(req, res, next) {
    if (erreur == "connexion" || erreur == "authentification") {
        pageActuelle = "connexion";
        console.log("MTN");
        return res.render("connexion", toRender());
    } else {
        next();
    }
}


//GESTION DES ROUTES

// route pour gérer la soumission du formulaire de connexion
server.post("/connexion", async (req, res) => {

    const { pseudo, mdp } = req.body; //recupere les données du formulaire soumis
    const client = await pool.connect(); //se conencte à la bdd
    try {
        // vérifier si les informations de connexion correspondent à une entrée dans la table client
        const resultat = await client.query('SELECT * FROM clients WHERE pseudo = $1 AND mot_de_passe = $2', [pseudo, mdp]);

        if (resultat.rows.length > 0) {
            console.log('ICI');
            // authentification réussie, redirection de l'utilisateur vers la page d'accueil
            //enregistré comme connecté avec un cookie
            res.cookie('monCookie', 'authentifié', { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true }); // maxAge définit la durée de vie du cookie en millisecondes (ici on met 1an)
            sessionStart = true; //on démarre une "session"
            estDeco = false;
            console.log(pageActuelle);
            pageActuelle = "index";
            console.log("ALLLO");
            erreur = "";
            res.redirect("/index");
        } else {
            // authentification ratée, redirection de l'utilisateur vers la page de connexion 
            res.redirect("/connexion?erreur=authentification");
        }
    } catch (error) {
        console.error('Erreur lors de la vérification des informations de connexion:', error.message);
        res.redirect("/connexion?erreur=connexion");
    } finally {
        client.release();
    }
});

//premiere page affichée au lancement du serveu: page de connexion
server.get("/", (req, res) => {
    pageActuelle = "/";
    res.render("connexion", toRender());
});

server.get("/connexion", estConnecté, (req, res) => {
    pageActuelle = "connexion";
    erreur = req.query.erreur || "";
    res.render("connexion", toRender());

});

//page d'accueil,  le site en général
server.get("/index", estConnecté, errCo, (req, res) => {
    pageActuelle = "index";
    res.render("index", toRender()); //rend la vue index avec le tableau cadeaux
});



// route finale : l'argument next est ici ignoré
server.use((req, res) => {
    // gestion des requêtes non attendues
    res.status(404).send("Page not found");
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`)
});

