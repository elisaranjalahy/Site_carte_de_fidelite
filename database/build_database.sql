--CREATION des tables--



CREATE TABLE CLIENTS (
    ID SERIAL PRIMARY KEY,
    PRENOM TEXT,
    NOM TEXT,
    PSEUDO TEXT UNIQUE,
    EMAIL TEXT UNIQUE,
    MOT_DE_PASSE TEXT NOT NULL,
    POINTS_CLIENT INTEGER,
    ANNIVERSAIRE DATE NOT NULL,
    ADMIN BOOLEAN DEFAULT FALSE
);

CREATE TABLE CADEAUX (
    ID_CADEAU SERIAL PRIMARY KEY,
    NOM_CADEAU TEXT,
    POINTS_CADEAU INTEGER,
    IMAGE_CADEAU TEXT
);


CREATE TABLE PANIER (
    id SERIAL PRIMARY KEY,
    id_utilisateur INTEGER,
    id_cadeau INTEGER,
    quantite INTEGER,
    FOREIGN KEY (id_utilisateur) REFERENCES CLIENTS(id),
    FOREIGN KEY (id_cadeau) REFERENCES CADEAUX(id_cadeau)
);


--REMPLISSAGE des tables
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
    '2000-05-20',
    FALSE
);

INSERT INTO CADEAUX (
    NOM_CADEAU,
    POINTS_CADEAU,
    IMAGE_CADEAU
) VALUES (
    'Lot de 2 Mousquetons',
    5,
    '/images/image1.jpeg'
),
(
    'Une séance bloc avec François Civil',
    350,
    '/images/image2.jpeg'
),
(
    'Chaussons Scarpa',
    1000,
    '/images/image3.jpeg'
),
(
    'Brosse à prise',
    15,
    '/images/image4.jpeg'
),
(
    'Carte de 10 entrée à Climb Up',
    600,
    '/images/image5.jpeg'
),
(
    'Crashpad SNAP',
    250,
    '/images/image6.jpeg'
),
(
    'Magnésie Liquide SNAP',
    20,
    '/images/image7.jpeg'
),
(
    'Magnésie en poudre',
    20,
    '/images/image8.jpeg'
),
(
    'Sac à magnésie ARCTERYX',
    150,
    '/images/image9.jpeg'
),
(
    'Lot de 4 Strap',
    15,
    '/images/image10.jpeg'
),
(
    'T-shirt Patagonia Bleu Marine',
    25,
    '/images/image11.jpeg'
),
(
    'Box de 10 prises avec vis',
    40,
    '/images/image12.jpeg'
),
(
    'Poutre',
    120,
    '/images/image13.jpeg'
),
(
    'Ecouteurs Bluetooth',
    300,
    '/images/image14.jpeg'
),
(
    'Lot de 8 chouchous',
    10,
    '/images/image15.jpeg'
);