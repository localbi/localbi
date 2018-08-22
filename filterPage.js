
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
    let combinedScripts = fs.readFileSync('./filterIndex.html').toString()
    .replace('<link rel="stylesheet" href="filterStyle.css">','<style>' + fs.readFileSync('filterStyle.css') + '</style>')
    .replace('src="chart.min.js">',  '>' + fs.readFileSync('chart.min.js'))
    .replace('src="filterTable.js">', '>' + fs.readFileSync('filterTable.js'))
    .replace('src="filterData.js">', '>' + fs.readFileSync('filterData.js'))
    .replace('src="filterChart.js">', '>' + fs.readFileSync('filterChart.js'));

    fs.writeFileSync('localbi.html', combinedScripts);

    //run with: "node .\buildHTML.js"
}


const fs = require("fs");
const parse = require('csv-parse/lib/sync');
let Table1 = parse(fs.readFileSync('filterData.csv'), {delimiter: ','});


fs.writeFileSync('filterData.js', normaliseTable(Table1));

//buildHTML();

'use strict';
const nodemailer = require('nodemailer');

// Generate test SMTP service account from ethereal.email
// Only needed if you don't have a real mail account for testing
nodemailer.createTestAccount((err, account) => {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: account.user, // generated ethereal user
            pass: account.pass // generated ethereal password
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: 'rynhardt@hotmail.com', // list of receivers
        subject: 'Hello ✔', // Subject line
        text: 'Hello world?', // plain text body
        html: '<b>Hello world?</b>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    });
});