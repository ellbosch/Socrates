function getSelectionText() {
    var text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type == "Text") {
        text = document.selection.createRange().text;
    }
    return text;
}

$('body').mouseup(function (e) {
    var text = getSelectionText();
    if (text) {
        alert(getSelectionText());
    }
});