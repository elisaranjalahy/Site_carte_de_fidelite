Groupe 29
HAMME Laure,
RANJALAHY Elisa

Pour correctement utiliser notre site de carte de fidélité, vous devez suivre les indications suivantes dans l'ordre donné.

**A-BDD**

Pour créer la base de données :

***Connection à Postgres***
1) Se placer dans le dossier : database
2) Entrez la commande : `psql -U id -W postgres` où ***id*** est votre identifiant et entrez le mot de passe : **raliz** 

***Vous êtes à présent dans postgres***

3) Entrez la requête : `create database my_database;`
4) Entrez la commande : `\c my_database` et entrez le mot de passe **raliz** <!-- cela vous connectera à la base de données>
5) Entrez la commande : `\i build_database.sql` <!--va construire les tables-->
6) Entrez la commande : `\quit` ou `\q` <!--ce qui vous fera sortir de Postgres-->
7) Entrez la commande ; `cd ..` <!--pour revenir à la racine-->


***Informations supplémentaires:***

Pour supprimer la base de données et se deconnecter :

***Dans postgres*** 

1) Entrez la commande : `\i delete_databse.sql`
2) Entrez la commande : `\quit` ou `\q` <!--ce qui vous fera sortir de Postgres-->

_________________________________________________________________________________________________________________________________________

**B-LANCER LE SITE**

Une fois l'étape 7 précédente effectuée :

Entrez la commmande : `node server.js` puis rendez-vous à l'url affiché dans votre terminal.
Vous pouvez à présent vous connecter et naviguer sur le site.


***Informations***

Pour essayer la connection en tant qu'admin : entrez le `pseudo : bigboss` et le `mot de passe : bossbig`
Pour essayer la connection en tant que simple client : entrez le `pseudo : grimpette7A` et le `mot de passe : JeanBav`

_________________________________________________________________________________________________________________________________________
