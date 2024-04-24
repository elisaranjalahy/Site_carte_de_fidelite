--CREATION des tables--

CREATE TABLE CLIENTS (
    ID SERIAL PRIMARY KEY,
    PRENOM TEXT,
    NOM TEXT,
    PSEUDO TEXT UNIQUE,
    EMAIL TEXT UNIQUE,
    MOT_DE_PASSE TEXT,
    POINTS_CLIENT INTEGER,
    ADMIN BOOLEAN DEFAULT FALSE
);

CREATE TABLE CADEAUX ( --affichage dynamique à faire--
    ID_CADEAU SERIAL PRIMARY KEY,
    NOM_CADEAU TEXT,
    POINTS_CADEAU INTEGER,
    IMAGE_CADEAU TEXT
);

CREATE TABLE LISTE_CADEAUX (
    ID_CADEAU INTEGER,
    NOM_CADEAU TEXT,
    POINTS_CADEAU INTEGER
);

CREATE TABLE PANIER ( --mettre dans un tableau js dynamique--
    ID_CADEAU INTEGER,
    NOM_CADEAU TEXT,
    POINTS_CADEAU INTEGER
);

--REMPLISSAGE des tables
INSERT INTO CLIENTS (
    PRENOM,
    NOM,
    PSEUDO,
    EMAIL,
    MOT_DE_PASSE
) VALUES (
    'Big',
    'Boss',
    'bigboss',
    'bigboss@gmail.com',
    'bossbig'
),
(
    'Jean',
    'Bav',
    'grimpette7A',
    'jeanbav@gmail.com',
    'JeanBav'
);

INSERT INTO CADEAUX (
    NOM_CADEAU,
    POINTS_CADEAU,
    IMAGE_CADEAU
) VALUES (
    'mousqueton',
    5,
    '/images/images1.jpeg'
);