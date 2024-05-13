const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const moment = require('moment');

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
const { cursorTo } = require("readline");
const pool = new pg.Pool({
    host: "localhost",
    database: "my_database",
    password: "raliz",
    port: 5432
});


//VARIABLE

let sessionStart = false;
let pageActuelle = "connexion";

//Informations user

const currentUser = {
    prenom: "",
    nom: "",
    pseudo: "",
    email: "",
    mdp: "",
    points: 0,
    anniversaire: "",
    admin: false,
    id: 0
};

function clearUser(user) {
    user["pseudo"] = "";
    user["mdp"] = "";
    user["anniversaire"] = "";
    user["points"] = 0;
    user["prenom"] = "";
    user["nom"] = "";
    user["email"] = "";
    user["admin"] = false;
    user["id"] = 0;

}

//FONCTIONS


//BDD

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
            SELECT p.id_cadeau, p.quantite, c.nom_cadeau, c.points_cadeau, p.couleur, p.taille
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

async function calculerTotalPanier(idUtilisateur) {
    const panierUtilisateur = await getPanierUtilisateur(idUtilisateur);
    let total = 0;
    panierUtilisateur.forEach(cadeau => {
        total += cadeau.points_cadeau * cadeau.quantite;
    });
    return total;
}


async function mettreAJourPointsUtilisateur(idUtilisateur, nouveauxPoints) {
    const client = await pool.connect(); // Se connecte à la base de données
    try {
        await client.query('UPDATE clients SET points_client = $1 WHERE id = $2', [nouveauxPoints, idUtilisateur]);
        console.log("Points de l'utilisateur mis à jour avec succès.");
        currentUser.points = nouveauxPoints;
    } catch (error) {
        console.error('Erreur lors de la mise à jour des points de l\'utilisateur :', error.message);
        throw error; // Lève l'erreur pour la traiter à un niveau supérieur
    } finally {
        client.release();
    }
}

async function viderPanierUtilisateur(idUtilisateur) {
    const client = await pool.connect(); // Se connecte à la base de données
    try {
        await client.query('DELETE FROM panier WHERE id_utilisateur = $1', [idUtilisateur]);
        console.log("Panier de l'utilisateur vidé avec succès.");
    } catch (error) {
        console.error('Erreur lors de la suppression des éléments du panier de l\'utilisateur :', error.message);
        throw error; // Lève l'erreur pour la traiter à un niveau supérieur
    } finally {
        client.release();
    }
}

async function supprimerCadeauPanierUtilisateur(idUtilisateur, idCadeauASupprimer, couleur, taille) {
    const client = await pool.connect(); // Se connecte à la base de données
    try {
        await client.query('DELETE FROM panier WHERE id_utilisateur = $1 AND id_cadeau = $2 AND couleur = $3 AND taille = $4', [idUtilisateur, idCadeauASupprimer, couleur, taille]);
        console.log("Cadeau du panier de l'utilisateur supprimé avec succès.");
    } catch (error) {
        console.error('Erreur lors de la suppression du cadeau du panier de l\'utilisateur :', error.message);
        throw error; // Lève l'erreur pour la traiter à un niveau supérieur
    } finally {
        client.release();
    }
}


async function reduireQuantiteCadeau(idUtilisateur, idCadeauASupprimer, couleur, taille) {
    const client = await pool.connect();
    try {
        await client.query('UPDATE panier SET quantite = quantite - 1 WHERE id_utilisateur = $1 AND id_cadeau = $2 AND couleur = $3 AND taille = $4', [idUtilisateur, idCadeauASupprimer, couleur, taille]);
        console.log("Quantité du cadeau réduite avec succès.");
    } catch (error) {
        console.error('Erreur lors de la réduction de la quantité du cadeau dans le panier :', error.message);
        throw error;
    } finally {
        client.release();
    }
}

async function renderErrorPage(res, errorMessage) {
    const idUtilisateur = currentUser.id;
    const panier = await getPanierUtilisateur(idUtilisateur); // Récupérez le panier de l'utilisateur avec les détails des cadeaux
    const totalPanier = await calculerTotalPanier(idUtilisateur);
    const dateAnniversaireUtilisateur = await getAnniv(idUtilisateur);
    const dateActuelle = moment();
    const dateAnniversaire = moment(dateAnniversaireUtilisateur);
    let anniversaireClass = null;
    if (dateActuelle.isSame(dateAnniversaire, 'day')) {
        anniversaireClass = "anniversaire";
    }
    if (currentUser.admin) {
        res.redirect("/gerante");
    } else {
        pageActuelle = "index";
        const cadeaux = await getMesCadeaux();
        res.render("index", { sessionStart: sessionStart, currentUser: currentUser, cadeaux: cadeaux, panier: panier, totalPanier: totalPanier, error: errorMessage, anniversaireClass: anniversaireClass }); // Rend la vue index avec le tableau de cadeaux et le panier de l'utilisateur
    }

}

async function getAnniv(id_utilisateur) {
    const client = await pool.connect(); // Se connecte à la base de données
    try {
        const result = await client.query('SELECT anniversaire FROM clients WHERE id = $1 ', [id_utilisateur]);
        return result.rows[0].anniversaire;
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'anniv:', error.message);
        throw error; // Lève l'erreur pour la traiter à un niveau supérieur

    } finally {
        client.release();
    }
}


//MIDDLEWARE

async function estConnecté(req, res, next) {

    if (sessionStart) { //connecté
        if (pageActuelle !== "connexion" /*chemin actuek*/ && req.path === "/connexion" /*chemin demandé*/) {
            sessionStart = false;
            let panier = req.session.panier || [];
            if (currentUser.admin) {
                const everyClient = await getEveryClient();
                res.render(pageActuelle, { err: false, errAjtClient: false, errAjtCadeau: false, everyClient: everyClient, sessionStart: false, currentUser: currentUser }); //rend la vue index avec le tableau cadeaux

            } else {
                const error = null;
                const anniv = null;
                res.render(pageActuelle, { err: false, sessionStart: false, currentUser: currentUser, panier: panier, error: error, anniversaireClass: anniv }); //rend la vue index avec le tableau cadeaux
            }
            clearUser(currentUser);

        } else {
            next();
        }


    } else { //pas connecté

        if (req.path !== "/connexion") { //demande d'acceder à une page du site
            if (req.path == "/connexion?erreur=authentification") {
                res.render(pageActuelle, { erreur: "authentification", sessionStart: sessionStart, newMdp: false });
            } else {
                res.render(pageActuelle, { erreur: "connexion", sessionStart: sessionStart, newMdp: false });


            }


        } else {
            next();
        }

    }

}

function premiereCo(req, res, next) {
    let erreur = req.query.erreur || "";
    if (currentUser.mdp === 'defaut') {
        res.render("connexion", { erreur: erreur, newMdp: true, currentUser: currentUser });
    } else {
        next();
    }
}





//GESTION DES ROUTES


//POST

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
        currentUser["id"] = userData["id"];
        // authentification réussie, redirection de l'utilisateur vers la page d'accueil

        console.log(resultat.rows);
        sessionStart = true; //on démarre une "session"
        if (currentUser.admin) {
            res.redirect("/gerante");
        } else {
            res.redirect("/index");
        }
    } else {
        // authentification ratée, redirection de l'utilisateur vers la page de connexion 
        res.redirect("/connexion?erreur=authentification");
    }

});

server.post("/deconnexion", (req, res) => {

    res.redirect("/connexion");
});

server.post("/ajouter-au-panier", async (req, res) => {
    const idCadeau = req.body.id_cadeau.toString();
    const idCadeauI = req.body.id_cadeau;
    const quantite = req.body.quantite;
    const couleur = req.body.couleur;
    const taille = req.body.taille;

    // Récupérer l'ID de l'utilisateur depuis la session
    const idUtilisateur = currentUser.id; // Utilisez l'ID de l'utilisateur actuel

    // Vérifier si le cadeau est déjà dans le panier de l'utilisateur
    const panierUtilisateur = await getPanierUtilisateur(idUtilisateur);

    const cadeauExistant = panierUtilisateur.find(cadeau => cadeau.id_cadeau.toString() === idCadeau && cadeau.couleur.toString() === couleur.toString() && cadeau.taille.toString() === taille.toString());

    //pour vérifier le stock du cadeau
    if (cadeauExistant) {
        // Si le cadeau est déjà dans le panier, mettre à jour la quantité
        const nouvelleQuantite = parseInt(cadeauExistant.quantite) + parseInt(quantite);
        const cad = await getCadeauById(idCadeauI);
        if (nouvelleQuantite > cad.stock) {
            const error = "Pas assez de stock pour : " + cadeauExistant.nom_cadeau;
            await renderErrorPage(res, error);
        } else {
            const client = await pool.connect();
            try {
                await client.query("UPDATE panier SET quantite = $1 WHERE id_utilisateur = $2 AND id_cadeau = $3 AND couleur=$4 AND taille=$5", [nouvelleQuantite, idUtilisateur, idCadeau, couleur, taille]);
                console.log("Quantité du cadeau mise à jour avec succès dans le panier.");
            } catch (error) {
                console.error("Erreur lors de la mise à jour de la quantité du cadeau dans le panier :", error);
            } finally {
                client.release();
            }
            res.redirect("/index"); // Rediriger vers la page d'accueil
        }
    } else {
        // Si le cadeau n'est pas dans le panier, l'ajouter avec une quantité de 1
        const client = await pool.connect();
        try {
            await client.query("INSERT INTO panier (id_utilisateur, id_cadeau, quantite, couleur, taille) VALUES ($1, $2, $3, $4, $5)", [idUtilisateur, idCadeau, quantite, couleur, taille]);
            console.log("Cadeau ajouté au panier de la base de données avec succès.");
        } catch (error) {
            console.error("Erreur lors de l'ajout du cadeau au panier de la base de données :", error);
        } finally {
            client.release();
        }
        res.redirect("/index"); // Rediriger vers la page d'accueil
    }

});

server.post("/ajouter_client", async (req, res) => {
    const { prenom, nom, pseudo, email, points, anniversaire, admin } = req.body;
    //decomposition de "anniversaire" pour avoir un format correct
    const dateAnniv = new Date(anniversaire);
    const jour = dateAnniv.getDate();
    const mois = dateAnniv.getMonth() + 1;
    const annee = dateAnniv.getFullYear();
    const newDate = annee + "-" + mois + "-" + jour;
    const client = await pool.connect();
    const mot_de_passe_par_defaut = "defaut";
    try {
        await client.query('INSERT INTO clients (prenom, nom, pseudo, email, mot_de_passe, points_client, anniversaire, admin) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [prenom, nom, pseudo, email, mot_de_passe_par_defaut, points, newDate, admin === "true"]);
        console.log("Nouveau client ajouté avec succès !");
        res.redirect("/gerante");
    } catch (error) {
        console.error('Erreur lors de l\'ajout du nouveau client :', error.message);
        const cadeaux = await getCadeaux();
        const everyClient = await getEveryClient();
        res.render("gerante", { errAjtClient: true, errAjtCadeau: false, everyClient: everyClient, sessionStart: sessionStart, currentUser: currentUser, cadeaux: cadeaux });
    } finally {
        client.release();
    }
});

server.post("/maj_client", async (req, res) => {

    const { prenom, nom, pseudo, email, points, anniversaire } = req.body;
    //decomposition de "anniversaire" pour avoir un format correct
    const dateAnniv = new Date(anniversaire);
    const jour = dateAnniv.getDate();
    const mois = dateAnniv.getMonth() + 1;
    const annee = dateAnniv.getFullYear();
    const newDate = annee + "-" + mois + "-" + jour;
    const client = await pool.connect();
    try {

        await client.query(
            `UPDATE clients 
             SET prenom = $1, nom = $2, email = $3, points_client = $4, anniversaire = $5 
             WHERE pseudo = $6`,
            [prenom, nom, email, points, newDate, pseudo]
        );
        console.log("Les modifications de @" + pseudo + " ont bien été prise en compte.");
        res.redirect("/gerante");
    } catch (error) {
        console.error('Erreur lors de l\'ajout du nouveau client :', error.message);
        const cadeaux = await getCadeaux();
        const everyClient = await getEveryClient();
        res.render("gerante", { errAjtClient: true, errAjtCadeau: false, everyClient: everyClient, sessionStart: sessionStart, currentUser: currentUser, cadeaux: cadeaux });
    } finally {

        client.release();
    }
});

server.post("/maj_cadeaux", async (req, res) => {
    const { points, stock, id_cadeau } = req.body;
    const client = await pool.connect();
    try {

        await client.query(
            `UPDATE CADEAUX
             SET POINTS_CADEAU = $1, STOCK = $2
             WHERE ID_CADEAU = $3`,
            [points, stock, id_cadeau]
        );
        console.log(req.body);
        console.log("Les modifications ont bien été prise en compte.");
        res.redirect("/pageCadeaux");
    } catch (error) {
        console.error('Erreur.', error.message);
        const cadeaux = await getCadeaux();
        const everyClient = await getEveryClient();
        res.render("pageCadeaux", { err: true, everyClient: everyClient, sessionStart: sessionStart, currentUser: currentUser, cadeaux: cadeaux });

    } finally {
        client.release();
    }

});

server.post("/newMDP", async (req, res) => {
    const { mdp, pseudo } = req.body;
    const client = await pool.connect();

    try {
        await client.query(
            `UPDATE clients 
         SET mot_de_passe = $1 WHERE pseudo = $2`,
            [mdp, pseudo]
        );
        console.log("Mot de passe mis à jour avec succès !");
        res.redirect("/connexion?erreur=connexion");
    } catch (error) {
        console.error('Erreur lors de l\'ajout du nouveau client :', error.message);
        res.redirect("/connexion?erreur=authentification");
    } finally {

        client.release();
    }
})

server.post("/valider-panier", async (req, res) => {
    const idUtilisateur = currentUser.id;
    const totalPanier = await calculerTotalPanier(idUtilisateur);
    if (currentUser.points >= totalPanier) {
        // Déduire les points du total des points de l'utilisateur
        const nouveauxPoints = currentUser.points - totalPanier;
        await mettreAJourPointsUtilisateur(idUtilisateur, nouveauxPoints);

        // Vider le panier de l'utilisateur
        await viderPanierUtilisateur(idUtilisateur);
        res.redirect("/index");
    } else {
        // Afficher un message d'échec
        await renderErrorPage(res, "Points insuffisants");
    }
});

server.post("/supprimer-panier", async (req, res) => {
    const idUtilisateur = currentUser.id;

    const idCadeauASupprimer = req.body.id_cadeau;
    const quantiteCadeau = req.body.quantite;
    const couleur = req.body.couleur;
    const taille = req.body.taille;


    if (quantiteCadeau > 1) {
        await reduireQuantiteCadeau(idUtilisateur, idCadeauASupprimer, couleur, taille);
        res.redirect("/index");
    } else {

        await supprimerCadeauPanierUtilisateur(idUtilisateur, idCadeauASupprimer, couleur, taille);
        res.redirect("/index");
    }
});

server.post("/ajouter-cadeau", async (req, res) => {
    const { nom, points, image, stock, menu } = req.body;
    const cadeau = await pool.connect();
    try {
        await cadeau.query('INSERT INTO CADEAUX (NOM_CADEAU, POINTS_CADEAU, IMAGE_CADEAU, STOCK, MENU) VALUES ($1, $2, $3, $4, $5)',
            [nom, points, image, stock, menu]);
        console.log("Nouveau cadeau ajouté avec succès !");
        res.redirect("/gerante");
    } catch (error) {
        console.error('Erreur lors de l\'ajout du nouveau cadeau :', error.message);
        const cadeaux = await getCadeaux();
        const everyClient = await getEveryClient();
        res.render("gerante", { errAjtClient: false, errAjtCadeau: true, everyClient: everyClient, sessionStart: sessionStart, currentUser: currentUser, cadeaux: cadeaux });
    } finally {
        cadeau.release();

    }

});

server.post("/supprimer_client", async (req, res) => {
    const pseu = req.body.pseudo;
    const pseudo = await pool.connect();
    try {
        await pseudo.query('DELETE FROM clients WHERE pseudo = $1', [pseu]);
        console.log("Le client @" + pseu + " a bien été supprimé : ");
        res.redirect("/gerante");
    } catch (error) {
        console.error('Erreur lors de l\'ajout du nouveau cadeau :', error.message);
        res.status(500).send("Une erreur s'est produite lors de la suppression du client.");
    } finally {
        pseudo.release();

    }
});


server.post("/supprimer_cadeau", async (req, res) => {
    const id_cadeau = req.body.id_cadeau;
    const cadeau = await pool.connect();
    try {
        await cadeau.query('DELETE FROM cadeaux WHERE id_cadeau = $1', [id_cadeau]);
        console.log("Cadeau supprimé avec succès !");
        res.redirect("/pageCadeaux");
    } catch (error) {
        console.error('Erreur lors de la suppression du cadeau :', error.message);
        res.status(500).send("Une erreur s'est produite lors de la suppression du client.");
    } finally {
        cadeau.release();

    }
});



//GET

//premiere page affichée au lancement du serveu: page de connexion
server.get("/", (req, res) => {
    pageActuelle = "connexion";
    if (req.query.erreur === "authentification") {
        res.render("connexion", { erreur: "authentification", newMdp: false });
    }
    if (req.query.erreur === "connexion") {
        res.render("connexion", { erreur: "connexion", newMdp: false });
    }
    if (req.query.erreur !== "authentification" && req.query.erreur !== "authentification") {
        res.render("connexion", { erreur: "", newMdp: false });
    }
});

server.get("/connexion", estConnecté, (req, res) => {
    pageActuelle = "connexion";
    let erreur = req.query.erreur || "";
    res.render("connexion", { erreur: erreur, newMdp: false });

});

// page d'accueil,  le site en général
server.get("/index", estConnecté, premiereCo, async (req, res) => {
    const idUtilisateur = currentUser.id;
    const panier = await getPanierUtilisateur(idUtilisateur); // Récupérez le panier de l'utilisateur avec les détails des cadeaux
    const totalPanier = await calculerTotalPanier(idUtilisateur);
    const dateAnniversaireUtilisateur = await getAnniv(idUtilisateur);
    const dateActuelle = moment();
    const dateAnniversaire = moment(dateAnniversaireUtilisateur);
    let anniversaireClass = null;


    if (dateActuelle.month() === dateAnniversaire.month() && dateActuelle.date() === dateAnniversaire.date()) {
        anniversaireClass = "anniversaire";
    }
    if (currentUser.admin) {
        res.redirect("/gerante");
    } else {
        pageActuelle = "index";
        const cadeaux = await getMesCadeaux();
        const error = null;
        res.render("index", { sessionStart: sessionStart, currentUser: currentUser, cadeaux: cadeaux, panier: panier, totalPanier: totalPanier, error: error, anniversaireClass: anniversaireClass }); // Rend la vue index avec le tableau de cadeaux et le panier de l'utilisateur
    }
});

server.get("/gerante", estConnecté, async (req, res) => {
    if (!currentUser.admin) {
        const page = "/" + pageActuelle;
        res.redirect("/" + pageActuelle);

    } else {


        const everyClient = await getEveryClient();
        pageActuelle = "gerante";
        res.render("gerante", { errAjtClient: false, errAjtCadeau: false, everyClient: everyClient, sessionStart: sessionStart, currentUser: currentUser });
    }
});



server.get("/pageCadeaux", estConnecté, async (req, res) => {
    if (!currentUser.admin) {
        const page = "/" + pageActuelle;
        res.redirect("/" + pageActuelle);

    } else {
        const cadeaux = await getCadeaux();
        const everyClient = await getEveryClient();
        pageActuelle = "pageCadeaux";
        res.render("pageCadeaux", { err: false, everyClient: everyClient, sessionStart: sessionStart, currentUser: currentUser, cadeaux: cadeaux });
    }

});



server.use((req, res) => {
    // gestion des requêtes non attendues
    res.status(404).send("Page not found");
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`)
});

