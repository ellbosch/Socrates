function getSelectionText() {
    var text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type == "Text") {
        text = document.selection.createRange().text;
    }
    return text;
}



function getWikiData(q, callback) {

    $.ajax({
        url: 'http://en.wikipedia.org/w/api.php',
        type: 'GET',
        data: 'action=query&prop=extracts&exintro=1&format=json&titles=' + q,
        success: function (data) {
            for (var pageId in data.query.pages) {
                // return 0 if no pages exist for query
                if (pageId == "-1") {
                    callback(0);
                }
                var content = data.query.pages[pageId].extract;
                // check if brought to a disambiguation page, return 0 if true
                if (content.indexOf('may refer to:</p>\n<ul><li>') < 0) {
                    var startIndex = content.indexOf('<p>');
                    var endIndex = content.indexOf('</p>');
                    var firstParagraph = content.substr(startIndex, endIndex - startIndex + 4);
                    alert(firstParagraph);
                    callback(1);
                } else {
                    callback(0);
                }

            }
        }
    });
}

$('body').mouseup(function (e) {
    var text = getSelectionText();
    if (text) {
        alert(getSelectionText());
        getWikiData(getSelectionText(), function (returnCode) {
            if (returnCode) {
                alert('SUCCESS');
            } else {
                alert('FAILURE');
            }
        });
        
    }
});