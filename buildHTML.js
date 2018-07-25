let fs = require("fs");
 
//combine scripts and styles into single html file
let combinedScripts = fs.readFileSync('./index.html').toString()
.replace('<link rel="stylesheet" href="filterStyle.css">','<style>' + fs.readFileSync('filterStyle.css') + '</style>')
.replace('src="chart.min.js">',  '>' + fs.readFileSync('chart.min.js'))
.replace('src="filterTable.js">', '>' + fs.readFileSync('filterTable.js'))
.replace('src="filterData.js">', '>' + fs.readFileSync('filterData.js'))
.replace('src="filterChart.js">', '>' + fs.readFileSync('filterChart.js'));

fs.writeFileSync('localbi.html', combinedScripts);

//run with: "node .\buildHTML.js"
