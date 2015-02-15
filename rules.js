function add_all_rules(json, tbody) {
    console.log(json);
    $.each(json.Permissions.Permission, function (index, perm) {
        var row = $('<tr>')
            .append($('<td>')
                .append(perm.IpProtocol))
            .append($('<td>')
                .append(perm.PortRange))
            .append($('<td>')
                .append(perm.SourceGroupId))
            .append($('<td>')
                .append(perm.SourceCidrIp))
            .append($('<td>')
                .append(perm.NicType))
            .append($('<td>')
                .append($('<button>').addClass('btn btn-default btn-xs btn-remove-rule')
                    .append($('<span>').addClass("glyphicon glyphicon-remove"))));

        row.data('IpProtocol', perm.IpProtocol);
        row.data('PortRange', perm.PortRange);
        row.data('SourceGroupId', perm.SourceGroupId);
        row.data('SourceCidrIp', perm.SourceCidrIp);
        row.data('Policy', perm.Policy);
        row.data('NicType', perm.NicType);
        tbody.append(row);
    });
}

function remove_rule(IpProtocol, PortRange, SourceGroupId, SourceCidrIp, NicType) {
    if (confirm("确认删除规则")) {
        var sg = remote.getGlobal('sharedObject').sg;
        if (SourceGroupId == "") {
            getECS().revokeSecurityGroupOfIP(sg.sgid, sg.regionid, IpProtocol, PortRange, SourceCidrIp, NicType, function(json) {
                if (json.Status) {
                    window.location.href = "rules.html";
                }
            });
        } else {
            getECS().revokeSecurityGroupOfGroup(sg.sgid, sg.regionid, IpProtocol, PortRange, SourceGroupId, NicType, function(json) {
                if (json.Status) {
                    window.location.href = "rules.html";
                }
            });
        }
    }
}

function install_row_action_handler() {
    $('#rules-table-body').on('click', '.btn-remove-rule', function () {
        var row = $($(this)[0].parentNode.parentNode);
        var IpProtocol = row.data('IpProtocol');
        var PortRange = row.data('PortRange');
        var SourceGroupId = row.data('SourceGroupId');
        var SourceCidrIp = row.data('SourceCidrIp');
        var Policy = row.data('Policy');
        var NicType = row.data('NicType');
        remove_rule(IpProtocol, PortRange, SourceGroupId, SourceCidrIp, NicType);
    });
}

function load_all_rules() {
    install_row_action_handler();
    var sg = remote.getGlobal('sharedObject').sg;
    $('#sgname').html("正在修改安全组：" + sg.sgname);
    var tbody = $('#rules-table-body').html('');
    getECS().describeSecurityGroupAttribute(sg.sgid, sg.regionid, 'intranet', function(json) {
        add_all_rules(json, tbody);
        getECS().describeSecurityGroupAttribute(sg.sgid, sg.regionid, 'internet', function(json) {
            add_all_rules(json, tbody);
        });
    });
}
