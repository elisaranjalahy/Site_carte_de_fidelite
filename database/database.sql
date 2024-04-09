--creation de la base de donnée--
CREATE DATABASE DATABASE;

--connection à la bdd--
\C DATABASE;

--Creation des tables--
--TABLE CLIENT
CREATE TABLE CLIENT (
    ID SERIAL PRIMARY KEY,
    NOM TEXT,
    PRENOM TEXT,
    PSEUDO TEXT UNIQUE,
    EMAIL TEXT UNIQUE,
    MDP TEXT,
    POINTS INTEGER,
    ANNIVERSAIRE DATE,
    ADMIN BOOLEAN DEFAULT FALSE
);

--\quit revoir pcq symbole qui semble non reconnu--