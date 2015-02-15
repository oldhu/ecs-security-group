var remote = require('remote');

function load_sg_values() {
    var sg_to_edit = remote.getGlobal('sharedObject').sg;
    if (sg_to_edit == null) {
        $('#sgid').val("");
        $('#regionid').val(getRegion());
        $('#sgname').val("");
        $('#sgname').focus();
    } else {
        $('#sgid').val(sg_to_edit.sgid);
        $('#sgname').val(sg_to_edit.sgname);
    }
}

function install_buttons_handler() {
    $('#btnsave').on('click', function() {
        var regionId = getRegion();
        var sgname = $('#sgname').val();
        getECS().createSecurityGroup(regionId, sgname, function(json) {
            if (json.Status) {
                window.location.href = "index.html";
            }
        });
    });

    $('#btncancel').on('click', function () {
        window.location.href = "index.html";
    });
}