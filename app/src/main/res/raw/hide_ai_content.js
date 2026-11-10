// Hide posts labelled as made with AI.
const IG_AI = /^(ai info|información de ia|contenido de ia|ai content|informação de ia|conteúdo de ia|infos sur l.ia|contenu ia|ki-info|ki-inhalt|info sull.ia|contenuto ia)$/i;
igWatch(() => igArticlesWith(IG_AI).forEach(igHide));
