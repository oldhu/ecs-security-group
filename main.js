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

function remove_sg(sgid, sgname, regionid) {
    if (confirm("确认删除安全组" + sgid + "，" + sgname + "，位于" + regionid)) {
        getECS().deleteSecurityGroup(sgid, regionid, function(json) {
            if (json.Status) {
                window.location.href = "main.html";
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
    remote.getGlobal('sharedObject').sg = sg_to_edit;
    window.location.href = "editsg.html";
}

function show_rules(sgid, sgname, regionid) {
    var sg = {
        'sgid': sgid,
        'sgname': sgname,
        'regionid': regionid
    };
    remote.getGlobal('sharedObject').sg = sg;
    window.location.href = "rules.html";
}

function select_ecs(sgid, sgname, regionid) {
    var sg = {
        'sgid': sgid,
        'sgname': sgname,
        'regionid': regionid
    };
    remote.getGlobal('sharedObject').sg = sg;
    window.location.href = "ecs.html";
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
        var sgname = row.data('sgname');
        remove_sg(sgid, sgname, regionid);
    });
    $('#sg-table-body').on('click', '.btn-rules-sg', function () {
        var row = $($(this)[0].parentNode.parentNode);
        var sgid = row.data('sgid');
        var regionid = row.data('regionid');
        var sgname = row.data('sgname');
        show_rules(sgid, sgname, regionid);
    });
    $('#sg-table-body').on('click', '.btn-ecs-sg', function () {
        var row = $($(this)[0].parentNode.parentNode);
        var sgid = row.data('sgid');
        var regionid = row.data('regionid');
        var sgname = row.data('sgname');
        select_ecs(sgid, sgname, regionid);
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

function next_batch_groups(tbody, region_id, page) {
    getECS().describeSecurityGroups(region_id, page, 50, function (json) {
        console.log("loaded " + json.SecurityGroups.SecurityGroup.length + " security groups");
        append_rows(region_id, json, tbody);
        if (json.SecurityGroups.SecurityGroup.length == 50) {
            next_batch_groups(tbody, region_id, page + 1);
        }
    });
}

function load_security_groups() {
    var region_id = getRegion();
    install_row_click_handler();
    install_row_action_handler();
    var tbody = $('#sg-table-body').html('');
    next_batch_groups(tbody, region_id, 1);
}

function install_select_region_handler() {
    $('#selectregion').on('change', function () {
        setRegion(this.value);
        window.location.href = "main.html";
    });
}

function load_regions() {
    getECS().describeRegions(function (json) {
        var select = $('#selectregion').children().remove().end();
        $.each(json.Regions.Region, function (index, region) {
            select.append($("<option>", {value: region.RegionId, html: region.LocalName}));
        });
        if (getRegion() == null) {
            setRegion(select.val());
        } else {
            select.val(getRegion());
        }
        load_security_groups();
    });
}

function install_new_sg_handler() {
    $('#newsg-button').on('click', function() {
        remote.getGlobal('sharedObject').sg = null;
        window.location.href = "editsg.html";
    });
}