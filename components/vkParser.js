process.env.NODE_TLS_REJECT_UNAUTHORIZED='0'; //todo: check it out whats going on

const rp = require('request-promise');
const fetch = require('isomorphic-fetch');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');

const connectionPromise = require('./connectionPromise.js');

function parseFacultiesByUniversity(universityId) {
	//
}

function universitiesImportMysqlFromJSON(path) {

	var db = null;
	var univerMysql = [];
	var univerJson = [];
	var univerDiff = [];
	
	connectionPromise().then(function(connection) {

		db = connection
		return fs.readFileAsync(path, {encoding: 'utf8'});
	
	}).then(function(data) {

		univerJson = JSON.parse(data).universities;
		//console.log(data);

		var sql = ` SELECT id, name_short, name_full, vk_id FROM university;`;
		//console.log(sql);

		return db.queryAsync(sql); 

	}).then(function(result) {

		//console.log(result);
		univerMysql = result;

		for (var i = 0; i < univerJson.length; i++) {
			var indMysql = -1;
			var isNew = true;
			var isChanged = false; // if not isNew

			for (var j = 0; j < univerMysql.length; j++) {
				if (univerMysql[j].vk_id == univerJson[i][0]) {
					indMysql = j;
					isNew = false;
					isChanged = (univerJson[i][1] != univerMysql[j].name_short) ? true : false;
					break;
				}
			}
			univerDiff.push({
				isNew: isNew,
				isChanged: isChanged,
				idJson: univerJson[i][0],
				nameJson: univerJson[i][1],
				idMysql: (!isNew) ? univerMysql[indMysql].id : null
			});
		}
		//console.log('DIFF\n' + JSON.stringify(univerDiff));

		var valuesSQL = [];
		for (var k = 0; k < univerDiff.length; k++) {
			if (univerDiff[k].isNew) {
				valuesSQL.push(`('${univerDiff[k].nameJson}', ${univerDiff[k].idJson})`);
			}
		}

		var sql = ` INSERT INTO university(name_short, vk_id) VALUES ${valuesSQL.join(', ')};`;
		
		if (valuesSQL.length) {
			console.log(sql);
			return db.queryAsync(sql);	
		} else {
			return Promise.resolve('no new universitites');
		}

	}).then(function(result) {

		if (result) console.log(result);

		var promises = [];
		for (var k = 0; k < univerDiff.length; k++) {
			if (univerDiff[k].isChanged) {
				var sql = ` UPDATE university SET name_short = '${univerDiff[k].nameJson}' WHERE id = ${univerDiff[k].idMysql};`;
				console.log(sql);		
				promises.push(db.queryAsync(sql));
			}
		}
		
		return Promise.all(promises);		

	}).then(function(result) {

		if (result.length) {
			console.log(result);
		} else {
			console.log('no universities changed');
		}

	}).catch(function(err) {
	
		console.log(err.stack, err.message);
	
	});
}

/**/
function facultiesImportMysqlFromJSON(path) {
	var db = null;
	var university_id = null; // in mysql
	var facultyMysql = [];
	var facultyJson = [];
	var facultyDiff = [];
	
	connectionPromise().then(function(connection) {

		db = connection
		return fs.readFileAsync(path, {encoding: 'utf8'});
	
	}).then(function(data) {
		
		console.log(`START IMPORTING FILE '${path.substr(path.lastIndexOf('\\')+1)}'`);

		facultyJson = JSON.parse(data).faculties;
		//console.log(data);

		var sql = ` SELECT id FROM university WHERE vk_id = ${JSON.parse(data).university};`;
		//console.log(sql);

		return db.queryAsync(sql);

	}).then(function(result) {

		university_id = result[0].id;

		var sql = ` SELECT id, name_short, name_full, vk_id FROM faculty;`;
		//console.log(sql);

		return db.queryAsync(sql); 

	}).then(function(result) {

		//console.log(result);
		facultyMysql = result;

		for (var i = 0; i < facultyJson.length; i++) {
			var indMysql = -1;
			var isNew = true;
			var isChanged = false; // if not isNew

			for (var j = 0; j < facultyMysql.length; j++) {
				if (facultyMysql[j].vk_id == facultyJson[i][0]) {
					indMysql = j;
					isNew = false;
					isChanged = (facultyJson[i][1] != facultyMysql[j].name_full) ? true : false;
					break;
				}
			}
			facultyDiff.push({
				isNew: isNew,
				isChanged: isChanged,
				idJson: facultyJson[i][0],
				nameJson: facultyJson[i][1],
				idMysql: (!isNew) ? facultyMysql[indMysql].id : null
			});
		}
		//console.log('DIFF\n' + JSON.stringify(facultyDiff));

		var valuesSQL = [];
		for (var k = 0; k < facultyDiff.length; k++) {
			if (facultyDiff[k].isNew) {
				valuesSQL.push(`('${facultyDiff[k].nameJson}', ${facultyDiff[k].idJson}, ${university_id})`);
			}
		}

		var sql = ` INSERT INTO faculty(name_full, vk_id, university_id) VALUES ${valuesSQL.join(', ')};`;
		
		if (valuesSQL.length) {
			console.log(sql);
			return db.queryAsync(sql);	
		} else {
			return Promise.resolve('no new faculties');
		}

	}).then(function(result) {

		if (result) console.log(result);

		var promises = [];
		for (var k = 0; k < facultyDiff.length; k++) {
			if (facultyDiff[k].isChanged) {
				var sql = ` UPDATE faculty SET name_full = '${facultyDiff[k].nameJson}' WHERE id = ${facultyDiff[k].idMysql};`;
				console.log(sql);		
				promises.push(db.queryAsync(sql));
			}
		}
		
		return Promise.all(promises);		

	}).then(function(result) {

		if (result.length) {
			console.log(result);
		} else {
			console.log('no faculties changed');
		}

		console.log(`FINISH '${path.substr(path.lastIndexOf('\\')+1)}'`);

	}).catch(function(err) {
	
		console.log(err.stack, err.message);
		console.log(`FINISH '${path.substr(path.lastIndexOf('\\')+1)}'`);
	
	});
}

function facultiesImportMysqlFromJSON_All(pathToUniversitiesJsonFile) {
	var db = null;
	var universities = [];

	connectionPromise().then(function(connection) {

		db = connection;

		return fs.readFileAsync(pathToUniversitiesJsonFile, {encoding: 'utf8'}); 

	}).then(function(data) {

		universities = JSON.parse(data).universities;

		var promiseChain = Promise.resolve();
		for (let i = 0; i < universities.length; i++) {
			promiseChain.then(function() {
				return new Promise(function(resolve, reject) {
					facultiesImportMysqlFromJSON(path.normalize(`${__dirname}/../vk_data/faculty/faculty_for_${universities[i][0]}.txt`));
					resolve();
				});
			});
		}

	}).catch(function(err) {

		console.log(err.stack, err.message);

	});
}

/**/
function departmentsImportMysqlFromJSON(path) {
	var db = null;
	var faculty_id = null; // in mysql
	var departmentMysql = [];
	var departmentJson = [];
	var departmentDiff = [];

	connectionPromise().then(function(connection) {

		db = connection
		return fs.readFileAsync(path, {encoding: 'utf8'});
	
	}).then(function(data) {
		
		console.log(`\nSTART IMPORTING DEPARTMENTS FROM FILE '${path.substr(path.lastIndexOf('\\')+1)}'`);

		departmentJson = JSON.parse(data).chairs;

		var sql = ` SELECT id FROM faculty WHERE vk_id = ${JSON.parse(data).faculty};`;

		return db.queryAsync(sql);

	}).then(function(result) {

		faculty_id = result[0].id;

		var sql = ` SELECT id, name_full, vk_id FROM department WHERE faculty_id = ${faculty_id};`;

		return db.queryAsync(sql);

	}).then(function(result) {

		departmentMysql = result;

		for (var i = 0; i < departmentJson.length; i++) {
			var indMysql = -1;
			var isNew = true;
			var isChanged = false; // if not isNew

			for (var j = 0; j < departmentMysql.length; j++) {
				if (departmentMysql[j].vk_id == departmentJson[i][0]) {
					indMysql = j;
					isNew = false;
					isChanged = (departmentJson[i][1] != departmentMysql[j].name_full) ? true : false;
					break;
				}
			}
			departmentDiff.push({
				isNew: isNew,
				isChanged: isChanged,
				idJson: departmentJson[i][0],
				nameJson: departmentJson[i][1],
				idMysql: (!isNew) ? departmentMysql[indMysql].id : null
			});
		}

		var valuesSQL = [];
		for (var k = 0; k < departmentDiff.length; k++) {
			if (departmentDiff[k].isNew) {
				valuesSQL.push(`('${departmentDiff[k].nameJson}', ${departmentDiff[k].idJson}, ${faculty_id})`);
			}
		}

		var sql = ` INSERT INTO department(name_full, vk_id, faculty_id) VALUES ${valuesSQL.join(', ')};`;
		
		if (valuesSQL.length) {
			console.log(sql);
			return db.queryAsync(sql);	
		} else {
			return Promise.resolve('no new departments');
		}

	}).then(function(result) {

		if (result) console.log(result);

		var promises = [];
		for (var k = 0; k < departmentDiff.length; k++) {
			if (departmentDiff[k].isChanged) {
				var sql = ` UPDATE department SET name_full = '${departmentDiff[k].nameJson}' WHERE id = ${departmentDiff[k].idMysql};`;
				console.log(sql);
				promises.push(db.queryAsync(sql));
			}
		}

		return Promise.all(promises);

	}).then(function(result) {

		if (result.length) {
			console.log(result);
		} else {
			console.log('no departments changed');
		}

		console.log(`FINISH '${path.substr(path.lastIndexOf('\\')+1)}'`);

	}).catch(function(err) {

		console.log(err.message, err.stack);
		console.log(`FINISH '${path.substr(path.lastIndexOf('\\')+1)}'`);

	})	
}

function departmentsImportMysqlFromJSON_ALL(pathToFacultiesJsonFile) {
	var db = null;
	var faculties = [];

	connectionPromise().then(function(connection) {

		db = connection;

		return fs.readFileAsync(pathToFacultiesJsonFile, {encoding: 'utf8'}); 

	}).then(function(data) {

		faculties = JSON.parse(data).faculties;

		var promiseChain = Promise.resolve();
		for (let i = 0; i < faculties.length; i++) {
			promiseChain.then(function() {
				return new Promise(function(resolve, reject) {
					departmentsImportMysqlFromJSON(path.normalize(`${__dirname}/../vk_data/department/departments_for_${faculties[i][0]}.txt`));
					resolve();
				});
			});
		}

	}).catch(function(err) {

		console.log(err.stack, err.message);

	});
}

/**/
function getDepartmentsFromVKByFaculty(faculty_vk_id) {
	var FormData = require('form-data');
	var form = new FormData();
	
	form.append('act', 'a_get_fac_info');
	form.append('fac', faculty_vk_id);
	
	fetch('https://vk.com/select_ajax.php', {
		method: "POST",
		body: form
	}).then(function(response) {
		
		if (!response.ok) {
			throw new Error('VK_IS_UNAVAILABLE');
		}

		return response.text().then(function(result) {
			//console.log(result);
			var newFilePath = path.normalize(__dirname+'/../vk_data/department/departments_for_'+faculty_vk_id+'.txt');
			return fs.writeFileAsync(newFilePath, result, {mode: 0o775});
		});

	}).catch(function(err) {

		console.error(err.message, err.stack);

	});
}

function getDepartmentsFromVKByFaculty_ALL(university_id) {
	var db = null;
	var faculties = [];

	connectionPromise().then(function(connection) {

		db = connection;

		const filePath = path.normalize(`${__dirname}/../vk_data/faculty/faculty_for_${university_id}.txt`);

		return fs.readFileAsync(filePath, {encoding: 'utf8'}); 

	}).then(function(data) {

		faculties = JSON.parse(data).faculties;

		var promiseChain = Promise.resolve();
		for (let i = 0; i < faculties.length; i++) {
			promiseChain.then(function() {
				return new Promise(function(resolve, reject) {
					getDepartmentsFromVKByFaculty(faculties[i][0]);
					resolve();
				});
			});
		}

	}).then(function() {

		console.log('Done import faculties');

	}).catch(function(err) {

		console.log(err.stack, err.message);

	});
}

module.exports = {
	parseAndAddCities: function() {
		//
	},

	parseAndAddFaculties: function() {
		//
	},

	universitiesImportMysqlFromJSON: universitiesImportMysqlFromJSON
};

/* RUN */


// IMPORT DEPARTMENTS FOR ALL FACULTIES IN VUZ
//getDepartmentsFromVKByFaculty_ALL(3415);
//departmentsImportMysqlFromJSON_ALL(path.normalize(`${__dirname}/../vk_data/faculty/faculty_for_3415.txt`));


