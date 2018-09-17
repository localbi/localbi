'use strict';

/** 
 * Namespace for localBi classes and functions.
 * @namespace
 */
var localBi = localBi || {};

/** 
 * Builds an HTML page with embedded data, script and markup. Can be mailed to multiple recipients.
 * @method
 * @param {tableRow[]} tableData - Two dimensional array representing a table (recordset).
 * @param {object[]} tableData[tableRow] - Each row is an array of {string/number}.
 * @returns {string} A string containing JS code that can be appended to a script.
 */
localBi.filterPage = function() {

    /** 
     * Builds a normalised set of fields and records from a denormalised table. Each field is scanned and only unique values stored in each filterField. Each record is scanned and only a reference to the field value is stored in each filterRecord.
     * @method
     * @param {tableRow[]} tableData - Two dimensional array representing a table (recordset).
     * @param {object[]} tableData[tableRow] - Each row is an array of {string/number}.
     * @returns {string} A string containing JS code that can be appended to a script.
     */
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
        let result = 'var fields=' + JSON.stringify(normalisedFields) + ';';
        result += '\nvar records=' + JSON.stringify(normalisedRecords).replace('"','') + ';';  //numeric keys, the quotes take up lotsa space so we remove them
        return result;
    }

    function mailPage(mailSpecification) {  //mail page to recipients
        let nodemailer = require('nodemailer');

        let transporter = nodemailer.createTransport({  // create reusable transporter object using the default SMTP transport
            service: 'gmail',
            auth: {
                user: mailSpecification.user,
                pass: mailSpecification.pass                }
        });

        let mailOptions = {  // setup email data with unicode symbols
            from: mailSpecification.from, // sender address
            to: mailSpecification.to, // list of receivers
            subject: mailSpecification.subject, // Subject line
            text: mailSpecification.text, // plain text body
            attachments: [
                {   // stream as an attachment
                    filename: mailSpecification.filename,
                    content: mailSpecification.content
                }]
        };

        transporter.sendMail(mailOptions, (error, info) => {  // send mail with defined transport object
            if (error) {
                return console.log(error);
            }
            console.log('Sent: %s', info.accepted);
        });
    }

    function buildPage(fileName) {  //build complete html page
        let fs = require("fs");
        let parse = require('csv-parse/lib/sync');

        let csvData = parse(fs.readFileSync('filterData.csv'), {delimiter: ','});
        fs.writeFileSync('filterData.js', normaliseTable(csvData));
        
        let combinedScripts = fs.readFileSync('./filterIndex.html').toString()  //combine scripts and styles into single html file
        .replace('<link rel="stylesheet" href="filterStyle.css">','<style>' + fs.readFileSync('filterStyle.css') + '</style>')
        .replace(' src="chart.min.js">',  '>\n' + fs.readFileSync('chart.min.js'))
        .replace(' src="filterTable.js">', '>\n' + fs.readFileSync('filterTable.js'))
        .replace(' src="filterData.js">', '>\n' + fs.readFileSync('filterData.js'))
        .replace(' src="filterChart.js">', '>\n' + fs.readFileSync('filterChart.js'));

        fs.writeFileSync(fileName, combinedScripts);
        return combinedScripts;
    }

    {  //main
        let fs = require("fs");
        let parse = require('csv-parse/lib/sync');
        let mailData = parse(fs.readFileSync('filterMail.csv'), {delimiter: ','});
        let mailContent = buildPage('localBi.html')
        /*
        for (let mailIndex = 1; mailIndex < mailData.length; mailIndex++) {  //skip header
            mailPage({
                user: mailData[mailIndex][mailData[0].indexOf('user')],
                pass: mailData[mailIndex][mailData[0].indexOf('pass')],
                from: mailData[mailIndex][mailData[0].indexOf('from')],
                to: mailData[mailIndex][mailData[0].indexOf('to')],
                subject: mailData[mailIndex][mailData[0].indexOf('subject')],
                text: mailData[mailIndex][mailData[0].indexOf('text')],
                filename: 'localBi.html',
                content: mailContent
            });
        }
        */
    }
}

//run with: "node filterPage.js"
localBi.filterPage();
