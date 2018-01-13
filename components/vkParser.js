process.env.NODE_TLS_REJECT_UNAUTHORIZED='0'; //todo: check it out whats going on

const rp = require('request-promise');
const fetch = require('isomorphic-fetch');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');

const connectionPromise = require('./connectionPromise.js');


// -- import MYSQL-- //

/* import universities */
/*function universitiesImportMysqlFromJSON(pathToCityJsonFile) {

	var db = null;
	var univerMysql = [];
	var univerJson = [];
	var univerDiff = [];
	
	connectionPromise().then(function(connection) {

		db = connection
		return fs.readFileAsync(pathToCityJsonFile, {encoding: 'utf8'});
	
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
}*/

/* Import faculties */
/*function facultiesImportMysqlFromJSON_All(pathToUniversityJsonFile) {
	var db = null;
	var universities = [];

	connectionPromise().then(function(connection) {

		db = connection;

		return fs.readFileAsync(pathToUniversityJsonFile, {encoding: 'utf8'}); 

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

function facultiesImportMysqlFromJSON(pathToFacultyFile) {
	var db = null;
	var university_id = null; // in mysql
	var facultyMysql = [];
	var facultyJson = [];
	var facultyDiff = [];
	
	connectionPromise().then(function(connection) {

		db = connection
		return fs.readFileAsync(pathToFacultyFile, {encoding: 'utf8'});
	
	}).then(function(data) {
		
		console.log(`START IMPORTING FILE '${pathToFacultyFile.substr(pathToFacultyFile.lastIndexOf('\\')+1)}'`);

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
}*/

/* Import departments */
function importDepartmentsByUniversityFile(pathToUniversityFile) {
	var db = null;
	var faculties = [];

	return connectionPromise().then(function(connection) {

		db = connection;

		return fs.readFileAsync(pathToUniversityFile, {encoding: 'utf8'}); 

	}).then(function(data) {

		faculties = JSON.parse(data).faculties;

		var promiseChain = Promise.resolve();
		for (let i = 0; i < faculties.length; i++) {
			promiseChain = promiseChain.then(function() {
				return new Promise(function(resolve, reject) {
					importDepartmentsByFacultyFile(path.normalize(`${__dirname}/../vk_data/1_faculties/${faculties[i][0]}.txt`));
					resolve();
				});
			});
		}

		promiseChain = promiseChain.catch(function(err) {
			console.error(err.message, err.stack);
		});

		return promiseChain;

	}).then(function() {
		console.log(`done importDepartmentsByUniversityFile()`);
	}).catch(function(err) {
		console.log(err.stack, err.message);
	});
}

function importDepartmentsByFacultyFile(pathToFacultyFile) {
	var db = null;
	var faculty_id = null; // in mysql
	var departmentMysql = [];
	var departmentJson = [];
	var departmentDiff = [];

	connectionPromise().then(function(connection) {

		db = connection
		return fs.readFileAsync(pathToFacultyFile, {encoding: 'utf8'});
	
	}).then(function(data) {
		
		console.log(`\nSTART IMPORTING DEPARTMENTS FROM FILE '${pathToFacultyFile.substr(pathToFacultyFile.lastIndexOf('\\')+1)}'`);

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

		console.log(`FINISH '${pathToFacultyFile.substr(pathToFacultyFile.lastIndexOf('\\')+1)}'`);

	}).catch(function(err) {

		console.log(err.message, err.stack);
		console.log(`FINISH '${pathToFacultyFile.substr(pathToFacultyFile.lastIndexOf('\\')+1)}'`);

	})	
}

// -- make JSON -- //

function makeFacultiesFilesByUniversityId(university_vk_id) {
	console.log(`makeFacultiesFilesByUniversityId(${university_vk_id})`);
	
	var filePath = path.normalize(`${__dirname}/../vk_data/2_universities/${university_vk_id}.txt`);
    
    return fs.readFileAsync(filePath, {encoding: 'utf8'}).then(function(data) {
    	var faculties = JSON.parse(data).faculties;
    	var promiseChain = Promise.resolve();
    	
    	for (let i = 0; i < faculties.length; i++) {
    		promiseChain = promiseChain.then(function() {
		    	var newFilename = `${faculties[i][0]}.txt`;
		    	console.log(`start making faculty file '${newFilename}'`);

		    	var FormData = require('form-data');
				var form = new FormData();
				
				form.append('act', 'a_get_fac_info');
				form.append('fac', faculties[i][0]);
				
				return fetch('https://vk.com/select_ajax.php', {
					method: "POST",
					body: form
				}).then(function(response) {		
					if (!response.ok) {
						throw new Error('VK_IS_UNAVAILABLE');
					}

					return response.text().then(function(result) {
						//console.log(result);
						var newFilePath = path.normalize(`${__dirname}/../vk_data/1_faculties/${faculties[i][0]}.txt`);
						return fs.writeFileAsync(newFilePath, result, {mode: 0o775});
					}).then(function() {
						console.log(`finish making file '${newFilename}'`);
					});
				}).catch(function(err) {
					console.log(`error making file '${newFilename}'`);
					console.error(err.message, err.stack);
				});
			});
		}

		promiseChain = promiseChain.catch(function(err) {
			console.error(err.message, err.stack);
		});

		return promiseChain;
    }).then(function() {
    	console.log(`Done makeFacultiesFilesByUniversityId(${university_vk_id})`);
    }).catch(function(err) {
		console.error(err.message, err.stack);
	});
}

function makeDepartmentsFromFacultiesFile(pathToUiversityJsonFile, limit = 10, offset = 0) {
	var db = null;
	let faculties = [];

	connectionPromise().then(function(connection) {
		db = connection;
		console.log(`=== Start Make Departments ${offset} .. ${limit} ===`);

		var filepath = path.normalize(pathToUiversityJsonFile);
		return fs.readFileAsync(filepath, {encoding: 'utf8'});
	}).then(function(data) {
		faculties = JSON.parse(data).faculties;
		
		var promises = [];

		var start = offset;
		var finish = Math.max(limit, faculties.length);

		//console.log(faculties);

		/*for (let i = start; i < finish; i++) {
			if (!faculties[i]) {
				console.log(`Fac ${i} has no departments`);
			} else {
				promises.push(makeJSON_Departments(faculties[i][0]));
			}
		}*/

		Promise.all(promises).then(function() {
			console.log(`=== Done Make Departments ${offset} .. ${limit} ===`);
		});
	}).catch(function(error) {
		console.error(error.message, error.stack);
	});
}

/* make faculties */
/*function makeJSON_Faculties(university_vk_id) {
	console.log(`start makeJSON_Faculties(${university_vk_id})`);
	var FormData = require('form-data');
	var form = new FormData();
	
	form.append('act', 'a_get_uni_info');
	form.append('uni', university_vk_id);
	
	return fetch('https://vk.com/select_ajax.php', {
		method: "POST",
		body: form
	}).then(function(response) {
		
		if (!response.ok) {
			throw new Error('VK_IS_UNAVAILABLE');
		}

		return response.text().then(function(result) {
			//console.log(result);
			var newFilePath = path.normalize(__dirname+'/../vk_data/faculties/'+university_vk_id+'.txt');
			return fs.writeFileAsync(newFilePath, result, {mode: 0o775});
		}).then(function() {
			console.log(`done makeJSON_Faculties(${university_vk_id})`);
		});

	}).catch(function(err) {
		console.log(`error makeJSON_Faculties(${university_vk_id})`);
		console.error(err.message, err.stack);
	});
}

function makeFacultiesFromUniversityFile(pathToUniversitiesJsonFile, limit = 10, offset = 0) {
	var db = null;
	let universities = [];
	var faculties = [];

	connectionPromise().then(function(connection) {
		db = connection;
		console.log(`=== Start Make Faculties ${offset} .. ${limit} ===`);

		var filepath = path.normalize(pathToUniversitiesJsonFile);
		return fs.readFileAsync(filepath, {encoding: 'utf8'});
	}).then(function(data) {
		universities = JSON.parse(data).universities;
		
		var promises = [];
		
		var start = offset;
		var finish = Math.max(limit, universities.length);

		for (let i = start; i < finish; i++) {
			promises.push(makeJSON_Faculties(universities[i][0]));
		}

		Promise.all(promises).then(function() {
			console.log(`=== Done Make Faculties ${offset} .. ${limit} ===`);
		});
	}).catch(function(error) {
		console.error(error.message, error.stack);
	});
}*/


/*function makeJSON_Universities(city_vk_id) {
	var FormData = require('form-data');
	var form = new FormData();
	
	form.append('act', 'a_get_city_info');
	form.append('city', city_vk_id);
	form.append('fields', '8');
	
	fetch('https://vk.com/select_ajax.php', {
		method: "POST",
		body: form
	}).then(function(response) {
		
		if (!response.ok) {
			throw new Error('VK_IS_UNAVAILABLE');
		}

		return response.text().then(function(result) {
			//console.log(result);
			var newFilePath = path.normalize(__dirname+'/../vk_data/universities/'+city_vk_id+'.txt');
			return fs.writeFileAsync(newFilePath, result, {mode: 0o775});
		});

	}).catch(function(err) {

		console.error(err.message, err.stack);

	});
}
*/

/**/
function countElements(pathToJsonFile, elementName) {
	// calculate count universities in JSON file
	var filepath = path.normalize(pathToJsonFile);
	var data = fs.readFileSync(filepath, {encoding: 'utf8'});
	var elements = JSON.parse(data)[elementName];
	return elements.length;
}



/* RUN */

//console.log(`count univ = ${ countElements(`${__dirname}/../vk_data/universities.txt`, 'universities') }`);

// Импортировать все кафедры всех факультетов университета (Место 13.01.2018)
var universityId = 1189601;
makeFacultiesFilesByUniversityId(universityId).then(function() {
	return importDepartmentsByUniversityFile(`${__dirname}/../vk_data/2_universities/${universityId}.txt`);
}).catch(function(err) {
	console.error(err);
});


// Запрос
/*var facultyId = 38883;
var FormData = require('form-data');
var form = new FormData();

form.append('act', 'a_get_fac_info');
form.append('fac', facultyId);

return fetch('https://vk.com/select_ajax.php', {
	method: "POST",
	body: form
}).then(function(response) {
	if (!response.ok) {
		throw new Error('VK_IS_UNAVAILABLE');
	}

	return response.text().then(function(result) {
		console.log(result);
	});

}).catch(function(err) {
	console.log(`error making file '${newFilename}'`);
	console.error(err.message, err.stack);
});*/