function next_row(json, index, tbody) {
    var ecs = json.InstanceStatuses.InstanceStatus[index];
    var row = $('<tr>').append($('<td>').append(ecs.InstanceId))
    var sg = remote.getGlobal('sharedObject').sg;

    row.data('instanceid', ecs.InstanceId);

    getECS().describeInstanceAttribute(ecs.InstanceId, function (attr) {
        var check = $('<input>', {type: 'checkbox'}).addClass('check-ecs');
        if (attr.SecurityGroupIds.SecurityGroupId.indexOf(sg.sgid) != -1) {
            check.prop('checked', true);
        } else {
            check.prop('checked', false);
        }
        row.append($('<td>').append(attr.ZoneId))
           .append($('<td>').append(attr.PublicIpAddress.IpAddress[0]))
           .append($('<td>').append(attr.InnerIpAddress.IpAddress[0]))
           .append($('<td>').append(attr.Description))
           .append($('<td>').append(check));
        tbody.append(row);
        if (index < json.InstanceStatuses.InstanceStatus.length - 1) {
            next_row(json, index + 1, tbody);
        }
    });
}

function next_batch_ecs(tbody, regionid, page) {
    getECS().describeInstanceStatus(regionid, page, 50, function (json) {
        console.log("loaded " + json.InstanceStatuses.InstanceStatus.length + " ecs instances");
        next_row(json, 0, tbody);
        if (json.InstanceStatuses.InstanceStatus.length == 50) {
            next_batch_ecs(tbody, region_id, page + 1);
        }
    });
}

function install_check_action_handler() {
    $('#ecs-table-body').on('click', '.check-ecs', function () {
        var sg = remote.getGlobal('sharedObject').sg;
        var row = $($(this)[0].parentNode.parentNode);
        var value = $(this).prop('checked');
        var instanceId = row.data('instanceid');
        if (value) {
            getECS().joinSecurityGroup(instanceId, sg.sgid, function(json) {

            });
        } else {
            getECS().leaveSecurityGroup(instanceId, sg.sgid, function(json) {

            });
        }
    });
}

function load_all_ecs() {
    install_check_action_handler();
    var sg = remote.getGlobal('sharedObject').sg;
    $('#sgname').html("正在修改安全组：" + sg.sgname);
    var tbody = $('#ecs-table-body').html('');
    next_batch_ecs(tbody, sg.regionid, 1);
}
