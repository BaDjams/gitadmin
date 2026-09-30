-- Contenu de démonstration. Tout est provisoire : chaque donnée fictive est marquée [À REMPLACER].

-- Données chiffrées (capacité, surface, frais, caution, tarifs) : [À REMPLACER].
INSERT INTO gites (id, slug, capacite, chambres, surface_m2, equipements, frais_menage, caution, ordre) VALUES (1, 'le-ruisseau', 2, 1, 45, '["wifi", "cuisine_equipee", "lave_linge", "terrasse", "jardin", "acces_ruisseau", "parking", "draps_fournis", "chauffage"]', 50, 300, 1);
INSERT INTO gites_textes (gite_id, langue, nom, accroche, description, regles) VALUES (1, 'fr', 'Le Ruisseau', '[À REMPLACER] Le gîte le plus proche de l’eau, pour un séjour à deux au bord du ruisseau.', 'Le Ruisseau est posé au bord de l’eau, au fond de la propriété. On s’y réveille au son du courant, et la terrasse donne directement sur la berge.

L’intérieur est simple et chaleureux : un séjour avec coin cuisine, une chambre au calme, une salle d’eau. [À REMPLACER : description réelle.]

Idéal pour un couple ou une petite famille qui cherche à se reposer, à 3 km de Fécamp et de la mer.', '[À REMPLACER] Non-fumeur. Animaux : à préciser. Arrivée à partir de 16 h, départ avant 11 h.');
INSERT INTO gites_textes (gite_id, langue, nom, accroche, description, regles) VALUES (1, 'en', 'Le Ruisseau', '[TO BE REPLACED] The cottage closest to the water, for a stay for two by the stream.', 'Le Ruisseau sits by the water at the far end of the property. You wake up to the sound of the stream, and the terrace opens straight onto the bank.

Inside, it is simple and warm: a living room with a kitchen area, a quiet bedroom and a shower room. [TO BE REPLACED: actual description.]

Ideal for a couple or a small family looking to rest, 3 km from Fécamp and the sea.', '[TO BE REPLACED] Non-smoking. Pets: to be confirmed. Check-in from 4 pm, check-out before 11 am.');
INSERT INTO tarifs (gite_id, saison, prix_nuit, sejour_min) VALUES (1, 'basse', 70, 2);
INSERT INTO tarifs (gite_id, saison, prix_nuit, sejour_min) VALUES (1, 'moyenne', 85, 3);
INSERT INTO tarifs (gite_id, saison, prix_nuit, sejour_min) VALUES (1, 'haute', 100, 7);
INSERT INTO photos (gite_id, cle_pleine, cle_miniature, largeur, hauteur, largeur_min, hauteur_min, alt_fr, alt_en, ordre) VALUES (1, 'placeholder/le-ruisseau-1.svg', 'placeholder/le-ruisseau-1.svg', 1600, 1067, 400, 267, 'Photo de démonstration : la terrasse au bord du ruisseau', 'Demo photo: the terrace by the stream', 1);
INSERT INTO photos (gite_id, cle_pleine, cle_miniature, largeur, hauteur, largeur_min, hauteur_min, alt_fr, alt_en, ordre) VALUES (1, 'placeholder/le-ruisseau-2.svg', 'placeholder/le-ruisseau-2.svg', 1600, 1067, 400, 267, 'Photo de démonstration : le séjour', 'Demo photo: the living room', 2);
INSERT INTO photos (gite_id, cle_pleine, cle_miniature, largeur, hauteur, largeur_min, hauteur_min, alt_fr, alt_en, ordre) VALUES (1, 'placeholder/le-ruisseau-3.svg', 'placeholder/le-ruisseau-3.svg', 1600, 1067, 400, 267, 'Photo de démonstration : la chambre', 'Demo photo: the bedroom', 3);
INSERT INTO photos (gite_id, cle_pleine, cle_miniature, largeur, hauteur, largeur_min, hauteur_min, alt_fr, alt_en, ordre) VALUES (1, 'placeholder/le-ruisseau-4.svg', 'placeholder/le-ruisseau-4.svg', 1600, 1067, 400, 267, 'Photo de démonstration : le ruisseau', 'Demo photo: the stream', 4);

INSERT INTO gites (id, slug, capacite, chambres, surface_m2, equipements, frais_menage, caution, ordre) VALUES (2, 'le-colombier', 5, 2, 80, '["wifi", "cuisine_equipee", "lave_linge", "lave_vaisselle", "poele_bois", "jardin", "barbecue", "parking", "lit_bebe", "draps_fournis", "chauffage"]', 70, 500, 2);
INSERT INTO gites_textes (gite_id, langue, nom, accroche, description, regles) VALUES (2, 'fr', 'Le Colombier', '[À REMPLACER] Un gîte de caractère en pierre et colombages, pensé pour les familles.', 'Le Colombier a gardé l’âme des maisons normandes : pierre, colombages et poutres apparentes. Le séjour s’organise autour du poêle, pour les soirées d’automne comme pour les retours de plage.

À l’étage, deux chambres accueillent parents et enfants. [À REMPLACER : description réelle.]

Le jardin et la propriété offrent de l’espace pour jouer, lire ou simplement ne rien faire.', '[À REMPLACER] Non-fumeur. Animaux : à préciser. Arrivée à partir de 16 h, départ avant 11 h.');
INSERT INTO gites_textes (gite_id, langue, nom, accroche, description, regles) VALUES (2, 'en', 'Le Colombier', '[TO BE REPLACED] A characterful stone and half-timbered cottage, designed for families.', 'Le Colombier has kept the soul of Norman houses: stone, half-timbering and exposed beams. The living room is arranged around the stove, for autumn evenings as well as after a day at the beach.

Upstairs, two bedrooms welcome parents and children. [TO BE REPLACED: actual description.]

The garden and grounds give room to play, read, or simply do nothing.', '[TO BE REPLACED] Non-smoking. Pets: to be confirmed. Check-in from 4 pm, check-out before 11 am.');
INSERT INTO tarifs (gite_id, saison, prix_nuit, sejour_min) VALUES (2, 'basse', 95, 2);
INSERT INTO tarifs (gite_id, saison, prix_nuit, sejour_min) VALUES (2, 'moyenne', 115, 3);
INSERT INTO tarifs (gite_id, saison, prix_nuit, sejour_min) VALUES (2, 'haute', 140, 7);
INSERT INTO photos (gite_id, cle_pleine, cle_miniature, largeur, hauteur, largeur_min, hauteur_min, alt_fr, alt_en, ordre) VALUES (2, 'placeholder/le-colombier-1.svg', 'placeholder/le-colombier-1.svg', 1600, 1067, 400, 267, 'Photo de démonstration : la façade à colombages', 'Demo photo: the half-timbered front', 1);
INSERT INTO photos (gite_id, cle_pleine, cle_miniature, largeur, hauteur, largeur_min, hauteur_min, alt_fr, alt_en, ordre) VALUES (2, 'placeholder/le-colombier-2.svg', 'placeholder/le-colombier-2.svg', 1600, 1067, 400, 267, 'Photo de démonstration : le séjour et le poêle', 'Demo photo: the living room and stove', 2);
INSERT INTO photos (gite_id, cle_pleine, cle_miniature, largeur, hauteur, largeur_min, hauteur_min, alt_fr, alt_en, ordre) VALUES (2, 'placeholder/le-colombier-3.svg', 'placeholder/le-colombier-3.svg', 1600, 1067, 400, 267, 'Photo de démonstration : une chambre', 'Demo photo: a bedroom', 3);
INSERT INTO photos (gite_id, cle_pleine, cle_miniature, largeur, hauteur, largeur_min, hauteur_min, alt_fr, alt_en, ordre) VALUES (2, 'placeholder/le-colombier-4.svg', 'placeholder/le-colombier-4.svg', 1600, 1067, 400, 267, 'Photo de démonstration : le jardin', 'Demo photo: the garden', 4);

INSERT INTO gites (id, slug, capacite, chambres, surface_m2, equipements, frais_menage, caution, ordre) VALUES (3, 'le-clos', 6, 3, 100, '["wifi", "cuisine_equipee", "lave_linge", "lave_vaisselle", "terrasse", "jardin", "barbecue", "parking", "tv", "draps_fournis", "serviettes_fournies", "chauffage"]', 90, 600, 3);
INSERT INTO gites_textes (gite_id, langue, nom, accroche, description, regles) VALUES (3, 'fr', 'Le Clos', '[À REMPLACER] Un gîte lumineux ouvert sur le jardin, pour se retrouver entre amis.', 'Le Clos est le plus lumineux des trois : de grandes ouvertures donnent sur le jardin et laissent entrer la lumière toute la journée.

Trois chambres permettent à chacun de trouver sa place, et la grande table se prête aux longs repas. [À REMPLACER : description réelle.]

Un bon point de départ pour découvrir la Côte d’Albâtre, d’Étretat à Saint-Valery-en-Caux.', '[À REMPLACER] Non-fumeur. Pas de fête. Arrivée à partir de 16 h, départ avant 11 h.');
INSERT INTO gites_textes (gite_id, langue, nom, accroche, description, regles) VALUES (3, 'en', 'Le Clos', '[TO BE REPLACED] A bright cottage opening onto the garden, for time together with friends.', 'Le Clos is the brightest of the three: large windows look out onto the garden and let the light in all day long.

Three bedrooms give everyone their own space, and the large table is made for long meals. [TO BE REPLACED: actual description.]

A good base to discover the Alabaster Coast, from Étretat to Saint-Valery-en-Caux.', '[TO BE REPLACED] Non-smoking. No parties. Check-in from 4 pm, check-out before 11 am.');
INSERT INTO tarifs (gite_id, saison, prix_nuit, sejour_min) VALUES (3, 'basse', 120, 2);
INSERT INTO tarifs (gite_id, saison, prix_nuit, sejour_min) VALUES (3, 'moyenne', 145, 3);
INSERT INTO tarifs (gite_id, saison, prix_nuit, sejour_min) VALUES (3, 'haute', 175, 7);
INSERT INTO photos (gite_id, cle_pleine, cle_miniature, largeur, hauteur, largeur_min, hauteur_min, alt_fr, alt_en, ordre) VALUES (3, 'placeholder/le-clos-1.svg', 'placeholder/le-clos-1.svg', 1600, 1067, 400, 267, 'Photo de démonstration : le gîte vu du jardin', 'Demo photo: the cottage seen from the garden', 1);
INSERT INTO photos (gite_id, cle_pleine, cle_miniature, largeur, hauteur, largeur_min, hauteur_min, alt_fr, alt_en, ordre) VALUES (3, 'placeholder/le-clos-2.svg', 'placeholder/le-clos-2.svg', 1600, 1067, 400, 267, 'Photo de démonstration : la pièce de vie', 'Demo photo: the living area', 2);
INSERT INTO photos (gite_id, cle_pleine, cle_miniature, largeur, hauteur, largeur_min, hauteur_min, alt_fr, alt_en, ordre) VALUES (3, 'placeholder/le-clos-3.svg', 'placeholder/le-clos-3.svg', 1600, 1067, 400, 267, 'Photo de démonstration : la grande table', 'Demo photo: the large table', 3);
INSERT INTO photos (gite_id, cle_pleine, cle_miniature, largeur, hauteur, largeur_min, hauteur_min, alt_fr, alt_en, ordre) VALUES (3, 'placeholder/le-clos-4.svg', 'placeholder/le-clos-4.svg', 1600, 1067, 400, 267, 'Photo de démonstration : une chambre', 'Demo photo: a bedroom', 4);

-- Saisons fictives [À REMPLACER]. Hors de ces périodes : basse saison.
INSERT INTO saisons (saison, debut, fin) VALUES ('moyenne', '2026-10-17', '2026-11-01');
INSERT INTO saisons (saison, debut, fin) VALUES ('moyenne', '2026-12-19', '2027-01-03');
INSERT INTO saisons (saison, debut, fin) VALUES ('moyenne', '2027-04-10', '2027-06-30');
INSERT INTO saisons (saison, debut, fin) VALUES ('haute', '2027-07-01', '2027-08-31');
INSERT INTO saisons (saison, debut, fin) VALUES ('moyenne', '2027-09-01', '2027-09-30');

INSERT INTO textes (cle, langue, valeur) VALUES
  ('accueil.titre', 'fr', 'Trois gîtes au calme, à Ganzeville'),
  ('accueil.titre', 'en', 'Three peaceful cottages in Ganzeville'),
  ('accueil.intro', 'fr', 'Trois gîtes normands à Ganzeville, en Seine-Maritime, à 3 km de Fécamp et de la mer.'),
  ('accueil.intro', 'en', 'Three Norman cottages in Ganzeville, Seine-Maritime, 3 km from Fécamp and the sea.'),
  ('accueil.lieu', 'fr', 'La propriété est un havre de paix, bordée par un ruisseau accessible directement depuis le terrain. On y vient pour se ressourcer, marcher et découvrir la Côte d’Albâtre, ses falaises et ses petits ports.

[À REMPLACER : présentation du lieu et de vos hôtes.]'),
  ('accueil.lieu', 'en', 'The property is a haven of peace, bordered by a stream you can reach directly from the grounds. People come here to recharge, to walk and to discover the Alabaster Coast, its cliffs and its small harbours.

[TO BE REPLACED: introduction to the place and your hosts.]'),
  ('accueil.peche', 'fr', '[À CONFIRMER avant publication] Pêche dans le ruisseau : conditions à préciser (carte de pêche, droits de pêche, périodes d’ouverture).'),
  ('accueil.peche', 'en', '[TO BE CONFIRMED before publishing] Fishing in the stream: conditions to be specified (fishing licence, fishing rights, open seasons).'),
  ('contact.intro', 'fr', 'Une question, une demande particulière ? Écrivez-nous, nous vous répondons rapidement.'),
  ('contact.intro', 'en', 'A question or a special request? Write to us, we will get back to you quickly.'),
  ('contact.adresse', 'fr', '[À REMPLACER : adresse]
76400 Ganzeville'),
  ('contact.adresse', 'en', '[TO BE REPLACED: address]
76400 Ganzeville, France'),
  ('contact.telephone', 'fr', '[À REMPLACER]'),
  ('contact.telephone', 'en', '[TO BE REPLACED]'),
  ('contact.acces', 'fr', 'En voiture : à 3 km de Fécamp, environ 1 h du Havre et 1 h 15 de Rouen. En train : gare de Fécamp. [À REMPLACER : itinéraire détaillé.]'),
  ('contact.acces', 'en', 'By car: 3 km from Fécamp, about 1 hour from Le Havre and 1 h 15 from Rouen. By train: Fécamp station. [TO BE REPLACED: detailed directions.]'),
  ('tarifs.taxe_sejour', 'fr', 'Taxe de séjour en supplément, selon le barème en vigueur. [À REMPLACER : montant par nuit et par adulte.]'),
  ('tarifs.taxe_sejour', 'en', 'Tourist tax payable in addition, according to the current local rate. [TO BE REPLACED: amount per night and per adult.]');

INSERT INTO parametres (cle, valeur) VALUES
  ('filigrane_actif', '0'),
  ('filigrane_texte', 'domainedeganzeville.fr'),
  ('mode_demo', '1');
