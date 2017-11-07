/**
 * Created by danielabrao on 10/10/16.
 */
(function () {
    "use strict";

    module.exports = function (options) {
        console.log(options);
        var questionList = "";
        options.questionArr.forEach(function (question) {
            questionList += ["<li>", question, "</li>"].join("");
        });

        if (options.language == "1" || options.language === "pt") {
            return [
                "<p>Olá ", options.user, "</p>",
                "<p>Gostaríamos de agradecer por você ter utilizado o Watson IT Help e colaborado para fazer dele a melhor opção de suporte virtual!",
                "<p>Cada interação torna o Watson ainda mais inteligente e agora ele responde a dúvidas sobre o que for treinado!</p>",
                "<p>Recebemos o feedback de que o Watson não soube responder às questões abaixo durante a sua utilização, por isso retreinamos ele para responder a essas dúvidas: </p>",
                "<ul>", questionList, "</ul>"
            ].join("");

        }
    };
}());