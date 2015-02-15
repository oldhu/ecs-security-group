var fs = require('fs');
var remote = require('remote');
var ECS = require('aliyun-ecs');

var globalSelectedId = '';
var globalECS = null;

function getECS() {
    if (globalECS == null) {
        var key = remote.getGlobal('sharedObject').key;
        var ecs = new ECS(key.id, key.secret);

        ecs.beforeRequest = function () {
            $('#spinner').removeClass().addClass("fa fa-spinner fa-spin");
        };
        ecs.afterRequest = function () {
            $('#spinner').removeClass().addClass("fa fa-plug");
        };
        ecs.onMessage = function(status, msg) {
            var msgdiv = $('#message');
            if (status) {
                msgdiv.hide();
            } else {
                msgdiv.html(msg);
                msgdiv.show();
                setTimeout(function() {
                    msgdiv.hide();
                }, 4000);
            }
        }
        globalECS = ecs;
    }
    return globalECS;
}

function setRegion(regionId) {
    remote.getGlobal('sharedObject').region = regionId;
}

function getRegion() {
    return remote.getGlobal('sharedObject').region;
}

function key_config_file() {
    return "config/key.json";
}

function load_key_from_file() {
    var key_file = key_config_file();
    if (fs.existsSync(key_file)) {
        var str = fs.readFileSync(key_file).toString();
        json = JSON.parse(str);
        return json;
    }
}

function update_sg_table_selected() {
    $('#sg-table-body > tr').each(function () {
        var tr = $(this);
        tr.removeClass();
        var id = tr[0].cells[0].innerText;
        if (id == globalSelectedId) {
            tr.addClass("info");
        }
    });
}

function install_row_click_handler() {
    $('#sg-table-body').on('click', 'tr', function (e) {
        var selectedId = e.currentTarget.cells[0].innerText;
        globalSelectedId = selectedId;
        update_sg_table_selected();
    });
}

function remove_sg(sgid, regionid) {
    if (confirm("确认删除安全组" + sgid + "，位于" + regionid)) {
        getECS().deleteSecurityGroup(sgid, regionid, function(json) {
            if (json.Status) {
                reload_security_groups();
            }
        })
    }
}

function edit_sg(sgid, sgname, regionid) {
    var sg_to_edit = {
        'sgid': sgid,
        'sgname': sgname,
        'regionid': regionid
    };
    remote.getGlobal('sharedObject').sg_to_edit = sg_to_edit;
    window.location.href = "editsg.html";
}

function install_row_action_handler() {
    $('#sg-table-body').on('click', '.btn-edit-sg', function () {
        var row = $($(this)[0].parentNode.parentNode);
        var sgid = row.data('sgid');
        var regionid = row.data('regionid');
        var sgname = row.data('sgname');
        edit_sg(sgid, sgname, regionid);
    });
    $('#sg-table-body').on('click', '.btn-remove-sg', function () {
        var row = $($(this)[0].parentNode.parentNode);
        var sgid = row.data('sgid');
        var regionid = row.data('regionid');
        remove_sg(sgid, regionid);
    });
    $('#sg-table-body').on('click', '.btn-rules-sg', function () {
        var row = $($(this)[0].parentNode.parentNode);
        var sgid = row.data('sgid');
        var regionid = row.data('regionid');
    });
    $('#sg-table-body').on('click', '.btn-ecs-sg', function () {
        var row = $($(this)[0].parentNode.parentNode);
        var sgid = row.data('sgid');
        var regionid = row.data('regionid');
    });
}

function append_rows(region_id, json, tbody) {
    $.each(json.SecurityGroups.SecurityGroup, function (index, sg) {
        var row = $('<tr>')
                .append($('<td>')
                    .append(sg.SecurityGroupId))
                .append($('<td>')
                    .append(sg.Description))
                .append($('<td>')
                    .append($('<button>').addClass('btn btn-default btn-xs btn-rules-sg')
                        .append($('<span>').addClass("glyphicon glyphicon-th-list")))
                    .append(' ')
                    .append($('<button>').addClass('btn btn-default btn-xs btn-ecs-sg')
                        .append($('<span>').addClass("fa fa-desktop")))
                    .append(' ')
                    //.append($('<button>').addClass('btn btn-default btn-xs btn-edit-sg')
                    //    .append($('<span>').addClass("glyphicon glyphicon-pencil")))
                    //.append(' ')
                    .append($('<button>').addClass('btn btn-default btn-xs btn-remove-sg')
                        .append($('<span>').addClass("glyphicon glyphicon-remove")))
            );
        row.data('sgid', sg.SecurityGroupId);
        row.data('sgname', sg.Description);
        row.data('regionid', region_id);
        tbody.append(row);
    });
}

// support only 100 security groups now
function reload_security_groups() {
    var region_id = getRegion();
    install_row_click_handler();
    install_row_action_handler();
    var tbody = $('#sg-table-body').html('');
    for (var i = 0; i < 2; i++) {
        getECS().describeSecurityGroups(region_id, i + 1, 50, function (json) {
            console.log("loaded " + json.SecurityGroups.SecurityGroup.length + " security groups");
            append_rows(region_id, json, tbody);
        });
    }
}

function install_select_region_handler() {
    $('#selectregion').on('change', function () {
        setRegion(this.value);
        reload_security_groups();
    });
}

function reload_regions() {
    getECS().describeRegions(function (json) {
        var select = $('#selectregion').children().remove().end();
        $.each(json.Regions.Region, function (index, region) {
            select.append($("<option>", {value: region.RegionId, html: region.LocalName}));
        });
        setRegion(select.val());
        reload_security_groups();
    });
}

function install_new_sg_handler() {
    $('#newsg-button').on('click', function() {
        remote.getGlobal('sharedObject').sg_to_edit = null;
        window.location.href = "editsg.html";
    });
}