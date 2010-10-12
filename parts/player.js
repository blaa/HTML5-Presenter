var presData = null;
var currentIndex = null;

function log(txt) {
    $('#log').append(txt + '<br/>');
}

function get_title(idx) {
    return presData[idx][1][1];
}

function get_time(idx) {
    var raw = presData[idx][0];
    if (raw.search(':') == -1)
        return parseFloat(raw);
    var spl = raw.split(':');
    if (spl.length != 2 || parseFloat(spl[1]) > 60)
        log('Invalid time specification for slide ' + idx);

    var time = parseInt(spl[0]) * 60 + parseFloat(spl[1]);

    return time;
}

function get_nice_time(idx) {
    return presData[idx][0] + 's';
}

function get_src(idx) {
    return 'prs/' + presData[idx][1][0];
}

function loadFrame(index) 
{
    if (currentIndex == index)
        return; /* Nothing to do */
    currentIndex = index;

    var file = get_src(index);
    var title = get_title(index);

    $('#presentation img')
        .attr('src', file)
        .attr('alt', title);

    if ($('#fancybox-outer').is(':visible')) {
        $('#fancybox-outer img').attr('src', file);
        $('#fancybox-title-main').html(title);
    }


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
        var file = get_src(idx);
        var time = get_time(idx);
        var title = get_title(idx);        

        var img = $('<img/>');
        img
            .attr('title', title)
            .attr('alt', title)
            .attr('src', file);
        
        var li = $('<li/>')
            .attr('rel', idx)
            .append(img)
            .append(get_title(idx) + ' (' + get_nice_time(idx) + ')');

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
                      v[0].currentTime = get_time(idx);
                  }
        );


        $.ajax({
            url: 'data.json',
            dataType: 'json',
            success: getPresData,
            
            error: function (ev, status, desc) { 
                log('Error: Unable to read presentation calibration data (data.json).'); 
                log('Invalid address or invalid JSON: ' + status + '//' + desc);
            } 
        });

        $('#presentation img').fancybox({autoScale: true});

        $('video').bind('seeked', 
                        function () {
                            updatePresentation();
                        }
                       );

        setTimeout('updatePresentation();', 1000);
    }
);