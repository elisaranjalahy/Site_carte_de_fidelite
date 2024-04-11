--Construction des tables--
--TABLE CLIENT
CREATE TABLE CLIENTS (
    ID SERIAL PRIMARY KEY,
    PRENOM TEXT,
    NOM TEXT,
    PSEUDO TEXT UNIQUE,
    EMAIL TEXT UNIQUE,
    MOT_DE_PASSE TEXT,
    POINTS_CLIENT INTEGER,
    ANNIVERSAIRE DATE,
    ADMIN BOOLEAN DEFAULT FALSE
);

CREATE TABLE CADEAUX ( --affichage dynamique à faire--
    ID_CADEAU SERIAL PRIMARY KEY,
    NOM_CADEAU TEXT,
    POINTS_CADEAU INTEGER
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