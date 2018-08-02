"use strict";

/**
 * @description Sets up the local BI page.
 * @returns {filterChart}
 */
function filterChart(filterMeasures) {
  let filterChart = {  //define filterChart
    chartTable: null,
    chartFields: null,
    chartMeasures: null,
    flexDimension: null,
    flexMeasure: null,
    /**
     * @description Builds markup for page header. Every field in this.chartFields gets a navigation panel.
     * @param {string} elementId The elementId for the header.
     */
    buildFields(elementId) {
      let filterFields = document.getElementById(elementId);  //container for all fields
      let listButton = document.createElement('button');  //button to list and clear all filters
      listButton.className = 'filterList';
      listButton.onclick = function() {  //  clear all fields and flexDimension field
        for (let fieldIndex = 0; fieldIndex < filterChart.chartFields.length; fieldIndex++) {
          let fieldName = filterChart.chartFields[fieldIndex].field;
          filterChart.adjustSelect(fieldName,0);
        }
        filterChart.flexDimension = null;
        filterChart.flexMeasure = null;
        filterChart.refresh();
      };
      listButton.innerText = String.fromCharCode(9671);
      listButton.id = 'filterList';  //NB - this id is used by other code!
      filterFields.appendChild(listButton);

      let measureSelect = document.createElement('select');  //measure list
      measureSelect.className = 'filterMeasures';
      measureSelect.onchange = function() {  //
        if (measureSelect.options[measureSelect.selectedIndex].value == null) filterChart.flexMeasure = null;  //we have a non-selection option in the list
        else filterChart.flexMeasure = JSON.parse(measureSelect.options[measureSelect.selectedIndex].value);
        // {
        //   label: measureSelect.options[measureSelect.selectedIndex].text,
        //   calculation: measureSelect.options[measureSelect.selectedIndex].value};
        filterChart.refresh();
      };
      measureSelect.id = 'measureFlex';  //NB - this id is used by other code!
      measureSelect.multiple = false;
      filterFields.appendChild(measureSelect);
      let defaultOption = document.createElement('option');  //default option
      defaultOption.text = String.fromCharCode(9671);  //label
      defaultOption.value = null;  //calculation function
      measureSelect.add(defaultOption);
      for (let measureIndex = 0; measureIndex < this.chartMeasures.length; measureIndex++) {  //build field navigation for all fields
        let measureItem = this.chartMeasures[measureIndex];
        let option = document.createElement('option');
        option.text = measureItem.label;  //label
        option.value = JSON.stringify(measureItem);  //calculation function
        console.log(option.value);
        measureSelect.add(option);
      }

      for (let fieldIndex = 0; fieldIndex < this.chartFields.length; fieldIndex++) {  //build field navigation for all fields
        let fieldName = this.chartFields[fieldIndex].field;

        let fieldDiv = document.createElement('div');  //container for all field collateral
        fieldDiv.className = 'filterField';
        filterFields.appendChild(fieldDiv);

        let titleButton = document.createElement('button');  //title button, click to sort
        titleButton.className = 'filterTitle';
        titleButton.onclick = function() {  //sort and toggle through asc/desc
          filterChart.sortSelect(fieldName, -1);
        };
        titleButton.textContent = 'x' + this.chartFields[fieldIndex].label;  //initial sort order is unassigned
        titleButton.id = fieldName + '.sort';  //NB - this id is used by other code!
        fieldDiv.appendChild(titleButton);

        let fieldSelect = document.createElement('select');  //select list, click to refresh
        fieldSelect.className = 'filterSelect';
        fieldSelect.onchange = function() {  //refresh the page
          filterChart.refresh();
        };
        fieldSelect.id = fieldName + '.select';  //NB - this id is used by other code!
        fieldSelect.multiple = true;
        fieldDiv.appendChild(fieldSelect);
        this.buildSelect(fieldName);

        let buttonsDiv = document.createElement('div');  //container for all field collateral
        buttonsDiv.className = 'filterButtons';
        fieldDiv.appendChild(buttonsDiv);
        
        let flexDimensionButton = document.createElement('button');  //button to set which field is used to flexDimension the charts
        flexDimensionButton.className = 'filterAdjust';
        flexDimensionButton.onclick = function() {  //-1 = set all options to inverted
          if (filterChart.flexDimension != null && fieldName == filterChart.flexDimension.fieldName) filterChart.flexDimension = null;  //if set to this field, unset
          else filterChart.flexDimension = {  //
            field: fieldName, 
            label: fieldName 
          };  //otherwise set
          filterChart.refresh();
        };
        flexDimensionButton.textContent = String.fromCharCode(10070);
        flexDimensionButton.id = fieldName + '.flexDimension';  //NB - this id is used by other code!
        buttonsDiv.appendChild(flexDimensionButton);

        let invertButton = document.createElement('button');  //button to invert field filter
        invertButton.className = 'filterAdjust';
        invertButton.onclick = function() {  //-1 = set all options to inverted
          filterChart.adjustSelect(fieldName,-1);
          filterChart.refresh();
        };
        invertButton.textContent = String.fromCharCode(11030);  //9931
        invertButton.id = fieldName + '.invert';  //NB - this id is used by other code!
        buttonsDiv.appendChild(invertButton);
        
        let clearButton = document.createElement('button');  //button to clear field filters
        clearButton.className = 'filterAdjust';
        clearButton.onclick = function() {  //0 = set all options to false
          filterChart.adjustSelect(fieldName,0);
          filterChart.refresh();
        };
        clearButton.textContent = String.fromCharCode(9671);
        clearButton.id = fieldName + '.clear';  //NB - this id is used by other code!
        buttonsDiv.appendChild(clearButton);
      }
      return filterFields;
    },
     /**
     * @description Builds markup for header. Clicking footer does nothing.
     * @param {string} elementId The elementId for the footer.
     */
    buildHeader(elementId) {
      let filterHeader = document.getElementById(elementId);  //container for footer
      filterHeader.onclick = function() {  //help text
      };
      let span1 = document.createElement('span');  //heading
      span1.textContent = 'Sales Report';
      filterHeader.appendChild(span1);
      return filterHeader;
    },
    /**
     * @description Builds markup for footer. Clicking footer brings up help.
     * @param {string} elementId The elementId for the footer.
     */
    buildFooter(elementId) {
      let filterFooter = document.getElementById(elementId);  //container for footer
      // filterFooter.onclick = function() {  //help text
      //   alert('localBI - the analysis engine that runs locally\n\n' +
      //     'Click a field value to filter\n' +
      //     'Click a field heading to sort ascending/descending\n' +
      //     String.fromCharCode(9670) + ' Active value (no dormant records)\n' +
      //     String.fromCharCode(9672) + ' Active and dormant value (active and dormant records)\n' +
      //     String.fromCharCode(9671) + ' Dormant value (no active records)\n' +
      //     ''); 
      // };
      let anchor = document.createElement('a');  //local
      anchor.href = "https://github.com/localbi/localbi";
      anchor.target = "_blank";
      filterFooter.appendChild(anchor);
      let span1 = document.createElement('span');  //local
      span1.textContent = 'local';
      span1.style.color = '#0000ff';
      anchor.appendChild(span1);
      let span2 = document.createElement('span');  //BI
      span2.textContent = 'BI';
      span2.style.color = '#ffffff';
      anchor.appendChild(span2);
      return filterFooter;
    },
    /**
     * @description Builds select options from filterField values
     * @param {string} elementId The elementId of the select element
     */
    buildSelect(elementId) {
      let filterField = this.chartTable.filterField(elementId);  //get field from name
      let select = document.getElementById(elementId + '.select');  //NB - hardcoded reference qualifier
      for (let valueIndex = 0; valueIndex < filterField.filterValues.length; valueIndex++) {
        let fieldValue = filterField.filterValues[valueIndex];
        let fieldIcon = 'x'; //unassigned
        let option = document.createElement('option');
        option.text = fieldIcon + fieldValue.valueName; //prepend icon to option text
        option.value = fieldValue.valueIndex;  //references to the filterValues can be done by this index
        select.add(option);
      }
    },
    /**
     * @description Refreshes select options from filterField values
     * @param {string} elementId The elementId of the select element
     */
    updateSelect(elementId) {
      let filterField = this.chartTable.filterField(elementId);  //get field from name
      let select = document.getElementById(elementId + '.select');  //NB - hardcoded reference qualifier
      let options = select.options;
      for (let optionIndex = 0; optionIndex < options.length; optionIndex++) {
        let option = options[optionIndex];
        let fieldValue = filterField.filterValues[option.value];  //this gets the value by its index
        let fieldIcon = 'x'; //unassigned
        if (fieldValue.valueActiveRows > 0 && fieldValue.valueDormantRows > 0) fieldIcon = String.fromCharCode(9672);  //both = bullseye//9673//10687
        else if (fieldValue.valueActiveRows == 0 && fieldValue.valueDormantRows > 0) fieldIcon = String.fromCharCode(9671); //dormant = empty//9898//11096//9675
        else if (fieldValue.valueActiveRows > 0 && fieldValue.valueDormantRows == 0) fieldIcon = String.fromCharCode(9670); //active = full//9899//11044//9679
        option.text = fieldIcon + fieldValue.valueName; //prepend icon to option text
        }
    },
    /**
     * @description Get select options into a filter definition
     * @param {string} elementId The elementId of the select element
     * @returns {filterDefinition}
     */
    getSelect(elementId) {
      let filterDefinition = [];
      let select = document.getElementById(elementId + '.select');  //NB - hardcoded reference qualifier
      let selectedValues = [];
      let options = select.options;
      for (let optionIndex = 0; optionIndex < options.length; optionIndex++) {
        let option = options[optionIndex];
        if (option.selected) selectedValues.push(option.text.substr(1));  //save only the selected options's value (minus icon) - can we use index here?? yes but only if we update the filterTable code which currently does not suppor this
      }
      if (selectedValues.length == 0) {  //nothing selected means everything is selected :)
        let clearButton = document.getElementById(elementId + '.clear');  //NB - hardcoded reference qualifier
        //clearButton.textContent = String.fromCharCode(9671);  //indicate nothing is selected
        clearButton.style.backgroundColor = null;
        clearButton.style.color = null;
        filterDefinition.push(   { fieldName : elementId, fieldIndex : null, filterValue : '*', valueIsFiltered : true	});
      }
      else {  //something is selected
        let clearButton = document.getElementById(elementId + '.clear');  //NB - hardcoded reference qualifier
        //clearButton.textContent = String.fromCharCode(9670);  //indicate something is selected
        clearButton.style.backgroundColor = '#444444';
        clearButton.style.color = '#ffffff';
        filterDefinition.push(   { fieldName : elementId, fieldIndex : null, filterValue : '*', valueIsFiltered : false	});
        for (let selectedIndex = 0; selectedIndex < selectedValues.length; selectedIndex++) {  
          filterDefinition.push( { fieldName : elementId, fieldIndex : null, filterValue : selectedValues[selectedIndex], valueIsFiltered : true })
        }
      }
      return filterDefinition;
    },
    /**
     * @description Adjust select options based on the action parameter
     * @param {string} elementId The elementId of the select element
     * @param {int} action 1 = true, 0 = false, -1 = invert
     */
    adjustSelect(elementId, action) {
      let select = document.getElementById(elementId + '.select');  //NB - hardcoded reference qualifier
      let options = select.options;
      for (let optionIndex = 0; optionIndex < options.length; optionIndex++) {
        let option = options[optionIndex];
        if (action == 1) option.selected = true;
        else if (action == 0) option.selected = false;
        else if (action == -1) option.selected = !option.selected;
      }
//      this.refresh();
    },
    /**
     * @description Sort select options alternating ascending/descending
     * @param {string} elementId The elementId of the field
     * @param {int} action 1 = sort ascending, 0 = no toggle, -1 = toggle
     */
    sortSelect(elementId, action) {
			let fieldIsFound = false;  //to check if field exists
			let fieldIndex = 0;  //position of found field
			while (fieldIsFound == false && fieldIndex < this.chartFields.length) {  //search until we can confirm it doesn't exist in the list - use while so we can exit early
				if(elementId == this.chartFields[fieldIndex].field) fieldIsFound = true;
				else fieldIndex++;
      }
      let fieldSort = this.chartFields[fieldIndex].sort;  //find sort type from field name
      let select = document.getElementById(elementId + '.select');  //NB - hardcoded reference qualifier
      let title = document.getElementById(elementId + '.sort');  //NB - hardcoded reference qualifier
      let sortIcon = title.textContent.substr(0,1);  //title text is prefixed with sort icon
      let options = select.options;
      let unsortedOptions = [];
      let sortedOptions = [];
      for (let optionIndex = 0; optionIndex < options.length; optionIndex++) {  //get unsorted options
        unsortedOptions.push(options[optionIndex]);
      }
      if (action == 1 || sortIcon == 'x') sortIcon = String.fromCharCode(9650);  //we check the unassiged char here, so we can keep all the unicode stuff in one place - default to asc first time
      else if (action == -1) {  //update icon to inverse
        if (sortIcon == String.fromCharCode(9650)) sortIcon = String.fromCharCode(9660);
        else sortIcon = String.fromCharCode(9650);
      }
      title.textContent = sortIcon + title.textContent.substr(1);  //update title
      if (sortIcon == String.fromCharCode(9650)) {  //sort options ascending
        sortedOptions = unsortedOptions.sort(function (a, b) {
          let aIcon = a.text.substr(0,1);
          if (aIcon == String.fromCharCode(9671)) aIcon = String.fromCharCode(9673);  //reassign dormant icon to get correct sort order
          let bIcon = b.text.substr(0,1);
          if (bIcon == String.fromCharCode(9671)) bIcon = String.fromCharCode(9673);  //reassign dormant icon to get correct sort order
          let aValue = a.text.substr(1);
          let bValue = b.text.substr(1);
          let iconCompare = aIcon.localeCompare(bIcon);
          let valueCompare = false;
          if (fieldSort == 'text' || fieldSort == 'number') valueCompare = aValue.localeCompare(bValue);  //by default do text and number the same
          else if (fieldSort.length > 0) valueCompare = fieldSort.indexOf(aValue) - fieldSort.indexOf(bValue);  //else use defined sort order
          return iconCompare || valueCompare;  //icon sort remains the same
        });
      }
      else {  //sort options descending
        sortedOptions = unsortedOptions.sort(function (a, b) {
          let aIcon = a.text.substr(0,1);
          if (aIcon == String.fromCharCode(9671)) aIcon = String.fromCharCode(9673);  //reassign dormant icon to get correct sort order
          let bIcon = b.text.substr(0,1);
          if (bIcon == String.fromCharCode(9671)) bIcon = String.fromCharCode(9673);  //reassign dormant icon to get correct sort order
          let aValue = a.text.substr(1);
          let bValue = b.text.substr(1);
          let iconCompare = aIcon.localeCompare(bIcon);
          let valueCompare = false;
          if (fieldSort == 'text' || fieldSort == 'number') valueCompare = bValue.localeCompare(aValue);  //by default do text and number the same
          else if (fieldSort.length > 0) valueCompare = fieldSort.indexOf(bValue) - fieldSort.indexOf(aValue);  //else use defined sort order
          return iconCompare || valueCompare;  //icon sort remains the same
        });
      }
      for (let optionIndex = 0; optionIndex < sortedOptions.length; optionIndex++) {  //rearrange options
        options[optionIndex] = sortedOptions[optionIndex];
      }
    },

    /**
     * @description Creates all chart types
     */
    buildCharts() {  //looks like we cater for max 2 dims and 2 meas, some charts will have more or less
      "use strict";

      function getIndexedColorArray(alpha) {  //returns all chart colours, with an alpha
        let kellyColors = ['#FFB300','#803E75','#FF6800','#A6BDD7','#C10020','#CEA262','#817066','#007D34','#F6768E','#00538A','#FF7A5C','#53377A','#FF8E00','#B32851','#F4C800','#7F180D','#93AA00','#593315','#F13A13','#232C16'];  //Kelly's colors of maximum contrast
        for (let colorIndex = 0; colorIndex < kellyColors.length; colorIndex++) {
          kellyColors[colorIndex] = kellyColors[colorIndex] + alpha;  //add alpha value (hex expected)
        }
        return kellyColors;
      };

      function getIndexedColor(colorIndex, alpha) {  //looks up chart colour from an index
        let kellyColors = getIndexedColorArray(alpha);  //apply alpha
        let remainder = colorIndex%(kellyColors.length);  //if we exceed the length, start again
        return kellyColors[remainder];  //add alpha value (hex expected)
      };

      //sort by either first dimension or first measure
      function sortHierarchy(chartHierarchy, chartSpecification) {  //we can only do this once the hierarchy is fully built
        if (chartSpecification.display.sort == 'dimension') {  //sort by first dimension ascending (currently no provision is made for sorting this descending because it's uncommon and I'm feeling lazy)
          let fieldIsFound = false;  //to check if field exists
          let fieldIndex = 0;  //position of found field
          while (fieldIsFound == false && fieldIndex < filterChart.chartFields.length) {  //search until we can confirm it doesn't exist in the list - use while so we can exit early
            if(chartSpecification.dimensions[0].field == filterChart.chartFields[fieldIndex].field) fieldIsFound = true;
            else fieldIndex++;
          }
          let fieldSort = filterChart.chartFields[fieldIndex].sort;  //find sort type from field name
          if (fieldSort == 'text' || fieldSort == 'number') chartHierarchy = chartHierarchy.sort(function (a, b) {  //sort by first dimension
            return a.value.localeCompare(b.value);  //by default do text and number the same
          });
          else if (fieldSort.length > 0) chartHierarchy = chartHierarchy.sort(function (a, b) {  //sort by first dimension
            return fieldSort.indexOf(a.value) - fieldSort.indexOf(b.value);  //else use defined sort order
          });
        }
        else if (chartSpecification.display.sort == 'measure') chartHierarchy = chartHierarchy.sort(function (a, b) {  //sort by first measure (currently no provision is made for sorting this descending because it's uncommon and I'm feeling lazy)
            return parseFloat(b.measures[0].value) - parseFloat(a.measures[0].value);  //numeric compare
        });
        return chartHierarchy;
      };

      let lbiCharts = document.getElementsByName('lbiChart');  //all charts should have the name lbiChart
      for (let chartIndex = 0; chartIndex < lbiCharts.length; chartIndex++) {  //we should get a collection of all the charts defined in the html tags
        let lbiChart = lbiCharts[chartIndex];
        let chartSpecification = JSON.parse(lbiChart.dataset.lbiChart);  //expect valid JSON in the tag's data-lbi-chart attribute

        // let chartSpecification.dimensions = [];  //build dimensions specification
        // for (let dimensionIndex = 0; dimensionIndex < chartSpecification.dimensions.length; dimensionIndex++) {
        //   let dimensionSpecification = chartSpecification.dimensions[dimensionIndex];
        //   chartSpecification.dimensions[dimensionIndex] = {  //@typedef {Object} dimensionSpecification - specify a dimension by name.
        //     fieldName: dimensionSpecification.field,  //field name of dimension (required).
        //     label: dimensionSpecification.label  //label of dimension (required).
        //   };
        // }

        if (this.flexDimension != null) {  //wait for a valid flexDimension field
          let dimensionIsFound = false;  //only add/replace flexDimension if not already part of the spec
          let dimensionIndex = 0;
          while (dimensionIsFound == false && dimensionIndex < chartSpecification.dimensions.length) {  //exit as soon as we find the flexDimension
            if (chartSpecification.dimensions[dimensionIndex].field == this.flexDimension.field) dimensionIsFound = true;
						else dimensionIndex++;
          }
          if (dimensionIsFound == false) {
            if (chartSpecification.display.flexDimension == 'add') chartSpecification.dimensions.push(this.flexDimension);  //add flexDimension field to end
            else if (chartSpecification.display.flexDimension == 'replace') chartSpecification.dimensions[(chartSpecification.dimensions.length)-1] = this.flexDimension;  //replace last field with flexDimension field 
          }
        }

        // let chartSpecification.measures = [];  //build measures specification
        // for (let measureIndex = 0; measureIndex < chartSpecification.measures.length; measureIndex++) {
        //   let measureSpecification = chartSpecification.measures[measureIndex];
        //   chartSpecification.measures[measureIndex] = {  //@typedef {Object} measureSpecification - specify a measure by name.
        //     //fieldName: measureSpecification.field,  //fieldName - field name of measure (required).
        //     label: measureSpecification.label,  //label - label of aggregated measure (required).
        //     calculation: measureSpecification.calculation  //calculation - calculation function (required).
        //   };
        // }

        if (this.flexMeasure != null) {  //wait for a valid flexMeasure field
          let measureIsFound = false;  //only add/replace flexmeasure if not already part of the spec
          let measureIndex = 0;
          while (measureIsFound == false && measureIndex < chartSpecification.measures.length) {  //exit as soon as we find the flexmeasure
            if (chartSpecification.measures[measureIndex].calculation == this.flexMeasure.calculation) measureIsFound = true;
						else measureIndex++;
          }
          if (measureIsFound == false) {
            if (chartSpecification.display.flexMeasure == 'add') chartSpecification.measures.push(this.flexMeasure);  //add flexMeasure field to end
            else if (chartSpecification.display.flexMeasure == 'replace') chartSpecification.measures[(chartSpecification.measures.length)-1] = this.flexMeasure;  //replace last field with flexMeasure field 
          }
        }
        
        let chartHierarchy = this.chartTable.aggregate({  //@typedef {Object} aggregateSpecification
          dimensions: chartSpecification.dimensions,  //array of chartSpecification.dimensions (required).
          measures: chartSpecification.measures  //array of chartSpecification.measures (required).
        });

        


        let chartTitle = chartSpecification.measures[0].label;  //automatically use "Measure by Dim1, Dim2" as title
        let dimensionTitle = '';
        if (chartSpecification.dimensions.length > 0) {
          for (let dimensionIndex = 0; dimensionIndex < chartSpecification.dimensions.length; dimensionIndex++) {
            if (dimensionTitle.length > 0) dimensionTitle += ', ';  //add comma separator
            dimensionTitle += chartSpecification.dimensions[dimensionIndex].field;
          }
          chartTitle += ' by ' + dimensionTitle;
        }

        if (chartSpecification.display.type == 'bar') {
          sortHierarchy(chartHierarchy, chartSpecification);  //sort by first measure asc
          let labels = [];  //convert hierarchy to chart.js structure
          let datasets = [];
          for (let labelIndex = 0; labelIndex < chartHierarchy.length; labelIndex++) {
            let chartLabel = chartHierarchy[labelIndex];
            labels[labelIndex] = chartLabel.value;
            if (chartLabel.children.length == 0) {  //one dimension, one measure
              let datasetIndex = 0;
              if (datasets[datasetIndex] == null) datasets[datasetIndex] = {  //only init the first time round, specific per chart type
                label: chartSpecification.measures[0].label,//chartHierarchy[datasetIndex].measures[0].label,  //only one dimension, so use measure label
                type: 'bar',
                backgroundColor: getIndexedColor(datasetIndex, '88'),
                borderColor : getIndexedColor(datasetIndex, 'FF'),
                borderWidth : 1,
                hoverBackgroundColor: getIndexedColor(datasetIndex, 'CC'),
                hoverBordercolor : getIndexedColor(datasetIndex, 'FF'),
                hoverBorderWidth : 1,
                data: []
              }
              datasets[datasetIndex].data[labelIndex] = chartLabel.measures[0].value;  //use only the first measure of first dimension
            }
            else {  //two dimensions, one measure
              for (let datasetIndex = 0; datasetIndex < chartLabel.children.length; datasetIndex++) {
                if (datasets[datasetIndex] == null) datasets[datasetIndex] = {  //only init the first time round, specific per chart type
                  label: chartLabel.children[datasetIndex].value,  //when more than one dimension, use second dimension value
                  type: 'bar',
                  backgroundColor: getIndexedColor(datasetIndex, '88'),
                  borderColor : getIndexedColor(datasetIndex, 'FF'),
                  borderWidth : 1,
                  hoverBackgroundColor: getIndexedColor(datasetIndex, 'CC'),
                  hoverBordercolor : getIndexedColor(datasetIndex, 'FF'),
                  hoverBorderWidth : 1,
                  data: []
                }
                datasets[datasetIndex].data[labelIndex] = chartLabel.children[datasetIndex].measures[0].value;  //use only the first measure of second dimension
              }
            }
          }
          let chartCanvas = document.createElement('canvas');  //recreate the canvas each time
          chartCanvas.width = chartSpecification.display.width;  //setup canvas aspect ratio
          chartCanvas.height = chartSpecification.display.height;  //setup canvas aspect ratio
          lbiChart.innerHTML = '';  //remove old chart.js canvas
          lbiChart.appendChild(chartCanvas);
          let newChart = new Chart(chartCanvas, {
            type: 'bar',
            data: {
              labels: labels,
              datasets: datasets
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                xAxes: [ {    
                  categoryPercentage: 0.5,
                  barPercentage: 1.0
                }]
              },
              title: {
                display: true,
                text: chartTitle
              }
            }
          });
        }
        else if (chartSpecification.display.type == 'line') {
          sortHierarchy(chartHierarchy, chartSpecification);  //sort by first dim asc
          let labels = [];  //convert hierarchy to chart.js structure
          let datasets = [];
          for (let labelIndex = 0; labelIndex < chartHierarchy.length; labelIndex++) {
            let chartLabel = chartHierarchy[labelIndex];
            labels[labelIndex] = chartLabel.value;
            if (chartLabel.children.length == 0) {  //one dimension, one measure
              let datasetIndex = 0;
              if (datasets[datasetIndex] == null) datasets[datasetIndex] = {  //only init the first time round, specific per chart type
                label: chartSpecification.measures[0].label,//chartHierarchy[datasetIndex].measures[0].label,  //only one dimension, so use measure label
                type: 'line',
                fill: false,
                backgroundColor: getIndexedColor(datasetIndex, '88'),
                borderColor : getIndexedColor(datasetIndex, 'FF'),
                borderWidth : 1,
                hoverBackgroundColor: getIndexedColor(datasetIndex, 'CC'),
                hoverBordercolor : getIndexedColor(datasetIndex, 'FF'),
                hoverBorderWidth : 1,
                data: []
              }
              datasets[datasetIndex].data[labelIndex] = chartLabel.measures[0].value;  //use only the first measure of first dimension
            }
            else {  //two dimensions, one measure
              for (let datasetIndex = 0; datasetIndex < chartLabel.children.length; datasetIndex++) {
                if (datasets[datasetIndex] == null) datasets[datasetIndex] = {  //only init the first time round, specific per chart type
                  label: chartLabel.children[datasetIndex].value,  //when more than one dimension, use second dimension value
                  type: 'line',
                  fill: false,
                  backgroundColor: getIndexedColor(datasetIndex, '88'),
                  borderColor : getIndexedColor(datasetIndex, 'FF'),
                  borderWidth : 1,
                  hoverBackgroundColor: getIndexedColor(datasetIndex, 'CC'),
                  hoverBordercolor : getIndexedColor(datasetIndex, 'FF'),
                  hoverBorderWidth : 1,
                  data: []
                }
                datasets[datasetIndex].data[labelIndex] = chartLabel.children[datasetIndex].measures[0].value;  //use only the first measure of second dimension
              }
            }
          }
          let chartCanvas = document.createElement('canvas');  //recreate the canvas each time
          chartCanvas.width = chartSpecification.display.width;  //setup canvas aspect ratio
          chartCanvas.height = chartSpecification.display.height;  //setup canvas aspect ratio
          lbiChart.innerHTML = '';  //remove old chart.js canvas
          lbiChart.appendChild(chartCanvas);
          let newChart = new Chart(chartCanvas, {
            type: 'line',
            data: {
              labels: labels,
              datasets: datasets
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              title: {
                display: true,
                text: chartTitle
              }
            }
          });
        }
        else if (chartSpecification.display.type == 'doughnut' || chartSpecification.display.type == 'pie') {  //pie||doughnut: one dimension and one measure
          sortHierarchy(chartHierarchy, chartSpecification);  //sort by first measure asc
          let labels = [];  //convert hierarchy to chart.js structure
          let datasets = [];
          for (let labelIndex = 0; labelIndex < chartHierarchy.length; labelIndex++) {
            let chartLabel = chartHierarchy[labelIndex];
            labels[labelIndex] = chartLabel.value;
            if (chartLabel.children.length == 0) {  //one dimension, one measure
              let datasetIndex = 0;
              if (datasets[datasetIndex] == null) datasets[datasetIndex] = {  //only init the first time round, specific per chart type
                label: chartHierarchy[datasetIndex].measures[0].label,  //only one dimension, so use measure label
                backgroundColor: getIndexedColorArray('88'),
                borderColor : getIndexedColorArray('FF'),
                borderWidth : 1,
                hoverBackgroundColor: getIndexedColorArray('CC'),
                hoverBordercolor : getIndexedColorArray('FF'),
                hoverBorderWidth : 1,
                data: []
              }
              datasets[datasetIndex].data[labelIndex] = chartLabel.measures[0].value;  //use only the first measure of first dimension
            }
            else {  //two dimensions, one measure
              for (let datasetIndex = 0; datasetIndex < chartLabel.children.length; datasetIndex++) {
                if (datasets[datasetIndex] == null) datasets[datasetIndex] = {  //only init the first time round, specific per chart type
                  label: chartLabel.children[datasetIndex].value,  //when more than one dimension, use second dimension value
                  backgroundColor: getIndexedColorArray('88'),
                  borderColor : getIndexedColorArray('FF'),
                  borderWidth : 1,
                  hoverBackgroundColor: getIndexedColorArray('CC'),
                  hoverBordercolor : getIndexedColorArray('FF'),
                  hoverBorderWidth : 1,
                  data: []
                }
                datasets[datasetIndex].data[labelIndex] = chartLabel.children[datasetIndex].measures[0].value;  //use only the first measure of second dimension
              }
            }
          }
          let chartCanvas = document.createElement('canvas');  //recreate the canvas each time
          chartCanvas.width = chartSpecification.display.width;  //setup canvas aspect ratio
          chartCanvas.height = chartSpecification.display.height;  //setup canvas aspect ratio
          lbiChart.innerHTML = '';  //remove old chart.js canvas
          lbiChart.appendChild(chartCanvas);
          new Chart(chartCanvas, {
            type: chartSpecification.display.type,
            data: {
              labels: labels,
              datasets: datasets
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              title: {
                display: true,
                text: chartTitle
              }
            }
          });
        }
        else if (chartSpecification.display.type == 'kpi') {  //kpi: one dimension with one value, and one measure
          let htmlTable = document.createElement('table');
          htmlTable.className = 'filterKpiTable';
          lbiChart.innerHTML = '';  //remove old table
          lbiChart.appendChild(htmlTable);
          let headerRow = document.createElement('tr');  //header row for labels
          htmlTable.appendChild(headerRow);
          let headerCell = document.createElement('th');
          headerCell.className = 'filterKpiHeading';
          headerCell.textContent = chartSpecification.measures[0].label;//chartHierarchy[0].measures[0].label;  //first level hierarchy's first value, and first measure label
          headerRow.appendChild(headerCell);
          let totalRow = document.createElement('tr');  //totals row
          htmlTable.appendChild(totalRow);
          let measureCell = document.createElement('td');
          measureCell.textContent = filterMeasures[chartSpecification.measures[0].format](chartHierarchy[0].measures[0].value);
          //measureCell.textContent = chartHierarchy[0].measures[0].value.toLocaleString();  //first level hierarchy's first value, and first measure value
          measureCell.className = 'filterKpiMeasure';
          totalRow.appendChild(measureCell);
        }
        else if (chartSpecification.display.type == 'pivot') {  //pivot: multiple dimensions and measures
          sortHierarchy(chartHierarchy, chartSpecification);  //sort by first dim asc
          lbiChart.innerHTML = '';  //remove old table
          let htmlDiv = document.createElement('div');  //for some layout stuff we need the table inside a div
          htmlDiv.className = 'filterPivotDiv';
          lbiChart.appendChild(htmlDiv);
          let htmlTable = document.createElement('table');
          htmlTable.className = 'filterPivotTable';
          htmlDiv.appendChild(htmlTable);
          let headerRow = document.createElement('tr');  //header row for labels
          htmlTable.appendChild(headerRow);
          for (let dimensionIndex = 0; dimensionIndex < chartSpecification.dimensions.length; dimensionIndex++) {  //dimension labels
            let headerCell = document.createElement('th');
            headerCell.className = 'filterPivotHeading';
            headerCell.textContent = chartSpecification.dimensions[dimensionIndex].label;
            headerRow.appendChild(headerCell);
          }
          
          for (let measureIndex = 0; measureIndex < chartSpecification.measures.length; measureIndex++) {  //measure labels
            let headerCell = document.createElement('th');
            headerCell.className = 'filterPivotHeading';
            headerCell.textContent = chartSpecification.measures[measureIndex].label;
            headerRow.appendChild(headerCell);
          }

          function recurseTable(hierarchy, htmlTable) {  //build pivot table recursively
            let nodeSpan = {
              rows: 0,  //accumulate the total number of rows in this node, including totals
              cols: 0  //keep track of columns to span for totals
            }
            for (let nodeIndex = 0; nodeIndex < hierarchy.length; nodeIndex++) {
              let hierarchyNode = hierarchy[nodeIndex];
              let totalRow = document.createElement('tr');  //totals row
              htmlTable.appendChild(totalRow);
              let dimensionCell = document.createElement('td');  //dimension cell
              dimensionCell.textContent = hierarchyNode.value.toLocaleString();
              dimensionCell.className = 'filterPivotDimension';
              totalRow.appendChild(dimensionCell);
              let totalCell = document.createElement('td');  //totals cell
              totalCell.textContent = 'Total';
              totalCell.className = 'filterPivotTotal';
              if (hierarchyNode.children.length > 0) totalRow.appendChild(totalCell);  //no totals on final dimension
              for (let measureIndex = 0; measureIndex < hierarchyNode.measures.length; measureIndex++) {  //one cell per measure
                let measure = hierarchyNode.measures[measureIndex];
                let measureCell = document.createElement('td');
                measureCell.textContent = filterMeasures[chartSpecification.measures[measureIndex].format](measure.value);  //measure.value.toLocaleString();
                
                if (hierarchyNode.children.length > 0) measureCell.className = 'filterPivotTotal';
                else measureCell.className = 'filterPivotMeasure';
                totalRow.appendChild(measureCell);
              }
              if (hierarchyNode.children.length > 0) {  //drill down into hierarchy if there are children
                let childSpan = recurseTable(hierarchyNode.children, htmlTable);
                nodeSpan.rows += childSpan.rows;  //keep track of rows to span, including total
                nodeSpan.cols = childSpan.cols + 1;  //keep track of cols to span, for totals
                dimensionCell.rowSpan = childSpan.rows;
                totalCell.colSpan = childSpan.cols;
              }
              else {
                nodeSpan.rows = hierarchy.length;
                nodeSpan.cols = 1;
              }
            }
            return { 
              rows: nodeSpan.rows + 1, 
              cols: nodeSpan.cols };
          }

          recurseTable(chartHierarchy, htmlTable);
        }
      }
    },
    /**
     * @description Refreshes all document elements, based on filter values
     */
    refresh() {
      let filterDefinitions = [];
      for (let fieldIndex = 0; fieldIndex < this.chartFields.length; fieldIndex++) {  //get filter definition from selects
        let fieldName = this.chartFields[fieldIndex].field;
        filterDefinitions = filterDefinitions.concat(this.getSelect(fieldName));
      }
      this.chartTable.filter(filterDefinitions);  //implement the filter definition

      let filterList = '';  //display the filter list
      if (this.flexDimension != null) filterList += String.fromCharCode(10070) + this.flexDimension.label + '\n\n';  //show flexDimension field
      for (let filterIndex = 0; filterIndex < filterDefinitions.length; filterIndex++) {  //list filtered items
        let filterDefinition = filterDefinitions[filterIndex];
        if (filterDefinition.filterValue != '*') filterList += filterDefinition.fieldName + String.fromCharCode(9670) + filterDefinition.filterValue + '\n';
      }

      let listButton = document.getElementById('filterList');  //NB - hardcoded reference qualifier
      if (filterList == '') listButton.innerText = String.fromCharCode(9671);
      else listButton.innerText = filterList;

      let measureSelect = document.getElementById('measureFlex');  //NB - hardcoded reference qualifier
      if (this.flexMeasure == null) measureSelect.selectedIndex = 0;

      for (let fieldIndex = 0; fieldIndex < this.chartFields.length; fieldIndex++) {  //update all selects
        let fieldName = this.chartFields[fieldIndex].field;
        let flexDimensionButton = document.getElementById(fieldName + '.flexDimension');  //NB - hardcoded reference qualifier
        if (this.flexDimension != null && fieldName == this.flexDimension.field) {
          flexDimensionButton.style.backgroundColor = '#444444';
          flexDimensionButton.style.color = '#ffffff';
        }
        else {
          flexDimensionButton.style.backgroundColor = null;
          flexDimensionButton.style.color = null;
        }
        this.updateSelect(fieldName);
        this.sortSelect(fieldName,0);
      }
      this.buildCharts();
    }
  }
  {  //initialise the filterChart
    filterChart.chartTable = filterTable( { tableName : 'Invoices', tableData : simpleData(), tableFunctions : filterMeasures });
    filterChart.chartFields = JSON.parse(document.getElementById("localFields").dataset.lbiFields);
    filterChart.chartMeasures = JSON.parse(document.getElementById("localFields").dataset.lbiMeasures);
    let localFields = filterChart.buildFields('localFields');
    let localHeader = filterChart.buildHeader('localHeader');
    let localFooter = filterChart.buildFooter('localFooter');
    let localLoader = document.getElementById("localLoader");
    localLoader.style.display = 'none';  //hide loader
    localFields.style.display = 'inline-block';  //show fields
    localHeader.style.display = 'inline-block';  //show header
    localFooter.style.display = 'inline-block';  //show footer
    filterChart.refresh();
  }
  return filterChart;
}
