Groupe 29
HAMME Laure,
RANJALAHY Elisa

Pour correctement utiliser notre site de carte de fidélité, vous devez suivre les indications suivantes dans **l'ordre donné.**

**SOMMAIRE**______________________________________________________________________________________________________________________________________________________

I) Préparation de l'environnement
    a) BDD
    b) LANCEMENT DU SERVEUR

II) Utilisation
    a) UTILISATEUR PREDEFINIS

__________________________________________________________________________________________________________________________________________________________________

**I)Préparation de l'environnement**


***a) BDD***

Pour créer la base de données :

***Connection à Postgres***
0) Se placer à la racine du projet
1) Entrez la commande `psql` puis `\password`. Redéfinissez votre mot de passe postgres comme étant `raliz`.
2) Entrez la commande `\q` ou `quit`
3) Entrez la commande : `psql -U id -W postgres` où ***id*** est votre identifiant et entrez le mot de passe : **raliz** 

***Vous êtes à présent dans postgres***

4) Entrez la requête : `create database my_database;`
5) Entrez la commande : `\c my_database` et entrez le mot de passe **raliz** <!-- cela vous connectera à la base de données>
6) Entrez la commande : `\i database/build_database.sql` <!--va construire les tables-->
7) Entrez la commande : `\quit` ou `\q` <!--ce qui vous fera sortir de Postgres-->


***Informations supplémentaires:***

Pour supprimer la base de données et se deconnecter :

0) Répétez les étapes précédentes 0 et 3 (uniquement)

***Dans postgres*** 


0) Répétez les étapes 0 et 1 précédentes.
1) Entrez la commande : `\i database/delete_database.sql`
2) Entrez la commande : `\quit` ou `\q` <!--ce qui vous fera sortir de Postgres-->


***b)LANCEMENT DU SERVEUR***

Une fois l'étape 7 précédente (dans I.a) effectuée:

Toujours à la racine, entrez la commmande : `node server.js` puis rendez-vous à l'url affiché dans votre terminal.
Vous pouvez à présent vous connecter et naviguer sur le site.


**II) Utilisation**

***a) UTILISATEUR PREDEFINIS***

Pour essayer la connection en tant qu'admin : entrez le `pseudo : bigboss` et le `mot de passe : bossbig`
Pour essayer la connection en tant que simple client : entrez le `pseudo : grimpette7A` et le `mot de passe : JeanBav`

_________________________________________________________________________________________________________________________________________
