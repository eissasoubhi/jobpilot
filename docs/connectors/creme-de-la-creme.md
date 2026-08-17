# Crème de la Crème

## Statut

```text
mode: EXTENSION MANUELLE
collecte HTTP planifiée: désactivée
collecte navigateur planifiée: désactivée
statut de conformité: email_or_extension_only
révision: 2026-08-17
```

JobPilot ne lance aucune collecte automatique en arrière-plan vers Crème de la Crème.

## Décision de conformité

La revue du 17 août 2026 distingue la visibilité technique de certaines pages de mission d'un droit de collecte automatisée.

Des pages de mission peuvent être consultées publiquement sans session privée. Cela ne suffit toutefois pas à autoriser un scraper. Les mentions légales officielles de Crème de la Crème indiquent que les marques, textes, commentaires, illustrations, images, applications informatiques et plus généralement les éléments du site sont protégés. Toute reproduction, représentation, utilisation ou adaptation de tout ou partie de ces éléments nécessite l'accord préalable et écrit de l'éditeur ; la reprise de contenu est également soumise à autorisation préalable.

Le centre d'aide officiel décrit par ailleurs l'accès normal aux missions via les e-mails adressés au freelance, le dashboard freelance et les canaux Slack de la communauté. Aucun API, flux RSS/Atom ou export officiel public permettant à JobPilot de lire ou redistribuer le catalogue de missions n'a été identifié lors de cette revue.

Références officielles examinées :

- <https://www.cremedelacreme.io/legal>
- <https://help.cremedelacreme.io/fr/article/comment-acceder-aux-missions-jvdw09/>
- <https://www.cremedelacreme.io/freelance>

En conséquence, JobPilot conserve Crème de la Crème dans la famille `EMAIL_OR_EXTENSION_ONLY` et son mode opérationnel actuel reste `MANUAL_EXTENSION`. Aucun scraper HTTP, aucun worker Playwright planifié, aucun endpoint interne non documenté et aucune automatisation de session, cookie ou connexion ne doivent être ajoutés comme solution de repli.

## Canal pris en charge

### Import volontaire avec l'extension

L'utilisateur ouvre lui-même la page qu'il souhaite traiter et déclenche explicitement l'import JobPilot. Le backend ne parcourt pas le catalogue Crème de la Crème et ne récupère aucune session privée du navigateur.

L'import doit rester limité aux informations déjà visibles dans l'onglet et nécessaires au traitement local de l'offre. Il passe ensuite par le pipeline canonique de JobPilot pour la déduplication, le scoring et le suivi de candidature.

Le mode `EMAIL_OR_EXTENSION_ONLY` ne signifie pas qu'un type précis d'alerte e-mail Crème de la Crème est actuellement reconnu. Un futur support Gmail devra être basé sur un format d'alerte réellement observé et testé localement, sans exposer de message utilisateur réel dans le dépôt.

## Conditions de réouverture

Une collecte planifiée ne pourra être envisagée qu'après l'un des changements suivants :

- publication d'un API, flux ou export officiel donnant explicitement un droit de lecture/réutilisation adapté ;
- autorisation écrite applicable de Crème de la Crème ;
- modification vérifiée des conditions officielles rendant un mode de collecte clairement autorisé.

Toute réouverture devra refaire l'audit des conditions de réutilisation et de `robots.txt`, définir des quotas et délais explicites, fournir des fixtures locales anonymisées et conserver zéro appel au service réel dans la CI.

## Limites de sécurité

- Aucun login automatisé.
- Aucun cookie ou jeton de session utilisateur n'est collecté par le backend.
- Aucun contournement de CAPTCHA ou de contrôle d'accès.
- Aucun endpoint privé ou non documenté n'est utilisé.
- Aucun contenu utilisateur, candidature générée ou donnée de profil réelle n'est commité.
- L'extension ne soumet jamais automatiquement une candidature externe.
