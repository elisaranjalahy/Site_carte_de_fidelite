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
        currentUser.points=nouveauxPoints;
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


async function supprimerCadeauPanierUtilisateur(idUtilisateur, idCadeauASupprimer) {
    const client = await pool.connect(); // Se connecte à la base de données
    try {
        await client.query('DELETE FROM panier WHERE id_utilisateur = $1 AND id_cadeau = $2', [idUtilisateur, idCadeauASupprimer]);
        console.log("Cadeau du panier de l'utilisateur supprimé avec succès.");
    } catch (error) {
        console.error('Erreur lors de la suppression du cadeau du panier de l\'utilisateur :', error.message);
        throw error; // Lève l'erreur pour la traiter à un niveau supérieur
    } finally {
        client.release();
    }
}

async function reduireQuantiteCadeau(idUtilisateur, idCadeauASupprimer) {
    const client = await pool.connect();
    try {
        await client.query('UPDATE panier SET quantite = quantite - 1 WHERE id_utilisateur = $1 AND id_cadeau = $2', [idUtilisateur, idCadeauASupprimer]);
        console.log("Quantité du cadeau réduite avec succès.");
    } catch (error) {
        console.error('Erreur lors de la réduction de la quantité du cadeau dans le panier :', error.message);
        throw error;
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
            let panier = req.session.panier || [];
            res.render(pageActuelle, { sessionStart: false, currentUser: currentUser, panier: panier, erreur: "" }); //rend la vue index avec le tableau cadeaux
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
    user["id"] = 0;

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
        currentUser["id"] = userData["id"];
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
    const idCadeau = req.body.id_cadeau.toString();
    const idCadeauI=req.body.id_cadeau;
    const quantite=req.body.quantite;

    // Récupérer l'ID de l'utilisateur depuis la session
    const idUtilisateur = currentUser.id; // Utilisez l'ID de l'utilisateur actuel

    // Vérifier si le cadeau est déjà dans le panier de l'utilisateur
    const panierUtilisateur = await getPanierUtilisateur(idUtilisateur);

    const cadeauExistant = panierUtilisateur.find(cadeau => cadeau.id_cadeau.toString() === idCadeau); // Convertir en chaîne de caractères

    //pour vérifier le stock du cadeau
    if (cadeauExistant) {
        // Si le cadeau est déjà dans le panier, mettre à jour la quantité
        const nouvelleQuantite = parseInt(cadeauExistant.quantite) + parseInt(quantite);
        const cad=await getCadeauById(idCadeauI);
        if(nouvelleQuantite>cad.stock){
            console.log("Pas assez de stock pour : ",cadeauExistant.nom_cadeau);
        }else {
        const client = await pool.connect();
        try {
            await client.query("UPDATE panier SET quantite = $1 WHERE id_utilisateur = $2 AND id_cadeau = $3", [nouvelleQuantite, idUtilisateur, idCadeau]);
            console.log("Quantité du cadeau mise à jour avec succès dans le panier.");
        } catch (error) {
            console.error("Erreur lors de la mise à jour de la quantité du cadeau dans le panier :", error);
        } finally {
            client.release();
        }
        }
    } else {
        // Si le cadeau n'est pas dans le panier, l'ajouter avec une quantité de 1
        const client = await pool.connect();
        try {
            await client.query("INSERT INTO panier (id_utilisateur, id_cadeau, quantite) VALUES ($1, $2, $3)", [idUtilisateur, idCadeau, quantite]);
            console.log("Cadeau ajouté au panier de la base de données avec succès.");
        } catch (error) {
            console.error("Erreur lors de l'ajout du cadeau au panier de la base de données :", error);
        } finally {
            client.release();
        }
    }

    res.redirect("/index"); // Rediriger vers la page d'accueil
});



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
        console.log("Points insuffisants pour valider le panier." );
        res.redirect("/index");
    }
});

server.post("/supprimer-panier", async (req, res) => {
        const idUtilisateur = currentUser.id;

        const idCadeauASupprimer = req.body.id_cadeau;
        const quantiteCadeau = req.body.quantite; 

       
        if (quantiteCadeau > 1) {
            await reduireQuantiteCadeau(idUtilisateur, idCadeauASupprimer);
            res.redirect("/index");
        } else {
            
            await supprimerCadeauPanierUtilisateur(idUtilisateur, idCadeauASupprimer);
            res.redirect("/index");
        }
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

    const idUtilisateur = currentUser.id;
    const panier = await getPanierUtilisateur(idUtilisateur); // Récupérez le panier de l'utilisateur avec les détails des cadeaux
    const totalPanier = await calculerTotalPanier(idUtilisateur);
    if (currentUser.admin) {
        const cadeaux = await getCadeaux();
        const everyClient = await getEveryClient();
        pageActuelle = "admin";
        res.render("admin", { everyClient: everyClient, sessionStart: sessionStart, currentUser: currentUser, cadeaux: cadeaux, panier: panier, totalPanier: totalPanier }); // Rend la vue index avec le tableau de cadeaux et le panier de l'utilisateur
    } else {
        pageActuelle = "index";
        const cadeaux = await getMesCadeaux();
        res.render("index", { sessionStart: sessionStart, currentUser: currentUser, cadeaux: cadeaux, panier: panier, totalPanier: totalPanier }); // Rend la vue index avec le tableau de cadeaux et le panier de l'utilisateur
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

