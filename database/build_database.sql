--Creation et Remplissage des tables--

--Creation

CREATE TABLE CLIENTS (
    ID SERIAL PRIMARY KEY,
    PRENOM TEXT,
    NOM TEXT,
    PSEUDO TEXT UNIQUE,
    EMAIL TEXT UNIQUE,
    MOT_DE_PASSE TEXT NOT NULL,
    POINTS_CLIENT INTEGER DEFAULT 0,
    ANNIVERSAIRE VARCHAR(10),
    ADMIN BOOLEAN DEFAULT FALSE
);

CREATE TABLE CADEAUX (
    ID_CADEAU SERIAL PRIMARY KEY,
    NOM_CADEAU TEXT,
    POINTS_CADEAU INTEGER,
    IMAGE_CADEAU TEXT,
    STOCK INTEGER,
    ANNIV BOOLEAN DEFAULT FALSE,
    MENU BOOLEAN
);

CREATE TABLE PANIER (
    ID SERIAL PRIMARY KEY,
    ID_UTILISATEUR INTEGER,
    ID_CADEAU INTEGER,
    QUANTITE INTEGER,
    COULEUR TEXT,
    TAILLE TEXT,
    FOREIGN KEY (ID_UTILISATEUR) REFERENCES CLIENTS(ID),
    FOREIGN KEY (ID_CADEAU) REFERENCES CADEAUX(ID_CADEAU)
);

--REMPLISSAGE

INSERT INTO CLIENTS (
    PRENOM,
    NOM,
    PSEUDO,
    EMAIL,
    MOT_DE_PASSE,
    POINTS_CLIENT,
    ANNIVERSAIRE,
    ADMIN
) VALUES (
    'Big',
    'Boss',
    'bigboss',
    'bigboss@gmail.com',
    'bossbig',
    101,
    '2003-06-10',
    TRUE
),
(
    'Jean',
    'Bav',
    'grimpette7A',
    'jeanbav@gmail.com',
    'JeanBav',
    100,
    '1999-05-17',
    FALSE
),
(
    'Jourd',
    'Anniv',
    'jourdanniv',
    'fetefete@gmail.com',
    'AZERTY',
    100,
    '2001-05-12',
    FALSE
),
(
    'Jana',
    'Ayadi',
    'janaze',
    'janaze@gmail.com',
    'JanaAyadi',
    100,
    '2003-06-10',
    FALSE
);

INSERT INTO CADEAUX (
    NOM_CADEAU,
    POINTS_CADEAU,
    IMAGE_CADEAU,
    STOCK,
    ANNIV,
    MENU
) VALUES (
    'Gâteau anniversaire',
    0,
    '/images/image16.jpeg',
    1,
    TRUE,
    FALSE
),
(
    'Airpods',
    100,
    '/images/image14.jpeg',
    1,
    TRUE,
    FALSE
);

INSERT INTO CADEAUX (
    NOM_CADEAU,
    POINTS_CADEAU,
    IMAGE_CADEAU,
    STOCK,
    MENU
) VALUES (
    'Lot de 4 Strap',
    15,
    '/images/image10.jpeg',
    5,
    TRUE
),
(
    'Une séance bloc avec François Civil',
    350,
    '/images/image2.jpeg',
    5,
    FALSE
),
(
    'Chaussons Scarpa',
    1000,
    '/images/image3.jpeg',
    5,
    TRUE
),
(
    'Brosse à prise',
    15,
    '/images/image4.jpeg',
    5,
    TRUE
),
(
    'Carte de 10 entrée à Climb Up',
    600,
    '/images/image5.jpeg',
    5,
    FALSE
),
(
    'Crashpad SNAP',
    250,
    '/images/image6.jpeg',
    5,
    FALSE
),
(
    'Magnésie Liquide SNAP',
    20,
    '/images/image7.jpeg',
    5,
    FALSE
),
(
    'Magnésie en poudre',
    20,
    '/images/image8.jpeg',
    5,
    FALSE
),
(
    'Sac à magnésie ARCTERYX',
    150,
    '/images/image9.jpeg',
    5,
    FALSE
),
(
    'Lot de 2 Mousquetons',
    5,
    '/images/image1.jpeg',
    5,
    TRUE
),
(
    'T-shirt Patagonia Bleu Marine',
    25,
    '/images/image11.jpeg',
    5,
    FALSE
),
(
    'Box de 10 prises avec vis',
    40,
    '/images/image12.jpeg',
    5,
    FALSE
),
(
    'Poutre',
    120,
    '/images/image13.jpeg',
    5,
    FALSE
),
(
    'Lot de 8 chouchous',
    10,
    '/images/image15.jpeg',
    5,
    TRUE
);