# Malt

## Statut

```text
mode: EXTENSION MANUELLE
collecte HTTP planifiée: désactivée
collecte navigateur planifiée: désactivée
statut de conformité: email_or_extension_only
révision: 2026-08-17
```

JobPilot ne lance aucune collecte automatique en arrière-plan vers Malt.

## Décision de conformité

La revue du 17 août 2026 s'appuie sur les Conditions Générales d'Utilisation de Malt Community SA en vigueur à compter du 16 avril 2026.

Ces CGU interdisent formellement toute forme d'extraction, de collecte, de transfert et de réutilisation des informations depuis les pages web hébergées par Malt, de manière automatisée ou non, y compris au moyen de logiciels, robots ou dispositifs de web scraping. Elles interdisent également de contourner les mesures de sécurité de la Marketplace.

Malt décrit par ailleurs des API sécurisées par des jetons d'authentification personnels pour permettre aux Utilisateurs l'accès et l'interopérabilité de leurs propres données. Cette capacité authentifiée ne constitue pas un canal public de lecture ou de redistribution du catalogue de projets pour JobPilot.

Référence officielle examinée :

- <https://www.malt.fr/legal>

En conséquence, JobPilot classe Malt dans la famille `EMAIL_OR_EXTENSION_ONLY` et conserve son mode runtime actuel `MANUAL_EXTENSION`. Aucun scraper HTTP, worker Playwright planifié, endpoint interne non documenté, automatisation de connexion, cookie ou session privée ne doivent être ajoutés comme solution de repli.

## Canal pris en charge

### Import volontaire avec l'extension

L'utilisateur ouvre lui-même une page Malt qu'il est autorisé à consulter puis déclenche explicitement l'import JobPilot. Le backend ne parcourt pas la Marketplace et ne récupère aucun identifiant, cookie ou jeton de session Malt.

L'import doit rester limité aux informations déjà visibles dans l'onglet et nécessaires au traitement local de l'offre. Il passe ensuite par le pipeline canonique de JobPilot pour la déduplication, le scoring et le suivi de candidature.

Le statut `EMAIL_OR_EXTENSION_ONLY` décrit une famille de canaux sûrs ; il ne signifie pas qu'un format précis d'alerte e-mail Malt est actuellement pris en charge. Un éventuel support Gmail devra être fondé sur un format d'alerte réellement observé et testé avec des fixtures anonymisées, sans exposer de message utilisateur réel dans le dépôt.

## Conditions de réouverture

Une collecte planifiée ne pourra être envisagée qu'après l'un des changements suivants :

- publication d'un canal officiel donnant explicitement à JobPilot un droit de lecture et de réutilisation adapté ;
- autorisation écrite applicable de Malt ;
- modification vérifiée des conditions officielles rendant un mode de collecte clairement autorisé.

Toute réouverture devra refaire l'audit des conditions de réutilisation et, lorsqu'un accès HTTP public est envisagé, de `robots.txt`. Elle devra aussi définir des quotas et délais explicites, fournir des tests locaux sans appel au service réel et conserver un mécanisme de désactivation immédiate.

## Limites de sécurité

- Aucun login automatisé.
- Aucun cookie, token ou jeton de session utilisateur n'est collecté par le backend.
- Aucun contournement de CAPTCHA ou de contrôle d'accès.
- Aucun endpoint privé ou non documenté n'est utilisé.
- Aucun contenu utilisateur, candidature générée ou donnée de profil réelle n'est commité.
- L'extension ne soumet jamais automatiquement une candidature externe.
