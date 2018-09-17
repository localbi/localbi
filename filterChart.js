
/** 
 * Namespace for localBi classes and functions.
 * @namespace
 */
var localBi = localBi || {};

/** 
 * Constructs the page.
 * @constructor
 * @param {filterMeasures} filterMeasures - Not sure if this is still needed.
 * @returns {filterChart} A filterChart object that can be cuddled and fondled.
 */
localBi.filterChart = function(filterMeasures) {
  var filterIcon = {
    active: String.fromCharCode(9672),
    inactive: String.fromCharCode(9671),
    flex: String.fromCharCode(10070),
    invert: String.fromCharCode(11030),
    ascending: String.fromCharCode(9650),
    descending: String.fromCharCode(9660)
  }

  var filterChart = {  //define filterChart
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
      var filterFields = document.getElementById(elementId);  //container for all fields
      var listButton = document.createElement('button');  //button to list and clear all filters
      listButton.className = 'filterList';
      listButton.onclick = function() {  //  clear all fields and flexDimension field
        for (var fieldIndex = 0; fieldIndex < filterChart.chartFields.length; fieldIndex++) {
          var fieldName = filterChart.chartFields[fieldIndex].field;
          filterChart.adjustSelect(fieldName,0);
        }
        filterChart.flexDimension = null;
        filterChart.flexMeasure = null;
        filterChart.refresh();
      };
      listButton.innerText = filterIcon.inactive;
      listButton.id = 'filterList';  //NB - this id is used by other code!
      filterFields.appendChild(listButton);

      var measureSelect = document.createElement('select');  //measure list
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
      var defaultOption = document.createElement('option');  //default option
      defaultOption.text = filterIcon.inactive;  //label
      defaultOption.value = null;  //calculation function
      measureSelect.add(defaultOption);
      for (var measureIndex = 0; measureIndex < this.chartMeasures.length; measureIndex++) {  //build field navigation for all fields
        var measureItem = this.chartMeasures[measureIndex];
        var option = document.createElement('option');
        option.text = measureItem.label;  //label
        option.value = JSON.stringify(measureItem);  //calculation function
        measureSelect.add(option);
      }

      for (var fieldIndex = 0; fieldIndex < this.chartFields.length; fieldIndex++) {  //build field navigation for all fields
        var fieldName = this.chartFields[fieldIndex].field;

        var fieldDiv = document.createElement('div');  //container for all field collateral
        fieldDiv.className = 'filterField';
        filterFields.appendChild(fieldDiv);

        var titleButton = document.createElement('button');  //title button, click to sort
        titleButton.className = 'filterTitle';
        titleButton.onclick = function() {  //sort and toggle through asc/desc
          filterChart.sortSelect(fieldName, -1);
        };
        titleButton.textContent = 'x' + this.chartFields[fieldIndex].label;  //initial sort order is unassigned
        titleButton.id = fieldName + '.sort';  //NB - this id is used by other code!
        fieldDiv.appendChild(titleButton);

        var fieldSelect = document.createElement('select');  //select list, click to refresh
        fieldSelect.className = 'filterSelect';
        fieldSelect.onchange = function() {  //refresh the page
          filterChart.refresh();
        };
        fieldSelect.id = fieldName + '.select';  //NB - this id is used by other code!
        fieldSelect.multiple = true;
        fieldDiv.appendChild(fieldSelect);
        this.buildSelect(fieldName);

        var buttonsDiv = document.createElement('div');  //container for all field collateral
        buttonsDiv.className = 'filterButtons';
        fieldDiv.appendChild(buttonsDiv);
        
        var flexDimensionButton = document.createElement('button');  //button to set which field is used to flexDimension the charts
        flexDimensionButton.className = 'filterAdjust';
        flexDimensionButton.onclick = function() {  //-1 = set all options to inverted
          if (filterChart.flexDimension != null && fieldName == filterChart.flexDimension.field) filterChart.flexDimension = null;  //if set to this field, unset
          else filterChart.flexDimension = {  //
            field: fieldName, 
            label: fieldName 
          };  //otherwise set
          filterChart.refresh();
        };
        flexDimensionButton.textContent = filterIcon.flex;
        flexDimensionButton.id = fieldName + '.flexDimension';  //NB - this id is used by other code!
        buttonsDiv.appendChild(flexDimensionButton);

        var invertButton = document.createElement('button');  //button to invert field filter
        invertButton.className = 'filterAdjust';
        invertButton.onclick = function() {  //-1 = set all options to inverted
          filterChart.adjustSelect(fieldName,-1);
          filterChart.refresh();
        };
        invertButton.textContent = filterIcon.invert;  //9931
        invertButton.id = fieldName + '.invert';  //NB - this id is used by other code!
        buttonsDiv.appendChild(invertButton);
        
        var clearButton = document.createElement('button');  //button to clear field filters
        clearButton.className = 'filterAdjust';
        clearButton.onclick = function() {  //0 = set all options to false
          filterChart.adjustSelect(fieldName,0);
          filterChart.refresh();
        };
        clearButton.textContent = filterIcon.inactive;
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
      var filterHeader = document.getElementById(elementId);  //container for footer
      filterHeader.onclick = function() {  //help text
      };
      var span1 = document.createElement('span');  //heading
      span1.textContent = document.title;  //'Sales Report';
      filterHeader.appendChild(span1);
      return filterHeader;
    },
    /**
     * @description Builds markup for footer. Clicking footer brings up help.
     * @param {string} elementId The elementId for the footer.
     */
    buildFooter(elementId) {
      var filterFooter = document.getElementById(elementId);  //container for footer
      var anchor = document.createElement('a');  //local
      anchor.href = "https://github.com/localbi/localbi";
      anchor.target = "_blank";
      filterFooter.appendChild(anchor);
      var span1 = document.createElement('span');  //local
      span1.textContent = 'local';
      span1.style.color = '#0000ff';
      anchor.appendChild(span1);
      var span2 = document.createElement('span');  //BI
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
      var filterField = this.chartTable.findField(elementId);  //get field from name
      var select = document.getElementById(elementId + '.select');  //NB - hardcoded reference qualifier
      for (var valueIndex = 1; valueIndex < filterField.fieldValues.length; valueIndex++) {  //skip 0th element, which is the header
        var fieldValue = filterField.fieldValues[valueIndex];
        var fieldIcon = 'x'; //unassigned
        var option = document.createElement('option');
        option.text = fieldIcon + fieldValue.valueName; //prepend icon to option text
        option.value = fieldValue.valueIndex;  //references to the fieldValues can be done by this index
        select.add(option);
      }
    },
    /**
     * @description Refreshes select options from filterField values
     * @param {string} elementId The elementId of the select element
     */
    updateSelect(elementId) {
      var filterField = this.chartTable.findField(elementId);  //get field from name
      var select = document.getElementById(elementId + '.select');  //NB - hardcoded reference qualifier
      var options = select.options;
      for (var optionIndex = 0; optionIndex < options.length; optionIndex++) {
        var option = options[optionIndex];
        var fieldValue = filterField.fieldValues[option.value];  //this gets the value by its index
        var fieldIcon = 'x'; //unassigned
        if (fieldValue.valueActiveRows > 0 && fieldValue.valueDormantRows > 0) fieldIcon = filterIcon.active;  //we're simplifying this display to only be active/dormant, as most people have trouble interpreting the 'both' state
        else if (fieldValue.valueActiveRows == 0 && fieldValue.valueDormantRows > 0) fieldIcon = filterIcon.inactive; //dormant = empty//9898//11096//9675
        else if (fieldValue.valueActiveRows > 0 && fieldValue.valueDormantRows == 0) fieldIcon = filterIcon.active; //active = full//9899//11044//9679
        option.text = fieldIcon + fieldValue.valueName; //prepend icon to option text
        }
    },
    /**
     * @description Get select options into a filter definition
     * @param {string} elementId The elementId of the select element
     * @returns {filterDefinition}
     */
    getSelect(elementId) {
      var filterDefinition = [];
      var select = document.getElementById(elementId + '.select');  //NB - hardcoded reference qualifier
      var selectedValues = [];
      var options = select.options;
      for (var optionIndex = 0; optionIndex < options.length; optionIndex++) {
        var option = options[optionIndex];
        if (option.selected) selectedValues.push(option.text.substr(1));  //save only the selected options's value (minus icon) - can we use index here?? yes but only if we update the filterTable code which currently does not suppor this
      }
      if (selectedValues.length == 0) {  //nothing selected means everything is selected :)
        var clearButton = document.getElementById(elementId + '.clear');  //NB - hardcoded reference qualifier
        //clearButton.textContent = filterIcon.inactive;  //indicate nothing is selected
        clearButton.style.backgroundColor = null;
        clearButton.style.color = null;
        filterDefinition.push(   { field: elementId, value : '*', isActive : true	});
      }
      else {  //something is selected
        var clearButton = document.getElementById(elementId + '.clear');  //NB - hardcoded reference qualifier
        //clearButton.textContent = filterIcon.active;  //indicate something is selected
        clearButton.style.backgroundColor = '#444444';
        clearButton.style.color = '#ffffff';
        filterDefinition.push(   { field: elementId, value : '*', isActive : false	});
        for (var selectedIndex = 0; selectedIndex < selectedValues.length; selectedIndex++) {  
          filterDefinition.push( { field: elementId, value : selectedValues[selectedIndex], isActive : true })
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
      var select = document.getElementById(elementId + '.select');  //NB - hardcoded reference qualifier
      var options = select.options;
      for (var optionIndex = 0; optionIndex < options.length; optionIndex++) {
        var option = options[optionIndex];
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
			var fieldIsFound = false;  //to check if field exists
			var fieldIndex = 0;  //position of found field
			while (fieldIsFound == false && fieldIndex < this.chartFields.length) {  //search until we can confirm it doesn't exist in the list - use while so we can exit early
				if(elementId == this.chartFields[fieldIndex].field) fieldIsFound = true;
				else fieldIndex++;
      }
      var fieldSort = this.chartFields[fieldIndex].sort;  //find sort type from field name
      var select = document.getElementById(elementId + '.select');  //NB - hardcoded reference qualifier
      var title = document.getElementById(elementId + '.sort');  //NB - hardcoded reference qualifier
      var sortIcon = title.textContent.substr(0,1);  //title text is prefixed with sort icon
      var options = select.options;
      var unsortedOptions = [];
      var sortedOptions = [];
      for (var optionIndex = 0; optionIndex < options.length; optionIndex++) {  //get unsorted options
        unsortedOptions.push(options[optionIndex]);
      }
      if (action == 1 || sortIcon == 'x') sortIcon = filterIcon.ascending;  //we check the unassiged char here, so we can keep all the unicode stuff in one place - default to asc first time
      else if (action == -1) {  //update icon to inverse
        if (sortIcon == filterIcon.ascending) sortIcon = filterIcon.descending;
        else sortIcon = filterIcon.ascending;
      }
      title.textContent = sortIcon + title.textContent.substr(1);  //update title
      if (sortIcon == filterIcon.ascending) {  //sort options ascending
        sortedOptions = unsortedOptions.sort(function (a, b) {
          var aIcon = a.text.substr(0,1);
          var bIcon = b.text.substr(0,1);
          var aValue = a.text.substr(1);
          var bValue = b.text.substr(1);
          var iconCompare = bIcon.localeCompare(aIcon);
          var valueCompare = false;
          if (fieldSort == 'text' || fieldSort == 'number') valueCompare = aValue.localeCompare(bValue);  //by default do text and number the same
          else if (fieldSort.length > 0) valueCompare = fieldSort.indexOf(aValue) - fieldSort.indexOf(bValue);  //else use defined sort order
          return iconCompare || valueCompare;  //icon sort remains the same
        });
      }
      else {  //sort options descending
        sortedOptions = unsortedOptions.sort(function (a, b) {
          var aIcon = a.text.substr(0,1);
          var bIcon = b.text.substr(0,1);
          var aValue = a.text.substr(1);
          var bValue = b.text.substr(1);
          var iconCompare = bIcon.localeCompare(aIcon);
          var valueCompare = false;
          if (fieldSort == 'text' || fieldSort == 'number') valueCompare = bValue.localeCompare(aValue);  //by default do text and number the same
          else if (fieldSort.length > 0) valueCompare = fieldSort.indexOf(bValue) - fieldSort.indexOf(aValue);  //else use defined sort order
          return iconCompare || valueCompare;  //icon sort remains the same
        });
      }
      for (var optionIndex = 0; optionIndex < sortedOptions.length; optionIndex++) {  //rearrange options
        options[optionIndex] = sortedOptions[optionIndex];
      }
    },

    /**
     * @description Creates all chart types
     */
    buildCharts() {  //looks like we cater for max 2 dims and 2 meas, some charts will have more or less

      function getIndexedColorArray(alpha) {  //returns all chart colours, with an alpha
        var kellyColors = ['#FFB300','#803E75','#FF6800','#A6BDD7','#C10020','#CEA262','#817066','#007D34','#F6768E','#00538A','#FF7A5C','#53377A','#FF8E00','#B32851','#F4C800','#7F180D','#93AA00','#593315','#F13A13','#232C16'];  //Kelly's colors of maximum contrast
        for (var colorIndex = 0; colorIndex < kellyColors.length; colorIndex++) {
          kellyColors[colorIndex] = kellyColors[colorIndex] + alpha;  //add alpha value (hex expected)
        }
        return kellyColors;
      };

      function getIndexedColor(colorIndex, alpha) {  //looks up chart colour from an index
        var kellyColors = getIndexedColorArray(alpha);  //apply alpha
        var remainder = colorIndex%(kellyColors.length);  //if we exceed the length, start again
        return kellyColors[remainder];  //add alpha value (hex expected)
      };

      //sort by either first dimension or first measure
      function sortHierarchy(chartHierarchy, chartSpecification) {  //we can only do this once the hierarchy is fully built
        if (chartSpecification.display.sort == 'dimension') {  //sort by first dimension ascending (currently no provision is made for sorting this descending because it's uncommon and I'm feeling lazy)
          var fieldIsFound = false;  //to check if field exists
          var fieldIndex = 0;  //position of found field
          while (fieldIsFound == false && fieldIndex < filterChart.chartFields.length) {  //search until we can confirm it doesn't exist in the list - use while so we can exit early
            if(chartSpecification.dimensions[0].field == filterChart.chartFields[fieldIndex].field) fieldIsFound = true;
            else fieldIndex++;
          }
          var fieldSort = filterChart.chartFields[fieldIndex].sort;  //find sort type from field name
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

      var lbiCharts = document.getElementsByName('lbiChart');  //all charts should have the name lbiChart
      for (var chartIndex = 0; chartIndex < lbiCharts.length; chartIndex++) {  //we should get a collection of all the charts defined in the html tags
        var lbiChart = lbiCharts[chartIndex];
        var chartSpecification = JSON.parse(lbiChart.dataset.lbiChart);  //expect valid JSON in the tag's data-lbi-chart attribute

        // var chartSpecification.dimensions = [];  //build dimensions specification
        // for (var dimensionIndex = 0; dimensionIndex < chartSpecification.dimensions.length; dimensionIndex++) {
        //   var dimensionSpecification = chartSpecification.dimensions[dimensionIndex];
        //   chartSpecification.dimensions[dimensionIndex] = {  //@typedef {Object} dimensionSpecification - specify a dimension by name.
        //     fieldName: dimensionSpecification.field,  //field name of dimension (required).
        //     label: dimensionSpecification.label  //label of dimension (required).
        //   };
        // }

        if (this.flexDimension != null) {  //wait for a valid flexDimension field
          var dimensionIsFound = false;  //only add/replace flexDimension if not already part of the spec
          var dimensionIndex = 0;
          while (dimensionIsFound == false && dimensionIndex < chartSpecification.dimensions.length) {  //exit as soon as we find the flexDimension
            if (chartSpecification.dimensions[dimensionIndex].field == this.flexDimension.field) dimensionIsFound = true;
						else dimensionIndex++;
          }
          if (dimensionIsFound == false) {
            if (chartSpecification.display.flexDimension == 'add') chartSpecification.dimensions.push(this.flexDimension);  //add flexDimension field to end
            else if (chartSpecification.display.flexDimension == 'replace') chartSpecification.dimensions[(chartSpecification.dimensions.length)-1] = this.flexDimension;  //replace last field with flexDimension field 
          }
        }

        // var chartSpecification.measures = [];  //build measures specification
        // for (var measureIndex = 0; measureIndex < chartSpecification.measures.length; measureIndex++) {
        //   var measureSpecification = chartSpecification.measures[measureIndex];
        //   chartSpecification.measures[measureIndex] = {  //@typedef {Object} measureSpecification - specify a measure by name.
        //     //fieldName: measureSpecification.field,  //fieldName - field name of measure (required).
        //     label: measureSpecification.label,  //label - label of aggregated measure (required).
        //     calculation: measureSpecification.calculation  //calculation - calculation function (required).
        //   };
        // }

        if (this.flexMeasure != null) {  //wait for a valid flexMeasure field
          var measureIsFound = false;  //only add/replace flexmeasure if not already part of the spec
          var measureIndex = 0;
          while (measureIsFound == false && measureIndex < chartSpecification.measures.length) {  //exit as soon as we find the flexmeasure
            if (chartSpecification.measures[measureIndex].calculation == this.flexMeasure.calculation) measureIsFound = true;
						else measureIndex++;
          }
          if (measureIsFound == false) {
            if (chartSpecification.display.flexMeasure == 'add') chartSpecification.measures.push(this.flexMeasure);  //add flexMeasure field to end
            else if (chartSpecification.display.flexMeasure == 'replace') chartSpecification.measures[(chartSpecification.measures.length)-1] = this.flexMeasure;  //replace last field with flexMeasure field 
          }
        }
        
        var chartHierarchy = this.chartTable.aggregate({  //@typedef {Object} aggregateSpecification
          dimensions: chartSpecification.dimensions,  //array of chartSpecification.dimensions (required).
          measures: chartSpecification.measures  //array of chartSpecification.measures (required).
        });

        if (chartHierarchy.length == 0) {
          var warningDiv = document.createElement('div');
          warningDiv.textContent = 'No data - please clear some filters';
          lbiChart.innerHTML = '';  //remove old chart.js canvas
          lbiChart.appendChild(warningDiv);
        }
        else {
          var chartTitle = chartSpecification.measures[0].label;  //automatically use "Measure by Dim1, Dim2" as title
          var dimensionTitle = '';
          if (chartSpecification.dimensions.length > 0) {
            for (var dimensionIndex = 0; dimensionIndex < chartSpecification.dimensions.length; dimensionIndex++) {
              if (dimensionTitle.length > 0) dimensionTitle += ', ';  //add comma separator
              dimensionTitle += chartSpecification.dimensions[dimensionIndex].field;
            }
            chartTitle += ' by ' + dimensionTitle;
          }

          if (chartSpecification.display.type == 'bar') {
            sortHierarchy(chartHierarchy, chartSpecification);  //sort by first measure asc
            var labels = [];  //convert hierarchy to chart.js structure
            var datasets = [];
            for (var labelIndex = 0; labelIndex < chartHierarchy.length; labelIndex++) {
              var chartLabel = chartHierarchy[labelIndex];
              labels[labelIndex] = chartLabel.value;
              if (chartLabel.children.length == 0) {  //one dimension, one measure
                var datasetIndex = 0;
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
                for (var datasetIndex = 0; datasetIndex < chartLabel.children.length; datasetIndex++) {
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
            var chartCanvas = document.createElement('canvas');  //recreate the canvas each time
            chartCanvas.width = chartSpecification.display.width;  //setup canvas aspect ratio
            chartCanvas.height = chartSpecification.display.height;  //setup canvas aspect ratio
            lbiChart.innerHTML = '';  //remove old chart.js canvas
            lbiChart.appendChild(chartCanvas);
            var newChart = new Chart(chartCanvas, {
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
            var labels = [];  //convert hierarchy to chart.js structure
            var datasets = [];
            for (var labelIndex = 0; labelIndex < chartHierarchy.length; labelIndex++) {
              var chartLabel = chartHierarchy[labelIndex];
              labels[labelIndex] = chartLabel.value;
              if (chartLabel.children.length == 0) {  //one dimension, one measure
                var datasetIndex = 0;
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
                for (var datasetIndex = 0; datasetIndex < chartLabel.children.length; datasetIndex++) {
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
            var chartCanvas = document.createElement('canvas');  //recreate the canvas each time
            chartCanvas.width = chartSpecification.display.width;  //setup canvas aspect ratio
            chartCanvas.height = chartSpecification.display.height;  //setup canvas aspect ratio
            lbiChart.innerHTML = '';  //remove old chart.js canvas
            lbiChart.appendChild(chartCanvas);
            var newChart = new Chart(chartCanvas, {
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
            var labels = [];  //convert hierarchy to chart.js structure
            var datasets = [];
            for (var labelIndex = 0; labelIndex < chartHierarchy.length; labelIndex++) {
              var chartLabel = chartHierarchy[labelIndex];
              labels[labelIndex] = chartLabel.value;
              if (chartLabel.children.length == 0) {  //one dimension, one measure
                var datasetIndex = 0;
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
                for (var datasetIndex = 0; datasetIndex < chartLabel.children.length; datasetIndex++) {
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
            var chartCanvas = document.createElement('canvas');  //recreate the canvas each time
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
            var htmlTable = document.createElement('table');
            htmlTable.className = 'filterKpiTable';
            lbiChart.innerHTML = '';  //remove old table
            lbiChart.appendChild(htmlTable);
            var headerRow = document.createElement('tr');  //header row for labels
            htmlTable.appendChild(headerRow);
            var headerCell = document.createElement('th');
            headerCell.className = 'filterKpiHeading';
            headerCell.textContent = chartSpecification.measures[0].label;//chartHierarchy[0].measures[0].label;  //first level hierarchy's first value, and first measure label
            headerRow.appendChild(headerCell);
            var totalRow = document.createElement('tr');  //totals row
            htmlTable.appendChild(totalRow);
            var measureCell = document.createElement('td');
            measureCell.textContent = filterMeasures[chartSpecification.measures[0].format](chartHierarchy[0].measures[0].value);
            //measureCell.textContent = chartHierarchy[0].measures[0].value.toLocaleString();  //first level hierarchy's first value, and first measure value
            measureCell.className = 'filterKpiMeasure';
            totalRow.appendChild(measureCell);
          }
          else if (chartSpecification.display.type == 'pivot') {  //pivot: multiple dimensions and measures
            sortHierarchy(chartHierarchy, chartSpecification);  //sort by first dim asc
            lbiChart.innerHTML = '';  //remove old table
            var htmlDiv = document.createElement('div');  //for some layout stuff we need the table inside a div
            htmlDiv.className = 'filterPivotDiv';
            lbiChart.appendChild(htmlDiv);
            var htmlTable = document.createElement('table');
            htmlTable.className = 'filterPivotTable';
            htmlDiv.appendChild(htmlTable);
            var headerRow = document.createElement('tr');  //header row for labels
            htmlTable.appendChild(headerRow);
            for (var dimensionIndex = 0; dimensionIndex < chartSpecification.dimensions.length; dimensionIndex++) {  //dimension labels
              var headerCell = document.createElement('th');
              headerCell.className = 'filterPivotHeading';
              headerCell.textContent = chartSpecification.dimensions[dimensionIndex].label;
              headerRow.appendChild(headerCell);
            }
            
            for (var measureIndex = 0; measureIndex < chartSpecification.measures.length; measureIndex++) {  //measure labels
              var headerCell = document.createElement('th');
              headerCell.className = 'filterPivotHeading';
              headerCell.textContent = chartSpecification.measures[measureIndex].label;
              headerRow.appendChild(headerCell);
            }

            function recurseTable(hierarchy, htmlTable) {  //build pivot table recursively
              var nodeSpan = {
                rows: 0,  //accumulate the total number of rows in this node, including totals
                cols: 0  //keep track of columns to span for totals
              }
              for (var nodeIndex = 0; nodeIndex < hierarchy.length; nodeIndex++) {
                var hierarchyNode = hierarchy[nodeIndex];
                var totalRow = document.createElement('tr');  //totals row
                htmlTable.appendChild(totalRow);
                var dimensionCell = document.createElement('td');  //dimension cell
                dimensionCell.textContent = hierarchyNode.value.toLocaleString();
                dimensionCell.className = 'filterPivotDimension';
                totalRow.appendChild(dimensionCell);
                var totalCell = document.createElement('td');  //totals cell
                totalCell.textContent = 'Total';
                totalCell.className = 'filterPivotTotal';
                if (hierarchyNode.children.length > 0) totalRow.appendChild(totalCell);  //no totals on final dimension
                for (var measureIndex = 0; measureIndex < hierarchyNode.measures.length; measureIndex++) {  //one cell per measure
                  var measure = hierarchyNode.measures[measureIndex];
                  var measureCell = document.createElement('td');
                  measureCell.textContent = filterMeasures[chartSpecification.measures[measureIndex].format](measure.value);  //measure.value.toLocaleString();
                  
                  if (hierarchyNode.children.length > 0) measureCell.className = 'filterPivotTotal';
                  else measureCell.className = 'filterPivotMeasure';
                  totalRow.appendChild(measureCell);
                }
                if (hierarchyNode.children.length > 0) {  //drill down into hierarchy if there are children
                  var childSpan = recurseTable(hierarchyNode.children, htmlTable);
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
      }
    },
    /**
     * @description Refreshes all document elements, based on filter values
     */
    refresh() {
      var filterDefinitions = [];
      for (var fieldIndex = 0; fieldIndex < this.chartFields.length; fieldIndex++) {  //get filter definition from selects
        var fieldName = this.chartFields[fieldIndex].field;
        filterDefinitions = filterDefinitions.concat(this.getSelect(fieldName));
      }
      this.chartTable.filter(filterDefinitions);  //implement the filter definition

      var filterList = '';  //display the filter list
      if (this.flexDimension != null) filterList += filterIcon.flex + this.flexDimension.label + '\n\n';  //show flexDimension field
      for (var filterIndex = 0; filterIndex < filterDefinitions.length; filterIndex++) {  //list filtered items
        var filterDefinition = filterDefinitions[filterIndex];
        if (filterDefinition.value != '*') filterList += filterDefinition.field + filterIcon.active + filterDefinition.value + '\n';
      }

      var listButton = document.getElementById('filterList');  //NB - hardcoded reference qualifier
      if (filterList == '') listButton.innerText = filterIcon.inactive;
      else listButton.innerText = filterList;

      var measureSelect = document.getElementById('measureFlex');  //NB - hardcoded reference qualifier
      if (this.flexMeasure == null) measureSelect.selectedIndex = 0;

      for (var fieldIndex = 0; fieldIndex < this.chartFields.length; fieldIndex++) {  //update all selects
        var fieldName = this.chartFields[fieldIndex].field;
        var flexDimensionButton = document.getElementById(fieldName + '.flexDimension');  //NB - hardcoded reference qualifier
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
    filterChart.chartTable = localBi.filterTable( { tableName : 'Invoices', tableFields : fields, tableRecords : records, tableFunctions : localMeasures });  //relies on filterData.js to be loaded first
    filterChart.chartFields = JSON.parse(document.getElementById("localFields").dataset.lbiFields);
    filterChart.chartMeasures = JSON.parse(document.getElementById("localFields").dataset.lbiMeasures);
    var localFields = filterChart.buildFields('localFields');
    var localHeader = filterChart.buildHeader('localHeader');
    var localFooter = filterChart.buildFooter('localFooter');
    var localLoader = document.getElementById("localLoader");
    localLoader.style.display = 'none';  //hide loader
    localFields.style.display = 'inline-block';  //show fields
    localHeader.style.display = 'inline-block';  //show header
    localFooter.style.display = 'inline-block';  //show footer
    filterChart.refresh();
  }
  return filterChart;
}
