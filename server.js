const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");

const server = express();
const port = 8080;

const path = require("path");
server.set("view engine", "ejs");
server.set("views", path.join(__dirname, "views"));
server.use(express.static(path.join(__dirname, "public")));

server.use(session({
    secret: "secret_key", // Clé secrète pour signer la session
    resave: false,
    saveUninitialized: true
}));

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
    admin: false,
    id:0
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

async function getPanierUtilisateur(idUtilisateur) {
    const client = await pool.connect();
    try {
        const queryResult = await client.query(`
            SELECT p.id_cadeau, p.quantite, c.nom_cadeau, c.points_cadeau
            FROM panier p
            INNER JOIN cadeaux c ON p.id_cadeau = c.id_cadeau
            WHERE id_utilisateur = $1
        `, [idUtilisateur]);
        return queryResult.rows;
    } catch (error) {
        console.error('Erreur lors de la récupération du contenu du panier de l\'utilisateur :', error.message);
        return [];
    } finally {
        client.release();
    }
}

// Fonction pour récupérer les détails du cadeau à partir de l'ID du cadeau
async function getCadeauById(idCadeau) {
    const client = await pool.connect(); // Se connecte à la base de données
    try {
        const result = await client.query('SELECT * FROM cadeaux WHERE id_cadeau = $1', [idCadeau]);
        return result.rows[0]; // Renvoie la première ligne de résultats
    } catch (error) {
        console.error('Erreur lors de la récupération des détails du cadeau :', error.message);
        return null;
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
    user["id"]=0;

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
        currentUser["anniversaire"] = userData["anniversaire"];
        currentUser["points"] = userData["points_client"];
        currentUser["prenom"] = userData["prenom"];
        currentUser["nom"] = userData["nom"];
        currentUser["email"] = userData["email"];
        currentUser["admin"] = userData["admin"];
        currentUser["id"]=userData["id"];
        // authentification réussie, redirection de l'utilisateur vers la page d'accueil
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

//route pour l'ajout au panier
server.post("/ajouter-au-panier", async (req, res) => {
    const idCadeau = req.body.id_cadeau;

    // Récupérer l'ID de l'utilisateur depuis la session
    const idUtilisateur = currentUser.id; // Utilisez l'ID de l'utilisateur actuel

    // Ajouter le cadeau au panier de la base de données
    const client = await pool.connect();
    try {
        await client.query("INSERT INTO panier (id_utilisateur, id_cadeau, quantite) VALUES ($1, $2, $3)", [idUtilisateur, idCadeau, 1]);
        console.log("Cadeau ajouté au panier de la base de données avec succès.");
    } catch (error) {
        console.error("Erreur lors de l'ajout du cadeau au panier de la base de données:", error);
    } finally {
        client.release();
    }

    res.redirect("/index"); // Rediriger vers la page d'accueil
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

// page d'accueil,  le site en général
server.get("/index", estConnecté, async (req, res) => {
    pageActuelle = "index";
    const idUtilisateur = currentUser.id;
    const panier = await getPanierUtilisateur(idUtilisateur); // Récupérez le panier de l'utilisateur avec les détails des cadeaux
    if (currentUser.admin) {
        const cadeaux = await getCadeaux();
        res.render("index", { sessionStart: sessionStart, currentUser: currentUser, cadeaux: cadeaux, panier: panier }); // Rend la vue index avec le tableau de cadeaux et le panier de l'utilisateur
    } else {
        const cadeaux = await getMesCadeaux();
        res.render("index", { sessionStart: sessionStart, currentUser: currentUser, cadeaux: cadeaux, panier: panier }); // Rend la vue index avec le tableau de cadeaux et le panier de l'utilisateur
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

