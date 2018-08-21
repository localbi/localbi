
function normaliseTable(tableData) {
	let normalisedFields = [];
	let normalisedRecords = [];
	for (let colIndex = 0; colIndex < tableData[0].length; colIndex++) {  //use table header as basis for number of columns

		let fieldName = tableData[0][colIndex];
		let fieldIsFound = false;  //to check if filterField exists
		let fieldIndex = 0;  //position of found filterField
		while (fieldIsFound == false && fieldIndex < normalisedFields.length) {  //search until we can confirm it doesn't exist in the list - use while so we can exit early
			if(fieldName == normalisedFields[fieldIndex][0]) fieldIsFound = true;
			else fieldIndex++;
		}
		if (fieldIsFound == false) {
			normalisedFields[fieldIndex] = [];  //new array for values
			normalisedFields[fieldIndex][0] = fieldName;  //first index is the fieldname
		}
		let normalisedValues = normalisedFields[fieldIndex];  //assign either existing or new array

		for (let rowIndex = 0; rowIndex < tableData.length; rowIndex++) {  //table data start at row 1

			let valueName = tableData[rowIndex][colIndex];
			let valueIsFound = false;  //to check if filterValue exists
			let valueIndex = 0;  //position of found filterValue
			while (valueIsFound == false && valueIndex < normalisedValues.length) {  //search until we can confirm it doesn't exist in the list - use while so we can exit early
				if (valueName == normalisedValues[valueIndex]) valueIsFound = true;
				else valueIndex++;
			}
			if (valueIsFound == false) normalisedValues[valueIndex] = valueName;  //define filterValue because it wasn't found, and valueIndex will be at the next open slot already to be added

			if (colIndex == 0) normalisedRecords[rowIndex] = [];  //assign blank array the first time
			normalisedRecords[rowIndex][colIndex] = valueIndex;  //assign index of value - assume colIndex is persistent
		}
	}
    let result = 'let fields=' + JSON.stringify(normalisedFields) + ';';
    result += '\nlet records=' + JSON.stringify(normalisedRecords).replace('"','') + ';';  //numeric keys, the quotes take up lotsa space so we remove them
	return result;
}


function buildHTML() {
    //combine scripts and styles into single html file
    let combinedScripts = fs.readFileSync('./index.html').toString()
    .replace('<link rel="stylesheet" href="filterStyle.css">','<style>' + fs.readFileSync('filterStyle.css') + '</style>')
    .replace('src="chart.min.js">',  '>' + fs.readFileSync('chart.min.js'))
    .replace('src="filterTable.js">', '>' + fs.readFileSync('filterTable.js'))
    .replace('src="filterData2.js">', '>' + fs.readFileSync('filterData2.js'))
    .replace('src="filterChart.js">', '>' + fs.readFileSync('filterChart.js'));

    fs.writeFileSync('localbi.html', combinedScripts);

    //run with: "node .\buildHTML.js"
}


const fs = require("fs");
const parse = require('csv-parse/lib/sync');
let Table1 = parse(fs.readFileSync('Invoices.csv'), {delimiter: ','});


fs.writeFileSync('normdata.js', normaliseTable(Table1));

//buildHTML();
