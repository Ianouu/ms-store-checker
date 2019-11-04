# ms-store-checker
***Version d'exposition***<br>
Site web de comparaison des prix des produits microsoft en fonction des pays de vente.

## Fonctionement de l'application

#### Scrapping
Le site possède une API permettant de lancer le scrapping avec PhatomJS. Cette Api est exécutée tous les soirs depuis un cron qui fait appel à l'API.

#### Sur le web 
Le site affiche les articles par catégories. Lorsque l'on clique sur l'article, on arrive sur une page détaillée de l'article
avec les différents prix selon les stores Microsoft.
Une barre de recherche est aussi mise a disposition pour rechercher un article.

#### La base de données 
Base de données orientées document. Les données sont herbergées sur mlab qui propose un stockage MongoBD.

### Dépendances utitilisés

- [mlab](https://mlab.com)
Base de données MongoBD.

- [i18n](https://www.npmjs.com/package/i18n)
Utilisé pour l'internationalisation. Affiche la bonne monaie dans le cas ou
ce n'est pas de l'euro. Va permettre aussi de faire les traductions

- [Cheerio]( https://www.npmjs.com/package/cheerio) Pour récupérer les données du DOM. (Remplace JQuery)

- [Currency Formater](https://www.npmjs.com/package/currency-formatter) Pour formater les données scrappés de la page html
et pour afficher la monaie en fonction de la région de l'utilisateur.

- [Open exchange rates](https://www.npmjs.com/package/open-exchange-rates) API permettant de récupérer les taux des monnaies.
Utilisé pour convertir tous les prix scrappé en USD et ainsi faire la comparaison du moins cher.

- [phantom js - prebuilt](https://www.npmjs.com/package/phantomjs-prebuilt) Pré-construction de phantomjs.
Permet d'executer les scripts à partir du serveur node. C'est la librairie qui va téléchargé les pages htmls.

## Structure du projet

microsoft-checker\
|\
|-database : Dossier contenant les jsons les acesseurs aux données.\
|       |- xbox\
|       |....\
|\
|-config : Tous les fichiers de configs de notre app.\
|       |\
|       |- locales : Dossier des traductions\
|       |- langs.json : Toutes les régions que l'on scrapper. Correspond aux stores microsoft\
|       |- i18n.js : Constructeur du traducteur.\
|\
|- publics : Fihiers utiles pour les vues (pages html).\
|       |- stylessheets : Feuilles de styles css.Contient les scripts boostraps et jquery.\
|       |- javascripts : JS pour les vues. Contient les scripts boostraps et jquery.\
|       |- images : les images.\
|\
|-routes : Points d'entrés du serveur.\
|       |-index.js : Point d'entrée. Ce fichier contient les urls que l'on va écoutés et les traitements que l'on va effectuer. Sur ces pages\
|       |-users.js : pas utilisé. (Utile quand tu créer des comptes utilisateurs).\
|\
|-views : Pages htmls en .ejs syntax [ejs](http://www.ejs.co/#docs).\
|       |-...\
|       |-partials: dossier contenant les morceaux de vues. Comme la navbar,  que l'on inclut après dans les autres pages.\
|\
|-scripts: Dossier contenant toute la partie scrapping\
|       |-tmp : dossier contenant les pages htmls téléchargés.
