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
        var sourcesg = $('#sourcesg').val();
        getECS().authorizeSecurityGroupByGroup(sg.sgid, sg.regionid, protocol, make_port_range(portrange), sourcesg, "Accept", "intranet", function(json) {
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

function load_sg_options() {
    var region_id = getRegion();
    var current_sg = remote.getGlobal('sharedObject').sg;
    var select = $('#sourcesg').children().remove().end();
    for (var i = 0; i < 2; i++) {
        getECS().describeSecurityGroups(region_id, i + 1, 50, function (json) {
            console.log("loaded " + json.SecurityGroups.SecurityGroup.length + " security groups");
            $.each(json.SecurityGroups.SecurityGroup, function (index, sg) {
                if (sg.SecurityGroupId != current_sg.sgid) {
                    select.append($("<option>", {value: sg.SecurityGroupId, html: sg.Description}));
                }
            });
        });
    }
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
