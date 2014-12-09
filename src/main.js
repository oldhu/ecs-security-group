var fs = require('fs');

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

function reload_security_groups(ecs, region_id) {
	ecs.describeSecurityGroups(region_id, 1, 10, function(json) {
		var tbody = $('#sg-table-body').html('');
		$.each(json.SecurityGroups.SecurityGroup, function(index, sg) {
			console.log(sg.SecurityGroupId);
			tbody.append($('tr')
				.append($('td')
					.append(sg.SecurityGroupId))
				.append($('td')
					.append(sg.Description))
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