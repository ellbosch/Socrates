$(function() {
    var results = {}

    $("body").append(
                    "<div id=\"container-socrates\">\
                        <div id=\"dragbar\"></div>\
                        <div id=\"sourcesDiv\">\
                            <div id=\"sourceBtn\">\
                                <span id=\"currentSource\"></span>\
                                <span id=\"navicon\">More Sources</span>\
                            </div>\
                        </div>\
                        <div id=\"sourceOptionsDiv\">\
                            <ul>\
                                <li id='WIKIPEDIA'>WIKIPEDIA</li>\
                                <li id='YOUTUBE'>YOUTUBE</li>\
                            </ul>\
                        </div>\
                        <div id=\"mainContentDiv\">\
                            <div id=\"content\"></div>\
                        </div>\
                    </div>");

    // event handler for dragging to resize panel
    var dragging = false;
    var dragbar = $("#container-socrates").find("#dragbar");
    dragbar.on('mousedown', function() {
        $(window).mousemove(function(e) {
            event.preventDefault();
            var new_width = $(window).width() - event.clientX
            $("#container-socrates").css('width', new_width);
            dragging = true;
        });
    });

    $("#sourceBtn").on('click', function() {
        $("#sourceOptionsDiv").slideToggle();
    });

    $("#sourceOptionsDiv ul li").on('click', function() {
        if ($(this).html() == "WIKIPEDIA") showWikipedia();
        else if ($(this).html() == "YOUTUBE") showYouTube();
        $("#sourceOptionsDiv").slideToggle();
    });

    function getSourceOptions() {
        //$("#sourceOptionsDiv ul").html("");
        var isShowingSomething = false;
        var isMoreThanOneSource = false;

        for (var prop in results) {
            var value = results[prop];
            var id = "#" + prop;
            if (value != null && value != "") {
                $("#sourceOptionsDiv ul").find(id).show();

                if (!isShowingSomething) {
                    if (prop == "WIKIPEDIA") showWikipedia();
                    else if (prop == "YOUTUBE") showYouTube();
                    isShowingSomething = true;
                }

                //$("#sourceOptionsDiv ul").append("<li>" + prop + "</li>");
            } else {
                $("#sourceOptionsDiv ul").find(id).hide();
            }
        }

        if (!isShowingSomething) {
            $("#sourcesDiv #sourceBtn #navicon").hide();
            var currentSource = $("#sourcesDiv #sourceBtn #currentSource");
            currentSource.html("NO RESULTS FOUND");
        }
    }

    function getSelectionText() {
        var text = "";
        if (window.getSelection) {
            text = window.getSelection().toString();
        } else if (document.selection && document.selection.type == "Text") {
            text = document.selection.createRange().text;
        }
        return text;
    }

    function searchHighlightedText() {
        var text = getSelectionText();
        if (text) {
            // wikipedia
            getWikiData(text, function (returnCode) {
                if (returnCode) {
                    //alert('SUCCESS');
                } else {
                    results.WIKIPEDIA = "";
                    //alert('FAILURE');
                }
            });

            // youtube
            getYouTubeData(text, function (returnCode) {
                if (returnCode) {
                   // alert('SUCCESS');
                } else {
                    results.YOUTUBE = "";
                   // alert('FAILURE');
                }
            });

            // maps
            getMapsData(text, function (returnCode) {
                if (returnCode) {
                    //alert('SUCCESS');
                } else {
                    //alert('FAILURE');
                }
            });

            getSourceOptions();
        }
    }

    $('body').on('mouseup', function (e) {
        searchHighlightedText();

        if (dragging) {
            $(window).unbind('mousemove');
            dragging = false;
        }
    });

    $('body').dblclick(function() {
        searchHighlightedText();
    });


    /**************************************
            -- WIKIPEDIA --
    **************************************/

    function getWikiData(q, callback) {
        $.ajax({
            url: 'http://en.wikipedia.org/w/api.php',
            type: 'GET',
            data: 'action=query&prop=extracts&exintro=1&format=json&titles=' + q,
            success: function (data) {
                if (data.query != null) {
                    for (var pageId in data.query.pages) {
                        // return 0 if no pages exist for query
                        if (pageId == "-1") {
                            callback(0);
                        }
                        var content = data.query.pages[pageId].extract;
                        // check if brought to a disambiguation page, return 0 if true
                        if (content != null && content.length > 20 && content.indexOf('may refer to:</p>\n<ul><li>') < 0) {

                            // var startIndex = content.indexOf('<p>');
                            // var endIndex = content.indexOf('</p>');
                            // var firstParagraph = content.substr(startIndex, endIndex - startIndex + 4);
                            
                            // set wikipedia entry
                            results.WIKIPEDIA = content;
                            callback(1);
                        } else {
                            results.WIKIPEDIA = "";
                            callback(0);
                        }
                    }
                } else {
                    results.WIKIPEDIA = "";
                }
            }
        });
    }

    // function call to set content from source
    function showWikipedia() {
        $("#container-socrates #mainContentDiv #content").html(results.WIKIPEDIA);
        $("#container-socrates #sourcesDiv #sourceBtn #currentSource").html("WIKIPEDIA");
    }


    /**************************************
                -- YOUTUBE --
    **************************************/

    function getYouTubeData(q, response) {
        var keyword= encodeURIComponent(q);
        var yt_url='http://gdata.youtube.com/feeds/api/videos?q='+keyword+'&format=5&max-results=1&v=2&alt=jsonc'; 
        
        $.ajax({
            type: "GET",
            url: yt_url,
            dataType:"json",
            success: function(response) {
                if(response.data.items) {
                    $.each(response.data.items, function(i,data) {
                        var video_id=data.id;
                        var video_title=data.title;
                        //var video_viewCount=data.viewCount;
                        // IFRAME Embed for YouTube
                        var video_frame="<iframe src='https://www.youtube.com/embed/"+video_id+"' frameborder='0' type='text/html'></iframe>";

                        var youtube_elmnt="<div id='title_youtube'>"+video_title+"</div><div id='videoDiv'>"+video_frame+"</div>";
                        results.YOUTUBE = youtube_elmnt;


                        // var video_id=data.id;
                        // var video_title=data.title;
                        // var video_viewCount=data.viewCount;
                        // // IFRAME Embed for YouTube
                        // var video_frame="<iframe width='640' height='385' src='http://www.youtube.com/embed/"+video_id+"' frameborder='0' type='text/html'></iframe>";

                        // var final="<div id='title'>"+video_title+"</div><div>"+video_frame+"</div><div id='count'>"+video_viewCount+" Views</div>";
                        // $("#result").html(final); // Result
                    });
                } else {
                    results.YOUTUBE = "";
                    //$("#result").html("<div id='no'>No Video</div>");
                }
            }
        });
    }

    function showYouTube() {
        $("#container-socrates #mainContentDiv #content").html(results.YOUTUBE);
        $("#container-socrates #sourcesDiv #sourceBtn #currentSource").html("YOUTUBE");
    }


    /**************************************
                -- MAPS --
    **************************************/

    function getMapsData(q, response) {
        var keyword= encodeURIComponent(q);
        var yt_url= 'https://maps.googleapis.com/maps/api/geocode/json?'+keyword+'&key=API_KEY';
    }

    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
        } else {
            x.innerHTML = "Geolocation is not supported by this browser.";
        }
    }
    function showPosition(position) {
        x.innerHTML = "Latitude: " + position.coords.latitude + 
        "<br>Longitude: " + position.coords.longitude; 
    }

    var map;
    function initialize() {
        var mapOptions = {
            zoom: 8,
            center: new google.maps.LatLng(getLocation.latitude, getLocation.longitude)
        };
        map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    }

    //google.maps.event.addDomListener(window, 'load', initialize);

    function showMap() {
        $("#container-socrates #mainContentDiv #content").prepend(map);
    }

});