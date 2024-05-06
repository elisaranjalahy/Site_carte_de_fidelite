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
const { removeData } = require("jquery");
const pool = new pg.Pool({
    host: "localhost",
    database: "my_database",
    password: "raliz",
    port: 5432
});


//VARIABLE

let sessionStart = false;
let pageActuelle = "connexion";





const currentUser = {
    prenom: "",
    nom: "",
    pseudo: "",
    email: "",
    mdp: "",
    points: 0,
    anniversaire: "",
    admin: false
};


//FONCTIONS


//bdd

async function getUser(pseudo, mdp) {
    const client = await pool.connect(); // Se connecte à la base de données
    try {
        const result = await client.query('SELECT * FROM clients WHERE pseudo = $1 AND mot_de_passe = $2', [pseudo, mdp]);
        return result;
    } catch (error) {
        console.error('Erreur lors de la vérification des informations de connexion :', error.message);
        throw error; // Lève l'erreur pour la traiter à un niveau supérieur

    } finally {
        client.release();
    }
}

async function getCadeaux() {
    const client = await pool.connect(); // Se connecte à la base de données
    let result = [];
    try {
        const data = await client.query('SELECT * FROM cadeaux');
        for (let row of data.rows) {
            result.push(row);
        }
        return result;
    } catch (error) {
        console.error('Erreur lors de la récupération des données de la table cadeaux', error.message);
        result = [];
        return result;
    } finally {
        client.release();
    }

}

async function getMesCadeaux() {
    const client = await pool.connect(); // Se connecte à la base de données
    let result = [];
    try {

        const data = await client.query('SELECT * FROM cadeaux WHERE points_cadeau <= $1', [currentUser.points]);
        for (let row of data.rows) {
            result.push(row);
        }
        return result;
    } catch (error) {
        console.error('Erreur lors de la récupération des données de la table cadeaux', error.message);
        result = [];
        return result;
    } finally {
        client.release();
    }
}

async function getEveryClient() {
    const client = await pool.connect(); // Se connecte à la base de données
    let result = [];
    try {
        const data = await client.query('SELECT * FROM clients');
        for (let row of data.rows) {
            result.push(row);
        }
        return result;
    } catch (error) {
        console.error('Erreur lors de la récupération des données de la table cadeaux', error.message);
        result = [];
        return result;
    } finally {
        client.release();
    }
}

//middleware

//middleware pour gerer l'accessibilité au routes
function estConnecté(req, res, next) {
    // vérifie si le cookie d'authentification existe


    if (sessionStart) { //connecté
        if (pageActuelle !== "connexion" /*chemin actuek*/ && req.path === "/connexion" /*chemin demandé*/) {
            //res.clearCookie('monCookie'); //déconnecte l'user
            clearUser(currentUser);
            sessionStart = false;
            res.render(pageActuelle, { sessionStart: false, currentUser: currentUser, erreur: "" }); //rend la vue index avec le tableau cadeaux
        } else {
            next();
        }


    } else { //pas connecté

        if (req.path !== "/connexion") { //demande d'acceder à une page du site
            if (req.path == "/connexion?erreur=authentification") {
                res.render(pageActuelle, { erreur: "authentification", sessionStart: sessionStart });
            } else {
                res.render(pageActuelle, { erreur: "connexion", sessionStart: sessionStart });


            }


        } else {
            next();
        }

    }

}

//Fonctions auxiliaires

function clearUser(user) {
    user["pseudo"] = "";
    user["mdp"] = "";
    user["anniversaire"] = "";
    user["points"] = 0;
    user["prenom"] = "";
    user["nom"] = "";
    user["email"] = "";
    user["admin"] = false;

}

function BirthDate(user) {

}




//GESTION DES ROUTES

// route pour gérer la soumission du formulaire de connexion
server.post("/connexion", async (req, res) => {

    currentUser["pseudo"] = req.body.pseudo;
    currentUser["mdp"] = req.body.mdp;


    // vérifier si les informations de connexion correspondent à une entrée dans la table client
    const resultat = await getUser(currentUser["pseudo"], currentUser["mdp"]);


    if (resultat.rows.length > 0) {
        // authentification réussie, redirection de l'utilisateur vers la page d'accueil
        const userData = resultat.rows[0]; // Première ligne de résultats

        currentUser["pseudo"] = userData["pseudo"];
        currentUser["mdp"] = userData["mot_de_passe"];
        currentUser["points"] = userData["points_client"];
        currentUser["prenom"] = userData["prenom"];
        currentUser["nom"] = userData["nom"];
        currentUser["email"] = userData["email"];
        currentUser["admin"] = userData["admin"];
        const date = new Date(userData["anniversaire"]);
        const formattedDate = date.toISOString().substring(0, 10);
        currentUser["anniversaire"] = formattedDate;
        console.log(currentUser["anniversaire"]);
        //enregistré comme connecté avec un cookie
        //res.cookie('monCookie', 'authentifié', { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true }); // maxAge définit la durée de vie du cookie en millisecondes (ici on met 1an)
        console.log(resultat.rows);
        sessionStart = true; //on démarre une "session"
        res.redirect("/index");;
    } else {
        // authentification ratée, redirection de l'utilisateur vers la page de connexion 
        res.redirect("/connexion?erreur=authentification");
    }

});

server.post("/deconnexion", async (req, res) => {

    res.redirect("/connexion");
});

//premiere page affichée au lancement du serveu: page de connexion
server.get("/", (req, res) => {
    pageActuelle = "/";
    if (req.query.erreur === "authentification") {
        res.render("connexion", { erreur: "authentification" });
    }
    if (req.query.erreur === "connexion") {
        res.render("connexion", { erreur: "connexion" });
    }
    if (req.query.erreur !== "authentification" && req.query.erreur !== "authentification") {
        res.render("connexion", { erreur: "" });
    }
});

server.get("/connexion", estConnecté, (req, res) => {
    pageActuelle = "connexion";
    let erreur = req.query.erreur || "";
    res.render("connexion", { erreur: erreur });

});

//page d'accueil,  le site en général
server.get("/index", estConnecté, async (req, res) => {
    pageActuelle = "index";

    if (currentUser["admin"]) {
        const cadeaux = await getCadeaux();
        const everyClient = await getEveryClient();
        res.render("index", { everyClient: everyClient, sessionStart: sessionStart, currentUser: currentUser, cadeaux: cadeaux }); //rend la vue index avec le tableau cadeaux
    } else {
        const cadeaux = await getMesCadeaux();
        res.render("index", { sessionStart: sessionStart, currentUser: currentUser, cadeaux: cadeaux }); //rend la vue index avec le tableau cadeaux

    }
});



// route finale : l'argument next est ici ignoré
server.use((req, res) => {
    // gestion des requêtes non attendues
    res.status(404).send("Page not found");
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`)
});

