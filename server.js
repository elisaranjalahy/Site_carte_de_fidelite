const express = require("express");
const bodyParser = require("body-parser");
const server = express();
const port = 8080;
const view = "./view";
server.set("view engine", "ejs");

// bodyParser permet d'analyser les données du corps des requêtes
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

//creation de la pool
const pg = require("pg");
const pool = new pg.Pool({
    host: "localhost",
    database: "my_database",
    password: "raliz",
    port: 5432
});



let cadeaux = []; //tous les cadeaux proposés par le site


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




//GESTION DES ROUTES

// route pour gérer la soumission du formulaire de connexion
server.post("/connexion", async (req, res) => {

    console.log(`ICI`);
    const { pseudo, mdp } = req.body; //recupere les données du formulaire soumis
    const client = await pool.connect(); //se conencte à la bdd
    try {
        // vérifier si les informations de connexion correspondent à une entrée dans la table client
        const resultat = await client.query('SELECT * FROM clients WHERE pseudo = $1 AND mot_de_passe = $2', [pseudo, mdp]);

        if (resultat.rows.length > 0) {
            // authentification réussie, redirection de l'utilisateur vers la page d'accueil
            res.redirect("/index");
        } else {
            // authentification ratée, redirection de l'utilisateur vers la page de connexion 
            res.redirect("/connexion");
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
    res.render("connexion");
});

server.get("/connexion", (req, res) => {
    res.render("connexion");
});

//page d'accueil,  le site en général
server.get("/index", (req, res) => {
    res.render("index", { cadeaux: cadeaux }); //rend la vue index avec le tableau cadeaux
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`)
});

