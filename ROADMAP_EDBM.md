# RoomMaster EDBM - Cahier des charges et roadmap

## Vision

Application interne de gestion des reservations de salles pour EDBM.

## Roles

- `admin`
  - Gere les salles, utilisateurs, reservations, emails et parametres
- `organizer`
  - Cree et gere ses reservations futures
- `visitor`
  - Consulte le calendrier et les disponibilites des salles

## Regles metier

- Une reservation passee ne peut pas etre modifiee
- Une reservation passee ne peut pas etre supprimee
- Une salle en maintenance ne peut pas etre reservee
- Un visiteur ne peut pas reserver
- Un organisateur doit etre connecte pour reserver
- Un admin peut superviser et relancer les emails

## Priorites

1. Authentification, inscription et gestion des roles
2. Reservation par les organisateurs
3. Blocage des modifications/suppressions sur les reservations passees
4. Gestion multi-salles propre
5. Relance des emails echoues
6. Durcissement de la securite et des sessions
7. Historique et audit

## Ecrans cibles

- Connexion
- Inscription
- Consultation du calendrier
- Liste des salles
- Mes reservations
- Creation de reservation
- Detail reservation
- Administration utilisateurs
- Administration salles
- Logs email

## Prochaine etape

Autoriser l'inscription `organizer` / `visitor`, proteger les routes et preparer la reservation self-service pour les organisateurs.
