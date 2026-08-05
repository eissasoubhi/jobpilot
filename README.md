# JobPilot — site public

Site vitrine public de JobPilot, destiné à présenter le projet et son utilisation des API officielles d'offres d'emploi.

## Publication avec GitHub Pages

Dans le dépôt GitHub :

1. ouvrir **Settings** ;
2. ouvrir **Pages** ;
3. dans **Build and deployment**, choisir **Deploy from a branch** ;
4. sélectionner la branche **main** et le dossier **/ (root)** ;
5. enregistrer.

Le site sera ensuite disponible à l'adresse :

```text
https://eissasoubhi.github.io/jobpilot/
```

Cette adresse peut être utilisée comme URL publique de l'application lors de la création d'une application sur France Travail.io.

## Contenu publié

- `index.html` : présentation publique du projet ;
- `confidentialite.html` : politique de confidentialité ;
- `styles.css` : styles du site ;
- `robots.txt` et `sitemap.xml` : indexation ;
- `.nojekyll` : publication statique sans transformation Jekyll.

## Sécurité

Ce dépôt ne doit jamais contenir :

- de secret ou identifiant d'API ;
- de fichier `.env` ;
- de CV ou document personnel ;
- de message Gmail ;
- de donnée de candidature ;
- de sauvegarde de l'application locale.

Le code principal et les données privées de JobPilot restent dans le projet privé séparé.
