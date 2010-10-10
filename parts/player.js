var presData = null;
var currentIndex = null;

function log(txt) {
    $('#log').append(txt);
}

function get_file(idx) {
    return presData[idx][1][0];
}

function get_title(idx) {
    return presData[idx][1][1];
}

function get_time(idx) {
    return presData[idx][0];
}

function get_nice_time(idx) {
    return presData[idx][0] + '[s]';
}

function get_src(file) {
    return 'prs/' + file;
}

function loadFrame(index) 
{
    if (currentIndex == index)
        return; /* Nothing to do */
    currentIndex = index;

    var file = get_src(get_file(index));

    $('#presentation img').attr('src', file);
    $('#fancybox-outer img').attr('src', file);

    var info = $('#info');

    info.html('Slide ' + (parseInt(index)+1) + '/' + presData.length);

    $('#TOC li').removeClass('current');
    $('#TOC li[rel=' + index + ']').addClass('current');
}

function updatePresentation() {

    var v = $('video');
    var t = v[0].currentTime;

    if (presData == null) {
        /* Ignore */
        setTimeout('updatePresentation();', 1000);
    }

    var newFrameIndex = null;

    for (idx in presData) {
        if (!newFrameIndex) {
            newFrameIndex = idx;
            continue;
        }

        var frameTime = get_time(idx);

        if (t > frameTime) {
            newFrameIndex = idx;
        } else
            break;
    }
    
    loadFrame(newFrameIndex);

    setTimeout('updatePresentation();', 1000);
}


function generateTOC() {
    var container = $('#TOC');
    for (idx in presData) {
        var file = get_file(idx);
        var time = get_time(idx);
        
        var li = $('<li/>')
            .attr('rel', idx)
            .html(get_title(idx) + ' (' + get_nice_time(idx) + ')');

        container.append(li);
    }
}


$(document).ready(
    function () {
        function getPresData(data) {
            presData = data;
            generateTOC();
            loadFrame(0);
        }

        $('#TOC li')
            .live('click', 
                  function () {
                      var idx = $(this).attr('rel');
                      loadFrame(idx);
                      var v = $('video');
                      v[0].currentTime = presData[idx][0];
                  }
        );


        $.ajax({
            url: 'data.json',
            dataType: 'json',
            success: getPresData,
            
            error: function () { 
                log('Error: Unable to read presentation calibration data (data.json)'); 
            } 
        });

        $('#presentation img').fancybox();

        $('video').bind('seeked', 
                        function () {
                            updatePresentation();
                        }
                       );

        setTimeout('updatePresentation();', 1000);
    }
);