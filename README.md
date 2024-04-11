Groupe 29
HAMME Laure
RANJALAHY Elisa

**BDD**

Pour créer la base de données :

***Connection à Postgres***
1) Se placer dans le dossier : database
2) Entrez la commande : `psql -U elisa -W postgres` et entrez le mot de passe : **raliz**

***Dans postgres***

3) Entrez la requête `create database my_database;`
4) Entrez la commande `\c my_database` et entrez le mot de passe **raliz** <!-- permet de se connecter à la base de données>
5) Entrez la commande `\i build_database.sql` <!--va construire les tables-->


Pour supprimer la base de données et se deconnecter :

***Dans postgres*** 

1) Entrez la commande : `\i delete_databse.sql`
2) Entrez la commande : `\quit` ou `\q` <!--ce qui vous fera sortir de Postgres-->
3) Entrez la commande ; `cd ..` <!--pour revenir à la racine-->

**Lancer le site**

Entrez la commmande `node server.js` puis rendez-vous à l'url affiché dans votre terminal.