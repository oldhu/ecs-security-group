var fs = require('fs');
var globalSelectedId = '';

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

function save_key_to_file(key) {
	var key_file = key_config_file();
	fs.writeFileSync(key_file, JSON.stringify(key));	
}

function load_editlogin_values() {
	var key = load_key_from_file();
	$("#inputid").val(key.id);
	$("#inputsecret").val(key.secret);
}

function install_save_login_handler() {
	$('#btnsavelogin').on('click', function() {
		save_key_to_file({
			"id": $("#inputid").val(),
			"secret": $("#inputsecret").val()
		});
		window.location.href = "index.html";
	});	
}

function update_sg_table_selected() {
	$('#sg-table-body > tr').each(function() {
		var tr = $(this);
		tr.removeClass();
		var id = tr[0].cells[0].innerText;
		if (id == globalSelectedId) {
			tr.addClass("info");
		}
	});
}

function install_row_click_handler() {
	$('#sg-table-body').on('click', 'tr', function(e) {
		var selectedId = e.currentTarget.cells[0].innerText;
		globalSelectedId = selectedId;
		update_sg_table_selected();
	});
}

function install_row_action_handler() {
	$('#sg-table-body').on('click', '.btn-edit-sg', function() {
        var btn = $(this);
        var btnId = btn[0].parentNode.parentNode.cells[0].innerText;
        console.log(btnId);
    });
	$('#sg-table-body').on('click', '.btn-remove-sg', function() {

	});	
}

function append_rows(json, tbody) {
	$.each(json.SecurityGroups.SecurityGroup, function(index, sg) {
		tbody.append($('<tr>')
			.append($('<td>')
				.append(sg.SecurityGroupId))
			.append($('<td>')
				.append(sg.Description))
			.append($('<td>')
                .append($('<button>').addClass('btn btn-default btn-xs btn-rules-sg')
                    .append($('<span>').addClass("glyphicon glyphicon-th-list")))
                    .append(' ')
                .append($('<button>').addClass('btn btn-default btn-xs btn-ecs-sg')
                    .append($('<span>').addClass("glyphicon glyphicon-ok")))
                    .append(' ')
				.append($('<button>').addClass('btn btn-default btn-xs btn-edit-sg')
					.append($('<span>').addClass("glyphicon glyphicon-pencil")))
                    .append(' ')
				.append($('<button>').addClass('btn btn-default btn-xs btn-remove-sg')
					.append($('<span>').addClass("glyphicon glyphicon-remove")))
			)
		);
	});	
}

// support only 100 security groups now
function reload_security_groups(ecs, region_id) {
	install_row_click_handler();
	install_row_action_handler();
	var tbody = $('#sg-table-body').html('');
	for (var i = 0; i < 2; i++) {
		ecs.describeSecurityGroups(region_id, i + 1, 50, function(json) {
			console.log("loaded " + json.SecurityGroups.SecurityGroup.length + " security groups");
			append_rows(json, tbody);
		});		
	}
}

function install_select_region_handler(ecs) {
	$('#selectregion').on('change', function() {
		reload_security_groups(ecs, this.value);
	});
}

function reload_regions(ecs) {
	ecs.describeRegions(function(json) {
		var select = $('#selectregion').children().remove().end();
		$.each(json.Regions.Region, function(index, region) {
			select.append($("<option>", {value: region.RegionId, html: region.LocalName}));
		});
		reload_security_groups(ecs, select.val());
	});
}