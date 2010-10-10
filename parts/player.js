var presData = null;
var currentIndex = null;

function log(txt) {
    $('#log').append(txt);
}

function loadFrame(index) 
{
    if (currentIndex == index)
        return; /* Nothing to do */
    currentIndex = index;

    var file = 'prs/' + presData[index][1];

    $('#presentation img').attr('src', file);

    var info = $('#info');

    info.html('Slide ' + (parseInt(index)+1) + '/' + presData.length);
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

        var frameTime = presData[idx][0];

        if (t > frameTime) {
            newFrameIndex = idx;
        } else
            break;
    }
    
    loadFrame(newFrameIndex);

    setTimeout('updatePresentation();', 1000);
}




$(document).ready(
    function () {
        function getPresData(data) {
            presData = data;
            loadFrame(0);
        }


        $.ajax({
            url: 'data.json',
            dataType: 'json',
            success: getPresData,
            
            error: function () { 
                log('Error: Unable to read presentation calibration data (data.json)'); 
            } 
        });


        $('video').bind('seeked', 
                        function () {
                            updatePresentation();
                        }
                       );

        setTimeout('updatePresentation();', 1000);
    }
);