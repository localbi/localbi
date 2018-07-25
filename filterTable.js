		/** filterTable(tableName)
		 * => tableName (string): 'my table name' (case sensitive)
		 * <= filterTable (obj)
		 ** Finds an existing filterTable by tableName. 
		 ** If not found it will create a new filterTable and add it to this.filterTables before returning the new filterTable.
		 */
		/**
		 * @typedef {Object} filterRecord
		 * @property {string} name - Array of active filterRecords included in a filterGroup
		 */
/** filterTable(tableDefinition)
 * => tableDefinition (obj) : {
 *		modelName : 'model name',
 *		filterTables : [ 
 *			{ tableName : 'table name 1', tableData : [][] },	
 *			{ tableName : 'table name 2', tableData : [][] }
 *		]	
 *	}
 * <= filterTable (obj)
 ** Build the filterTable's filterTables and filterFields from denormalised tableData [][]
 ** Each field is scanned and only unique values stored in each filterField
 ** Each row is scanned and only a reference to the field value is stored in each filterTable
 */
function filterTable(tableDefinition) {
	"use strict";
	let filterTable = {  //define filterTable
		tableName : tableDefinition.tableName,
		filterFields : [],  //store unique field values
		filterRecords : [],

		/**
		 * @typedef {Object} filterField
		 * @property {string} name - Array of filterFields making up a unique filterGroup
		 */
		
		/** filterField(fieldName)
		 * => fieldName (string): 'my field name' (case sensitive)
		 * <= filterField (obj)
		 ** Finds an existing filterField by fieldName. 
		 ** If not found it will create a new filterField and add it to this.filterFields before returning the new filterField.
		 */
		filterField(fieldName) {  //find filterField if it exists, else create it and add it to filterTable
			let fieldIsFound = false;  //to check if filterField exists
			let fieldIndex = 0;  //position of found filterField
			while (fieldIsFound == false && fieldIndex < this.filterFields.length) {  //search until we can confirm it doesn't exist in the list - use while so we can exit early
				if(fieldName == this.filterFields[fieldIndex].fieldName) fieldIsFound = true;
				else fieldIndex++;
			}
			if (fieldIsFound == false) this.filterFields[fieldIndex] = {  //define filterField because it wasn't found, and fieldIndex will be at the next open slot already to be added
				fieldName : fieldName,  //field name
				fieldIndex : fieldIndex,  //track position in this.filterFields
				filterValues : [],  //unique field values, to be populated during build process

				/** filterValue(valueName)
				 * => valueName (string): 'my value name' (case sensitive)
				 * <= filterValue (obj)
				 ** Finds an existing filterValue by valueName. 
				 ** If not found it will create a new filterValue and add it to this.filterValues before returning the new filterValue.
				 */
				filterValue(valueName) {  //find valueName if it exists, else create it and add it to filterField. I used "valueName" to be consistent with the naming convention. A better name might be valueValue :-)
					let valueIsFound = false;  //to check if filterValue exists
					let valueIndex = 0;  //position of found filterValue
					while (valueIsFound == false && valueIndex < this.filterValues.length) {  //search until we can confirm it doesn't exist in the list - use while so we can exit early
						if (valueName == this.filterValues[valueIndex].valueName) valueIsFound = true;
						else valueIndex++;
					}
					if (valueIsFound == false) this.filterValues[valueIndex] = {  //define filterValue because it wasn't found, and valueIndex will be at the next open slot already to be added
						valueName : valueName,  //unique value value
						valueIndex : valueIndex,  //track position in this.filterValues
						valueActiveRows : 0,
						valueDormantRows : 0,
						//valueIsActive : false,
						valueIsFiltered : true  //actioned by user
						//valueIsActive : true  //due to rowset interaction
					}
					return this.filterValues[valueIndex];  //whether found or created, it should exist at this index at this point
				}
			}
			return this.filterFields[fieldIndex];  //whether found or created, it should exist at this index at this point
		},
		

		
		/** filterTable.filter(filterCollection)
		 * => filterCollection (obj): [ 
		 *		{ fieldName : '*', fieldIndex : null, filterValue : '*', valueIsFiltered : true },
		 *      { fieldName : 'Customers', fieldIndex : null, filterValue : 'CustomerA', valueIsFiltered : false }
		 *		]
		 *	where
		 *		fieldName => actual field name / null / '*' for all
		 *		fieldIndex => actual numeric index / null (if a specific index is specified it takes precedence over fieldName)
		 *		filterValue => actual value / '*' for all
		 *		valueIsFiltered => true / false / ! for invert
		 * <= (nothing)
		 ** Apply filterCollection to filterFields and updates the model
		 ** Filters are applied in the sequence listed
		 ** Because we use a single denormalised table, every field is represented in every row.
		 ** If filterValue.valueIsFiltered = true on all fields in a row makes the row active (rowIsActive = true). This is step 1
		 ** If all the filterValue.valueIsActive = true in an active row, then the row remains active (valueIsActive = true). This is step 2
		 ** Step 1 does the filtering and some of the state updates based on the data.
		 ** Step 2 propagates the resultant row and field active states when there are multiple tables
		 */
		filter(filterCollection) {
			//apply filters
			for (let filterIndex = 0; filterIndex < filterCollection.length; filterIndex++) {  //set all filterValues' filter state as defined by filterCollection
				let filterDef = filterCollection[filterIndex];
				let fieldsToFilter = [];  //place holder for subset of fields to filter
				if (filterDef.fieldIndex == null) {  //if fieldIndex is not defined, fall back on fieldName
					if (filterDef.fieldName == '*') fieldsToFilter = this.filterFields;  //special case for all fiels
					else fieldsToFilter[0] = this.filterField(filterDef.fieldName);  //or single element array with one named field
				}
				else fieldsToFilter[0] = this.filterFields[filterDef.fieldIndex];
				for (let fieldIndex = 0; fieldIndex < fieldsToFilter.length; fieldIndex++) {  //potentially we can set all filterFields' states
					let filterField = fieldsToFilter[fieldIndex];
					let valuesToFilter = [];  //place holder for subset of values to filter
					if (filterDef.filterValue == '*') valuesToFilter = filterField.filterValues;  //special case for all values
					else valuesToFilter[0] = filterField.filterValue(filterDef.filterValue);  //or single element array with one named value
					for (let valueIndex = 0; valueIndex < valuesToFilter.length; valueIndex++) {  //potentially we can set all filterValues' states
						let filterValue = valuesToFilter[valueIndex];
						if (filterDef.valueIsFiltered == true) filterValue.valueIsFiltered = true;  //true
						if (filterDef.valueIsFiltered == false) filterValue.valueIsFiltered = false;  //false
						if (filterDef.valueIsFiltered == '!') filterValue.valueIsFiltered = !filterValue.valueIsFiltered;  //invert
					}
				}
			}
			//reset states
			for (let fieldIndex = 0; fieldIndex < this.filterFields.length; fieldIndex++) {
				let filterField = this.filterFields[fieldIndex];
				for (let valueIndex = 0; valueIndex < filterField.filterValues.length; valueIndex++) {
					let filterValue = filterField.filterValues[valueIndex];
					filterValue.valueActiveRows = 0;
					filterValue.valueDormantRows = 0;
				}
			}
			//set states per table
				for (let rowIndex = 0; rowIndex < this.filterRecords.length; rowIndex++) {  //scan all filterRecords to calculate active filterRecords and update active field filterValues
					let filterRecord = this.filterRecords[rowIndex];
					filterRecord.rowIsActive = true;  //if any fields are NOT filtered, then the row is NOT active, or we can say that the row is only active when all the fields have isFiltered = true
					let colIndex = 0;
					while (filterRecord.rowIsActive == true && colIndex < filterRecord.rowValues.length) {  //search until we can confirm it doesn't exist in the list - use while so we can exit early
						if(filterRecord.rowValues[colIndex].valueIsFiltered == false) filterRecord.rowIsActive = false;  //if any row has non-filtered values, the row becomes false
						else colIndex++;
					}
					for (let colIndex = 0; colIndex < filterRecord.rowValues.length; colIndex++) {  //set the state of each field's filterValue that exists in the row
						let filterValue = filterRecord.rowValues[colIndex];
						if (filterRecord.rowIsActive == true) filterValue.valueActiveRows += 1;
						else filterValue.valueDormantRows += 1;
					}
				}
		},
		
		/** 
		 * @description Group active rows into a hierarchy of dimensions and aggregate the measures at the lowest level of the hierarchy.
		 * @param {aggregateSpecification} aggregateSpecification - specify dimensions and measures (required).
		 * @returns {hierarchyNode[]} - array of hierarchyNodes.
		 * 
		 * @typedef {Object} aggregateSpecification - specify dimensions and measures by name, but not index
		 * @property {dimensionSpecification[]} dimensions - array of dimensionSpecifications (required).
		 * @property {measureSpecification[]} measures - array of measureSpecifications (required).
		 *
		 * @typedef {Object} dimensionSpecification - specify a dimension by name.
		 * @property {string} fieldName - field name of dimension (required).
		 * @property {string} label - label of dimension (required).
		 * 
		 * @typedef {Object} measureSpecification - specify a measure by name.
		 * @property {string} fieldName - field name of measure (required).
		 * @property {string} label - label of aggregated measure (required).
		 * @property {string} aggregation - aggregation function (required). Can be expanded to support more aggregation functions.
		 * 
		 * @typedef {Object} hierarchyNode - single dimension value with all its subsequent children.
		 * @property {string} label - node label (required).
		 * @property {string} value - node value value(required).
		 * @property {int} level - node level (required).
		 * @property {int} records - total number of records in this node (and all children) (required).
		 * @property {hierarchyNode[]} children - next level's dimensions or measures (required) - this is recursive.
		 * @property {boolean} isMeasure - lowest level contains the measures (required).
		 */
		aggregate(aggregateSpecification) {  //build hierarchy of dimensions and aggregate each group's measures from definition

			function aggrSum(dataset) {
				let result = 0;  //numeric result expected
				for (let setIndex = 0; setIndex < dataset.length; setIndex++) {
					result += parseFloat(dataset[setIndex]);
				}
				return result;
			}

			function aggrCount(dataset) {
				let result = 0;  //numeric result expected
				for (let setIndex = 0; setIndex < dataset.length; setIndex++) {
					result += 1;
				}
				return result;
			}

			/** 
			 * @description Group active filterRecords according to groupFields and returns the groups of filterRecords. Works similar to a GROUP BY statement, except no aggregation is done here.
			 * @param {groupField[]} groupFields - array of groupFields (required).
			 * @returns {filterGroup[]} - array of filterGroups.
			 * 
			 * @typedef {Object} groupField - filterField that participates in a filterGroup.
			 * @property {int} fieldIndex - field index to group by (required).
			 * @property {string} fieldName - field name to group by (optional).
			 *
			 * @typedef {Object} filterGroup - group of active filterRecords that are included with the group formed by the unique combination of fieldField values.
			 * @property {filterValue[]} groupValues - array of groupValues making up a unique filterGroup.
			 * @property {filterRecord[]} groupRecords - array of active filterRecords included in a filterGroup.
			 */
			function buildGroups(groupFields) {  //group active filterRecords according to groupFields and returns the groups of filterRecords
				let filterGroups = [];  //result set of filterGroups
				for (let recordIndex = 0; recordIndex < filterTable.filterRecords.length; recordIndex++) {  //determine group by field combos - scan through all rows, but only use the active ones for groups
					let filterRecord = filterTable.filterRecords[recordIndex];
					if (filterRecord.rowIsActive == true) {  //only do active rows
						let filterGroup = {  //@typedef {Object} filterGroup
							groupValues: [],  //group by unique groupValues combo, will be an array of filterValues
							groupRecords: []  //rows linked to group, will be an array of filterRecords
						}
						for (let fieldIndex = 0; fieldIndex < groupFields.length; fieldIndex++) {  //build filterGroup's groupValues to have columns as per groupFields
							filterGroup.groupValues[fieldIndex] = filterRecord.rowValues[groupFields[fieldIndex].fieldIndex];  //get unique filterValues by index for group definition
						}
						let groupIsFound = false;  //to check if filterGroup exists
						let groupIndex = 0;  //position of found group in filterGroups
						while (groupIsFound == false && groupIndex < filterGroups.length) {  //search until we can confirm filterGroup does exist in the existing filterGroups
							let existingGroup = filterGroups[groupIndex];
							let groupIsSame = true;  //remains true until we find one value that doesn't match, exit early
							let fieldIndex = 0;  //to compare the same dimension indices across groups
							while (groupIsSame == true && fieldIndex < existingGroup.groupValues.length) {  //for filterGroup, compare indices against existingGroup
								if (filterGroup.groupValues[fieldIndex] != existingGroup.groupValues[fieldIndex]) groupIsSame = false;  //exit as soon as the entire filterGroup doesn't match
								else fieldIndex++;
							}
							if (groupIsSame == true) groupIsFound = true;  //this means it will not be added to the unique list of filterGroups
							else groupIndex++;  //search the next groupIndex, or if we exit the loop then this is the next groupIndex
						}
						if (groupIsFound == false) filterGroups[groupIndex] = filterGroup;  //add unique filterGroup to filterGroups at the last groupIndex.
						filterGroups[groupIndex].groupRecords.push(filterRecord);  //active records belong to the filterGroup that was found or created
					}
				}
				return filterGroups;
			}

			/** 
			 * @description Build hierarchy of dimensions and aggregate the measures at the lowest level of the hierarchy.
			 * @param {dimensionDefinition[]} dimensionDefinitions - array of measureDefinitions (required).
			 * @param {measureDefinition[]} measureDefinitions - array of measureDefinitions (required).
			 * @param {filterGroup} filterGroup - filterGroup with unique dimensions, and its associated filterRecords (required).
			 * @param {hierarchyNode[]} hierarchyChildren - nested array of hierarchyNodes, gets populated through recursion (required).
			 * @param {int} hierarchyLevel - hierarchy level, same as dimension index (required).
			 * 
			 * @typedef {Object} dimensionDefinition - define a dimension.
			 * @property {int} fieldIndex - field index of dimension (required).
			 * @property {string} label - label of dimension (required).
			 * 
			 * @typedef {Object} measureDefinition - define a measure.
			 * @property {int} fieldIndex - field index of measure (required).
			 * @property {string} label - label of aggregated measure (required).
			 * @property {string} aggregation - aggregation function (required). Can be expanded to support more aggregation functions.
			 */
			function buildHierarchy(dimensionDefinitions, measureDefinitions, filterGroup, hierarchyChildren, hierarchyLevel) {  //recursively build the hierarchy of dimensions
				let nodeLabel = dimensionDefinitions[hierarchyLevel].label;  //get label from definitions
				let nodeValue = filterGroup.groupValues[hierarchyLevel].valueName;  //build list of unique values, for each field in the group
				let valueIsFound = false;  //to check if value exists
				let valueIndex = 0;  //position of found value
				while (valueIsFound == false && valueIndex < hierarchyChildren.length) {  //search until we can confirm it doesn't exist in the list - use while so we can exit early
					if (nodeValue == hierarchyChildren[valueIndex].value) valueIsFound = true;
					else valueIndex++;
				}
				if (valueIsFound == false) hierarchyChildren[valueIndex] = {  //@typedef hierarchyNode (as dimension)
					label: nodeLabel,  //dimension label
					value: nodeValue,  //dimension unique value
					level: hierarchyLevel,  //dimension level
					children: [],  //next level down of dimensions gets populated by recursion
					measures: [],  //aggregated measures
					groups: []  //consolidated filterGroups - length of this array informs rowspan in pivot
					//isMeasure : false  //lowest level contains the measures as children REDUNDANT
				}

				let hierarchyNode = hierarchyChildren[valueIndex];
				if (hierarchyLevel < (filterGroup.groupValues.length-1)) hierarchyNode.children = buildHierarchy(dimensionDefinitions, measureDefinitions, filterGroup, hierarchyNode.children, hierarchyLevel+1);  //only recurse while we have children - the levels can only go as deep as the number of dimension fields/groupValues

				hierarchyNode.groups.push(filterGroup);
				return hierarchyChildren;
			}

			function aggregateHierarchy(nodeHierarchy) {
				for (let nodeIndex = 0; nodeIndex < nodeHierarchy.length; nodeIndex++) {
					let node = nodeHierarchy[nodeIndex];
					if (node.children.length > 0) aggregateHierarchy(node.children);  //dig deeper
					let measures = [];
					for (let measureIndex = 0; measureIndex < measureDefinitions.length; measureIndex++) {  //measures are as per definition
						let measureDefinition = measureDefinitions[measureIndex];
						let measureDataset = [];
						for (let groupIndex = 0; groupIndex < node.groups.length; groupIndex++) {
							let filterGroup = node.groups[groupIndex];
							for (let rowIndex = 0; rowIndex < filterGroup.groupRecords.length; rowIndex++) {  //aggregate all linked filterRecords in group
								let filterRecord = filterGroup.groupRecords[rowIndex];
								measureDataset.push(filterRecord.rowValues[measureDefinition.fieldIndex].valueName);  //pick the correct column in the row as defined for the measure
							}
						}
						let measureResult = null;  //the actual aggregation result
						if (measureDefinition.aggregation == 'sum') measureResult = aggrSum(measureDataset);
						else if (measureDefinition.aggregation == 'count') measureResult = aggrCount(measureDataset);
						measures[measureIndex] = {  //@typedef hierarchyNode (as measure)
							label: measureDefinition.label,  //measure label
							value: measureResult  //measure value
						}
					}
					node.measures = measures;
				}
				return nodeHierarchy;
			}

			let dimensionDefinitions = [];
			for (let dimensionIndex = 0; dimensionIndex < aggregateSpecification.dimensions.length; dimensionIndex++) {  //build indexed dimensionDefinitions
				let dimensionDefinition = aggregateSpecification.dimensions[dimensionIndex];
				dimensionDefinitions[dimensionIndex] = {  //@typedef dimensionDefinition
					fieldIndex: this.filterField(dimensionDefinition.fieldName).fieldIndex,   //field index of dimension (required), get fieldIndex from fieldName
					label: dimensionDefinition.label  //label of dimension (required)
				};
			}
			let measureDefinitions = [];
			for (let measureIndex = 0; measureIndex < aggregateSpecification.measures.length; measureIndex++) {  //build indexed measureDefinitions
				let measureDefinition = aggregateSpecification.measures[measureIndex];
				measureDefinitions[measureIndex] = {  //@typedef measureDefinition
					fieldIndex: this.filterField(measureDefinition.fieldName).fieldIndex,  //field index of measure (required), get fieldIndex from fieldName
					label: measureDefinition.label,  //label of aggregated measure (required)
					aggregation: measureDefinition.aggregation  //aggregation function (required)
				};
			}
			let filterGroups = buildGroups(dimensionDefinitions);  //group by the dimensionDefinitions and return a group of records for each unique combination of dimension values
			let filterHierarchy = [];  //each successive dimension will form another level in the hierarchy
			for (let groupIndex = 0; groupIndex < filterGroups.length; groupIndex++) {
			  	let filterGroup = filterGroups[groupIndex];
			  	filterHierarchy = buildHierarchy(dimensionDefinitions, measureDefinitions, filterGroup, filterHierarchy, 0);  //recursively work down all the levels of hierarchy, aggregation happens on measures on the lowest level
			}
			//once the hierarchy is built we can do the aggregations
			filterHierarchy = aggregateHierarchy(filterHierarchy);
			return filterHierarchy;
		}
	}

	{  //build filterTables and filterFields

		for (let colIndex = 0; colIndex < tableDefinition.tableData[0].length; colIndex++) {  //use table header as basis for number of columns
			let filterField = filterTable.filterField(tableDefinition.tableData[0][colIndex]);  //find or create filterField by name - NB!!! should we pass this by ref or value!!!??
			for (let rowIndex = 1; rowIndex < tableDefinition.tableData.length; rowIndex++) {  //table data start at row 1
				let filterValue = filterField.filterValue(tableDefinition.tableData[rowIndex][colIndex]);  //NB!!! should we pass this by ref or value!!!??
				if (colIndex == 0) filterTable.filterRecords[rowIndex-1] = {  //define filterRecord and add filterRecord definition only once with the zero-th tableData column. filterRecords will have one less record than tableData due to header row
					rowIsActive : true,  //all rows active by default
					rowValues : []  //to be populated below
				}
				filterTable.filterRecords[rowIndex-1].rowValues[colIndex] = filterValue;  //populate filterRecord with field element reference - 0 based, so subtract header row
			}
		}
	}	
	return filterTable;
}

