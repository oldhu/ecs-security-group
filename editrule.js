function make_port_range(port) {
    if (port.indexOf('/') == -1) {
        return port + '/' + port;
    }
    return port;
}

function install_buttons_handler() {
    $('#btnsave').on('click', function() {
        var sg = remote.getGlobal('sharedObject').sg;
        var protocol = $('#protocol').val();
        var portrange = $('#portrange').val();
        var iprange = $('#iprange').val();
        var nictype = $('#nictype').val();
        getECS().authorizeSecurityGroupByIP(sg.sgid, sg.regionid, protocol, make_port_range(portrange), iprange, "Accept", nictype, function(json) {
            if (json.Status) {
                window.location.href = "rules.html";
            }
        });
    });

    $('#btncancel').on('click', function () {
        window.location.href = "rules.html";
    });
}

function load_sg_values() {
    var sg = remote.getGlobal('sharedObject').sg;
    $('#sgid').val(sg.sgid);
    $('#regionid').val(sg.regionid);
}

function install_protocol_change_handler() {
    $('#protocol').on('change', function() {
        var portrange = $('#portrange');
        if (this.value == "TCP" || this.value == "UDP") {
            portrange.val("");
            portrange.attr('disabled', false);
        } else {
            portrange.val("-1/-1");
            portrange.attr('disabled', true);
        }
    })
}
