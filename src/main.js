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
	return;
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

function reload_security_groups(ecs, region_id) {
	install_row_click_handler();
	ecs.describeSecurityGroups(region_id, 1, 50, function(json) {
		console.log("loaded " + json.SecurityGroups.SecurityGroup.length + " security groups")
		var tbody = $('#sg-table-body').html('');
		$.each(json.SecurityGroups.SecurityGroup, function(index, sg) {
			tbody.append($('<tr>')
				.append($('<td>')
					.append(sg.SecurityGroupId))
				.append($('<td>')
					.append(sg.Description))
				.append($('<td>')
					.append('<button type="button" class="btn btn-default btn-xs btn-edit-sg"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></button> <button type="button" class="btn btn-default btn-xs btn-remove-sg"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>'))
			);
		});
	});
	ecs.describeSecurityGroups(region_id, 2, 50, function(json) {
		console.log("loaded " + json.SecurityGroups.SecurityGroup.length + " security groups")
		$.each(json.SecurityGroups.SecurityGroup, function(index, sg) {
			tbody.append($('<tr>')
				.append($('<td>')
					.append(sg.SecurityGroupId))
				.append($('<td>')
					.append(sg.Description))
				.append($('<td>')
					.append('<button type="button" class="btn btn-default btn-xs btn-edit-sg"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></button> <button type="button" class="btn btn-default btn-xs btn-remove-sg"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>'))
			);
		});
	});
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