var socket = io.connect('http://192.168.13.200:2345');


function escapeHtml(value) {
    //create a in-memory div, set it's inner text(which jQuery automatically encodes)
    //then grab the encoded contents back out.  The div never exists on the page.
    return $('<div/>').text(value).html();
}

function getDeviceId(baseURL) {
    return baseURL.split("/").join("")
}
function relayOn(id, number, baseURL) {
    $('#' + id).unbind();
    $('#' + id + ' div').removeClass("off on unknown").addClass("unknown");

    socket.emit('mqtt',
        {
            "topic": baseURL + "/switch/" + number + "/on",
            "body": null
        });
}

function relayOff(id, number, baseURL) {
    $('#' + id).unbind();
    $('#' + id + ' div').removeClass("off on unknown").addClass("unknown");
    socket.emit('mqtt',
        {
            "topic": baseURL + "/switch/" + number + "/off",
            "body": null
        });
}

function on(id, baseURL) {
    $('#' + id).unbind();
    $('#' + id + ' div').removeClass("off on unknown").addClass("unknown");
    socket.emit('mqtt',
        {
            "topic": baseURL + "/switch/on",
            "body": null,
        });
}

function setActivity(id, activityId) {
    $('#' + id).unbind();
    $('#' + id + ' div').removeClass("off on unknown").addClass("unknown");
    socket.emit('activity',
        {
            "activityId": activityId,
        });
}

function harmonyOff(id) {
    $('#' + id).unbind();
    $('#' + id + ' div').removeClass("off on unknown").addClass("unknown");
    socket.emit('powerOff', {});
}


function off(id, baseURL) {
    $('#' + id).unbind();
    $('#' + id + ' div').removeClass("off on unknown").addClass("unknown");

    $('#' + id).unbind();
    $('#' + id + ' div').removeClass("off on unknown").addClass("unknown");
    socket.emit('mqtt',
        {
            "topic": baseURL + "/switch/off",
            "body": null,
        });
}

function generateRelay(device) {
    var name = device.name;
    var url = device.baseURL;
    var elem = '';

    for (var relayNo = 0; relayNo < device.states.length; relayNo++) {
        var i = "anchor" + getDeviceId(device.baseURL) + "_" + (relayNo + 1);

        var name = 'Relay #' + (relayNo + 1);
        if (device.names[relayNo]) {
            name = device.names[relayNo];
        }

        elem = elem + '<div class="switch divTableRow"><div class="divTableCell1">' + name + '</div>';
        if (device.states[relayNo] == 'off') {
            elem = elem + '<div class="btnON" title="Anschalten" class="divTableCell2" id=""><a id="' + i + '" href="#" onclick= "relayOn(\'' + i + '\', ' + (relayNo + 1) + ', \'' + url + '\')"><div class="indicator-light off"></div></a></div>';
        }
        else if (device.states[relayNo] == 'on') {
            elem = elem + '<div class="btnOFF" title="Ausschalten" class="divTableCell3"><a id="' + i + '" href="#" onclick="relayOff(\'' + i + '\', ' + (relayNo + 1) + ', \'' + url + '\')"><div class="indicator-light on"></div></a></div>';
        }
        else {
            elem = elem + '<div class="btnOFF" title="Unbekannt" class="divTableCell3"><div class="indicator-light unknown"></div></div>';
        }
        elem = elem + '</div>';
    }
    return elem;
}


function generateSwitch(device) {
    var name = device.name;
    var url = device.baseURL;
    var i = "anchor" + getDeviceId(device.baseURL);
    var elem = '<div class="divTableCell1">' + escapeHtml(name) + '</div>';


    var onTime = '-';
    var offTime = '-';
    if ((typeof(device.onTime) != "undefined") && device.onTime != 0) {
        onTime = dateFormat(new Date(device.onTime), "dd.mm.yyyy, HH:MM:ss");
    }
    if ((typeof(device.offTime) != "undefined") && device.offTime != 0) {
        offTime = dateFormat(new Date(device.offTime), "dd.mm.yyyy, HH:MM:ss");
    }

    if (device.status == 'off') {
        elem = elem + '<div class="btnON" title="Anschalten" class="divTableCell2"><a id="' + i + '" href="#" onclick= "on(\'' + i + '\',\'' + url + '\')"><div class="indicator-light off"></div></a></div>';
        elem = elem + '<div class="divTableCell1">'
            + '<div class="divTableCell1Split">Aus: ' + offTime + '</div>'
            + '</div>';
    }
    else if (device.status == 'on') {
        elem = elem + '<div class="btnOFF" title="Ausschalten" class="divTableCell3"><a id="' + i + '" href="#" onclick="off(\'' + i + '\',\'' + url + '\')"><div class="indicator-light on"></div></a></div>';
        elem = elem + '<div class="divTableCell1">'
            + '<div class="divTableCell1Split">An: ' + onTime + '</div>'
            + '</div>';
    }
    else {
        elem = elem + '<div class="btnOFF" title="Unbekannt" class="divTableCell3"><div class="indicator-light unknown"></div></div>';
    }

    return elem;
}

function generateEnv(device) {
    var name = device.name;

    var formattedTime = '-';
    var formattedSuccessTime = '-';
    if ((typeof(device.last) != "undefined") && device.last != 0) {
        formattedTime = dateFormat(new Date(device.last), "dd.mm.yyyy, HH:MM:ss");
    }
    if ((typeof(device.lastSuccess) != "undefined") && device.lastSuccess != 0) {
        formattedSuccessTime = dateFormat(new Date(device.lastSuccess), "dd.mm.yyyy, HH:MM:ss");
    }


    var status = "UNKNOWN";
    var statusTitle = "Unbekannt";

    if (device.status == 'OK') {
        status = "OK";
        statusTitle = "OK";
    }
    if (device.status == 'FAILED') {
        status = "FAILURE";
        statusTitle = "Fehler";
    }

    var elem =
        '<div class="symbol env"><div class="status ' + status + '"" title="' + statusTitle + '"></div></div><div class="info"><div class="line20Title line20TitleEnv">'
        + '<div class="TitleText">' + device.temperature + '&deg;C</div></div><div class="line20right highlight">'
        + '<div>';

    if (device.humidity) {
        elem = elem + device.humidity + ' %'
    }
    elem = elem +
        '</div></div><div class="line20right highlight"><div>' + escapeHtml(name) + '</div></div>';

    if (status == 'OK') {
        elem = elem + '<div class="line20right lowlight"></div>'
    } else if (status == 'FAILURE') {
        elem = elem + '<div class="line20right faillight"><span>' + formattedTime + '</span></div>'
    } else {
        elem = elem + '<div class="line20right lowlight"><span>' + formattedTime + '</span></div>'
    }
    elem = elem + '<div class="line20right lowlight"><span>' + formattedSuccessTime + '</span></div></div>';

    return elem;
}

function add(data) {
    if (data.type === 'environment') {
        console.log("Adding new environment info");
        $('#envRoot').append('<div class="elem" id="' + getDeviceId(data.baseURL) + '">' + generateEnv(data) + '</div>');
    } else if (data.type === 'switch') {
        console.log("Adding new switch");
        $('#switchRoot').append('<div class="switch divTableRow" id="' + getDeviceId(data.baseURL) + '">' + generateSwitch(data) + '</div>');
    } else if (data.type === 'relay') {
        console.log("Adding new relay");
        $('#relayRoot').append('<div class="relay divTableRow" id="' + getDeviceId(data.baseURL) + '">' + generateRelay(data) + '</div>');
    }
}

function update(data) {
    if (data.type === 'environment') {
        console.log("Updating environment info");
        $('#' + getDeviceId(data.baseURL)).html(generateEnv(data));
        $('#' + getDeviceId(data.baseURL))
            .animate({borderColor: "#FFC330"}, 500)
            .animate({borderColor: "#35BBED"}, 500);
        $('#' + getDeviceId(data.baseURL) + " .highlight")
            .animate({color: "#FFC330"}, 500)
            .animate({color: "#35BBED"}, 500);
        $('#' + getDeviceId(data.baseURL) + " .titleText")
            .animate({color: "#FFC330"}, 500)
            .animate({color: "#35BBED"}, 500);
    } else if (data.type === 'switch') {
        console.log("Updating switch");
        $('#' + getDeviceId(data.baseURL)).html(generateSwitch(data));
    } else if (data.type === 'relay') {
        console.log("Updating relay");
        $('#' + getDeviceId(data.baseURL)).html(generateRelay(data));
    }
}


function addHarmonyPower(root, harmony) {
    var elem = '<div class="harmony divTableRow" id="harmonyPower">';
    elem = elem + '<div class="divTableCell1">' + harmony.power.label + '</div>';
    elem = elem + '<div class="btnON" title="Ausschalten" class="divTableCell3"><a id="anchor-1" href="#" onclick="harmonyOff(\'anchor-1\')"><div class="indicator-light off"></div></a></div>';
    elem = elem + '</div>';
    elem = elem + root.html();
    root.html(elem);

    updateHarmonyPower(harmony);
}

function updateHarmonyPower(harmony) {
    if (harmony.status == 'on') {
        $('#harmonyPower').removeClass("hide show").addClass("show");
        $('#anchor-1 div').removeClass("off on unknown").addClass("off");
    } else {
        $('#harmonyPower').removeClass("hide show").addClass("hide");
        $('#anchor-1 div').removeClass("off on unknown").addClass("on");
    }
}

function addOrUpdateHarmony(harmony) {
    var div = $('#harmonyRoot');

    if (harmony.status == 'on') {
        var power = $('#harmonyPower');
        if (power.length) {
            updateHarmonyPower(power, harmony);
        } else {
            addHarmonyPower(div, harmony);
        }
    }


    for (var i = 0; i < harmony.activities.length; i++) {
        var activity = harmony.activities[i];
        var elem = $('#harmony' + activity.id);
        if (elem.length) {
            updateActivity(elem, activity);
        } else {
            addActivity(div, activity);
        }
    }
}

function addOrUpdate(array) {
    if (Object.prototype.toString.call(array) === '[object Array]') {
        for (var i = 0; i < array.length; i++) {
            var data = array[i];
            var elem = $('#' + getDeviceId(data.baseURL));
            if (elem.length) {
                update(data);
            } else {
                add(data);
            }
        }
    } else {
        var data = array;
        var elem = $('#' + getDeviceId(data.baseURL));
        if (elem.length) {
            update(data);
        } else {
            add(data);
        }
    }
}

$(document).ready(function () {
    // WebSocket
    // neue Nachricht
    socket.on('dump', function (data) {
        console.log('Got dump: ' + JSON.stringify(data));
        addOrUpdate(data);
    });

    socket.on('harmony', function (data) {
        console.log('Got harmony data: ' + JSON.stringify(data));
        addOrUpdateHarmony(data);
    });

    socket.on('data', function (data) {
        console.log('Got data: ' + JSON.stringify(data));
        addOrUpdate(data);
    });

    $('ul.tabs').each(function () {
        // For each set of tabs, we want to keep track of
        // which tab is active and its associated content
        var $active, $content, $links = $(this).find('a');

        // If the location.hash matches one of the links, use that as the active tab.
        // If no match is found, use the first link as the initial active tab.
        $active = $($links.filter('[href="' + location.hash + '"]')[0] || $links[0]);
        $active.addClass('active');

        $content = $($active[0].hash);

        // Hide the remaining content
        $links.not($active).each(function () {
            $(this.hash).hide();
        });

        // Bind the click event handler
        $(this).on('click', 'a', function (e) {
            // Make the old tab inactive.
            $active.removeClass('active');
            $content.hide();

            // Update the variables with the new link and content
            $active = $(this);
            $content = $(this.hash);

            // Make the tab active.
            $active.addClass('active');
            $content.show();

            // Prevent the anchor's default click action
            e.preventDefault();
        });
    });
});

function updateActivity(elem, activity) {
    elem.html(generateActivity(activity));
}
function addActivity(root, activity) {
    root.append('<div class="harmony divTableRow" id="harmony' + activity.id + '">' + generateActivity(activity) + '</div>');
}

function generateActivity(activity) {
    var name = activity.label;
    var id = activity.id;
    var i = "anchor" + id;
    var elem = '<div class="divTableCell1">' + escapeHtml(name) + '</div>';

    if (activity.selected) {
        elem = elem + '<div class="btnOFF" title="Aktiv"   class="divTableCell3"><div class="indicator-light on"></div></div>';
    } else {
        elem = elem + '<div class="btnON" title="Wechseln" class="divTableCell2"><a id="' + i + '" href="#" onclick= "setActivity(\'' + i + '\',\'' + id + '\')"><div class="indicator-light off"></div></a></div>';
    }

    return elem;
}
