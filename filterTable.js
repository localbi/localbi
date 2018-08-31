'use strict';

/** 
 * Namespace for localBi classes and functions.
 * @namespace
 */
var localBi = localBi || {};

/** 
 * Constructs filterTable objects. Build the filterTable's filterRecords and filterFields from normalised tableData. Each field is scanned and only unique values stored in each filterField. Each record is scanned and only a reference to the field value is stored in each filterRecord.
 * @constructor
 * @param {tableDefinition} tableDefinition - Table definition conisting of unique field values and normalised records.
 * @returns {filterTable} A filterTable object that can be filtered and aggregated.
 */
localBi.filterTable = function(tableDefinition) {
	/**
	 * @typedef {object} tableDefinition - Define filterTable's name, fields, records and functions.
	 * @property {string} tableName - Table name.
	 * @property {tableField[]} tableFields - Array of field arrays. Each field array is an array of unique field values.
	 * @property {tableRecord[]} tableRecords - Array of normalised table record arrays. Each record array contains the index of the unique field value.
	 * @property {tableFunctions} tableFunctions - Functions used to aggregate measures.
	 */

	/**
	 * @typedef {array} tableField - Each field array is an array of unique field values.
	 * @property {string} value - Unique field value.
	 */

	/**
	 * @typedef {array} tableRecord - Each record array contains the index of the unique field value.
	 * @property {int} valueIndex - Index of value in the correspondingly index tableField
	 */
	
	/**
	 * @typedef {object} tableFunctions - Contains functions used to aggregate measures.
	 * @property {tableFunction} myFunction1 - Your own function to calculate a measure.
	 * @property {tableFunction} myFunction2 - Your own function to calculate a measure.
	 * @property {tableFunction} myFucntionN - Your own function to calculate a measure.
	 */

	/**
	 * @typedef {object} tableFunction - Function that gets called to aggregate hierarchy records.
	 * @param {filterTable} table - filterTable reference.
	 * @param {hierarchyNode} node - hierarchyNode reference.
	 * @returns {object} The calculated measure result.
	 */

	let filterFields = [];
	for (let fieldIndex = 0; fieldIndex < tableDefinition.tableFields.length; fieldIndex++) {  //build filterFields
		let tableField = tableDefinition.tableFields[fieldIndex];  //this will be an array of field values
		let filterValues = [];
		for (let valueIndex = 0; valueIndex < tableField.length; valueIndex++) {  //value data starts at index 1, but we include the header (which is the field name) so we don't lose any record index references

		/**
		 * @typedef {object} filterValue - One unique field value (per field).
		 * @property {string} valueName - description of value (actual value of the incoming cell).
		 * @property {number} valueIndex - position in parent array.
		 * @property {number} valueActiveRows - number of active records where this value is found.
		 * @property {number} valueDormantRows - number of dormant records where this value is found.
		 * @property {boolean} valueIsActive - indicates whether user has actively filtered this value.
		 */
		let filterValue = {  //@typedef filterValue
				valueName : tableField[valueIndex],  //unique value name (actually description, but we use name for consistency, and it's shorter :-))
				valueIndex : valueIndex,  //track position in filterValues
				valueActiveRows : 0,  //number of rows in which this value is active - determined when we group by
				valueDormantRows : 0,  //number of rows in which this value is dormant - determined when we group by
				valueIsActive : true  //actioned by user
			}
			filterValues[valueIndex] = filterValue;  //indices here will correspond to the tableRecord indices
		}

		/** 
		 * @typedef {object} filterField - One field containing an array of unique filterValues.
		 * @property {string} fieldName - Name of field.
		 * @property {number} fieldIndex - Position in parent array.
		 * @property {filterValue[]} fieldValues - Array of filterValues, one index for each unique value.
		 * @property {findValue} findValue - Function that finds an existing filterValue by valueName.
		 */
		let filterField = {  //@typeDef filterField
			fieldName : tableField[0],  //get field name from header
			fieldIndex : fieldIndex,  //track position in filterFields
			fieldValues : filterValues,  //unique field values

			/** 
			 * @function findValue
			 * @description Finds an existing filterValue by valueName.
			 * @param {string} valueName - Value name.
			 * @returns {filterValue} Found filterValue, or null if not found.
			 */
			findValue(valueName) {
				let valueIsFound = false;  //to check if filterValue exists
				let valueIndex = 0;  //position of found filterValue
				while (valueIsFound == false && valueIndex < filterField.fieldValues.length) {  //search until we can confirm it doesn't exist in the list - use while so we can exit early
					if (valueName == filterField.fieldValues[valueIndex].valueName) valueIsFound = true;
					else valueIndex++;
				}
				if (valueIsFound == false) return null;
				else return filterField.fieldValues[valueIndex];
			}			
		}
		filterFields[fieldIndex] = filterField;  //indices here will correspond to the tableRecord indices
	}

	let filterRecords = [];
	for (let recordIndex = 1; recordIndex < tableDefinition.tableRecords.length; recordIndex++) {  //build filterRecords - record data starts at index 1, skip header
		let recordValues = [];
		for (let fieldIndex = 0; fieldIndex < filterFields.length; fieldIndex++) {  //we should have the same number of fields in records
			let filterField = filterFields[fieldIndex];  //get field from fieldIndex
			let valueIndex = tableDefinition.tableRecords[recordIndex][fieldIndex];  //tableRecords contains index of filterValue for the same fieldIndex
			let filterValue = filterField.fieldValues[valueIndex];
			recordValues[fieldIndex] = filterValue;
		}

		/**
		 * @typedef {object} filterRecord - One field containing an array of unique filterValues.
		 * @property {boolean} recordIsActive - Indicator if record is active or dormant.
		 * @property {filterValue[]} recordValues - Array of filterValues, one index for every field.
		 */
		let filterRecord = {  //@typedef filterRecord
			recordIsActive : true,  //all records active by default
			recordValues : recordValues  //lookups to field filterValues
		}
		filterRecords[recordIndex-1] = filterRecord;  //we don't keep the header record
	}

	/** 
	 * @typedef {object} filterTable - Normalised table structure that facilitates filtering and aggregation.
	 * @property {string} filterName - Name of table.
	 * @property {filterField[]} filterFields - Array of filterFields, containing unique field values.
	 * @property {filterRecord[]} filterRecords - Array of filterRecords, containing references to unique field values.
	 * @property {function[]} filterFunctions - Array of aggregation functions.
	 * @property {findField} findField - Function that finds an existing filterField by name.
	 * @property {filter} filter - Function that filters the dataset.
	 * @property {aggregate} aggregate - Function that aggregates the dataset.
	 */
	 let filterTable = {  //@typedef filterTable
		filterName : tableDefinition.tableName,  //name
		filterFields : filterFields,  //unique field values
		filterRecords : filterRecords,  //normalised records
		filterFunctions : tableDefinition.tableFunctions,  //aggregation functions

		/** 
		 * @function findField
		 * @description Finds an existing filterField by name.
		 * @param {string} fieldName - Field name.
		 * @returns {filterField} Found filterField, or null if not found.
		 */
		findField(fieldName) {  //find filterField if it exists, else return null
			let fieldIsFound = false;  //to check if filterField exists
			let fieldIndex = 0;  //position of found filterField
			while (fieldIsFound == false && fieldIndex < filterTable.filterFields.length) {  //search until we can confirm it doesn't exist in the list - use while so we can exit early
				if (fieldName == filterTable.filterFields[fieldIndex].fieldName) fieldIsFound = true;
				else fieldIndex++;
			}
			if (fieldIsFound == false) return null;
			else return filterTable.filterFields[fieldIndex];
		},

		/** 
		 * @function filter
		 * @description Apply filterSpecifications to filterFields and updates the active states of filterRecords and filterValues. Filters are applied in the sequence listed.
		 * @param {filterSpecification[]} filterSpecifications - Array of filterSpecification to apply (required).
		 */
		filter(filterSpecifications) {  //apply filters, specification uses fieldName
			/** 
			 * @typedef {object} filterSpecification - Specify field and value filter by name
			 * @property {string} field - Actual field name or '*' for all fields
			 * @property {string} value - Actual value name or '*' for all values
			 * @property {string/boolean} isActive - Active status : true / false / '!' for invert
			 */
			for (let filterIndex = 0; filterIndex < filterSpecifications.length; filterIndex++) {  //set all filterValues' filter state as defined by filterSpecifications
				let filterSpecification = filterSpecifications[filterIndex];
				let fieldsToFilter = [];  //placeholder for subset of fields to filter
				if (filterSpecification.field == '*') fieldsToFilter = filterTable.filterFields;  //special case for all fields
				else fieldsToFilter[0] = filterTable.findField(filterSpecification.field);  //or single element array with one named field
				for (let fieldIndex = 0; fieldIndex < fieldsToFilter.length; fieldIndex++) {  //potentially we can set all filterFields' states
					let filterField = fieldsToFilter[fieldIndex];
					let valuesToFilter = [];  //placeholder for subset of values to filter
					if (filterSpecification.value == '*') valuesToFilter = filterField.fieldValues;  //special case for all values
					else valuesToFilter[0] = filterField.findValue(filterSpecification.value);  //or single element array with one named value
					for (let valueIndex = 0; valueIndex < valuesToFilter.length; valueIndex++) {  //potentially we can set all filterValues' states
						let filterValue = valuesToFilter[valueIndex];
						if (filterSpecification.isActive == true) filterValue.valueIsActive = true;  //true
						else if (filterSpecification.isActive == false) filterValue.valueIsActive = false;  //false
						else if (filterSpecification.isActive == '!') filterValue.valueIsActive = !filterValue.valueIsActive;  //invert
					}
				}
			}

			for (let fieldIndex = 0; fieldIndex < filterTable.filterFields.length; fieldIndex++) {  //reset all filterValue states for all filterFields
				let filterField = filterTable.filterFields[fieldIndex];
				for (let valueIndex = 0; valueIndex < filterField.fieldValues.length; valueIndex++) {
					let filterValue = filterField.fieldValues[valueIndex];
					filterValue.valueActiveRows = 0;
					filterValue.valueDormantRows = 0;
				}
			}

			for (let recordIndex = 0; recordIndex < filterTable.filterRecords.length; recordIndex++) {  //scan all filterRecords to calculate active filterRecords and update active filterValues
				let filterRecord = filterTable.filterRecords[recordIndex];
				filterRecord.recordIsActive = true;  //if any fields are NOT filtered, then the record is NOT active, or we can say that the record is only active when all the field values have valueIsActive = true
				let fieldIndex = 0;
				while (filterRecord.recordIsActive == true && fieldIndex < filterRecord.recordValues.length) {  //search until we can confirm it doesn't exist in the list - use while so we can exit early
					if (filterRecord.recordValues[fieldIndex].valueIsActive == false) filterRecord.recordIsActive = false;  //if any record has non-filtered values, the record becomes false
					else fieldIndex++;
				}
				for (let fieldIndex = 0; fieldIndex < filterRecord.recordValues.length; fieldIndex++) {  //set the state of each field's filterValue that exists in the record
					let filterValue = filterRecord.recordValues[fieldIndex];
					if (filterRecord.recordIsActive == true) filterValue.valueActiveRows += 1;   //record state gets propagated to each filterValue state in that record
					else filterValue.valueDormantRows += 1;
				}
			}
		},
		
		/** 
		 * @function aggregate
		 * @description Group active rows into a hierarchy of dimensions and calculate the measures at each level of the hierarchy.
		 * @param {aggregateSpecification} aggregateSpecification - Specify dimensions and measures (required).
		 * @returns {hierarchyNode[]} Array of hierarchyNodes with calculated measures.
		 */
		aggregate(aggregateSpecification) {  //build hierarchy of dimensions and calculate measures.
			/**
			 * @typedef {object} aggregateSpecification - Specify dimensions and measures by name, but not index
			 * @property {dimensionSpecification[]} dimensions - Array of dimensionSpecifications (required).
			 * @property {measureSpecification[]} measures - Array of measureSpecifications (required).
			 */

			function buildGroups(dimensionSpecifications) {  //group active filterRecords according to dimensionSpecifications and returns the groups of filterRecords
				/**
				 * @typedef {object} dimensionSpecification - Specify a dimension by name.
				 * @property {string} field - Field name of dimension (required).
				 */

				for (let dimensionIndex = 0; dimensionIndex < dimensionSpecifications.length; dimensionIndex++) {  //build indexed dimensionSpecifications - faster to do this upfront
					dimensionSpecifications[dimensionIndex].fieldIndex = filterTable.findField(dimensionSpecifications[dimensionIndex].field).fieldIndex;  //get fieldIndex from fieldName
				}
				let filterGroups = [];  //result set of filterGroups
				for (let recordIndex = 0; recordIndex < filterTable.filterRecords.length; recordIndex++) {  //determine group by field combos - scan through all rows, but only use the active ones for groups
					let filterRecord = filterTable.filterRecords[recordIndex];
					if (filterRecord.recordIsActive == true) {  //only do active rows

						/**
						 * @typedef {object} hierarchyGroup - Single group made up of unique combination of filterValues.
						 * @property {string} value - Node unique value.
						 * @property {int} level - Node hierarchy level.
						 * @property {filterValue[]} groupValues - Unique combination of filtervalues that denotes one hierarchyGroup.
						 * @property {filterRecord[]} groupRecords - Array of all active fiterRecords that belong to this hierarchyGroup.
						 */
						let filterGroup = {  //@typedef hierarchyGroup
							groupValues: [],  //group by unique groupValues combo, will be an array of filterValues
							groupRecords: []  //rows linked to group, will be an array of filterRecords
						}
						for (let dimensionIndex = 0; dimensionIndex < dimensionSpecifications.length; dimensionIndex++) {  //build filterGroup's groupValues to have columns as per dimensionSpecifications
							filterGroup.groupValues[dimensionIndex] = filterRecord.recordValues[dimensionSpecifications[dimensionIndex].fieldIndex];  //get unique filterValues by index for group definition
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
				return filterGroups;   //array of filterGroups
			}

			function buildHierarchy(filterGroup, hierarchyChildren, hierarchyLevel) {  //recursively build the hierarchy of dimensions, one level per dimension, for one filterGroup
				let nodeValue = filterGroup.groupValues[hierarchyLevel].valueName;  //build list of unique values, for each field in the group
				let valueIsFound = false;  //to check if value exists
				let valueIndex = 0;  //position of found value
				while (valueIsFound == false && valueIndex < hierarchyChildren.length) {  //search until we can confirm it doesn't exist in the list - use while so we can exit early
					if (nodeValue == hierarchyChildren[valueIndex].value) valueIsFound = true;
					else valueIndex++;
				}

				/**
				 * @typedef {object} hierarchyNode - Single dimension value with all its subsequent children.
				 * @property {string} value - Node unique value.
				 * @property {int} level - Node hierarchy level.
				 * @property {hierarchyNode[]} children - Next dimension's nodes - this is recursive.
				 * @property {hierarchyMeasure[]} measures - Calculated measures for each level in hierarchy.
				 * @property {hierarchyGroup[]} groups - All groups (and subgroups) for each level of hierarchy.
				 */
				if (valueIsFound == false) hierarchyChildren[valueIndex] = {  //@typedef hierarchyNode
					value: nodeValue,  //dimension unique value
					level: hierarchyLevel,  //hierarchy level
					children: [],  //next level of dimensions gets populated by recursion
					measures: [],  //aggregated measures gets populated only once the hierarchy is fully built
					groups: []  //consolidated filterGroups - length of this array informs rowspan in pivot
				}

				let hierarchyNode = hierarchyChildren[valueIndex];
				if (hierarchyLevel < (filterGroup.groupValues.length-1)) hierarchyNode.children = buildHierarchy(filterGroup, hierarchyNode.children, hierarchyLevel+1);  //only recurse while we have children - the levels can only go as deep as the number of dimension fields/groupValues

				hierarchyNode.groups.push(filterGroup);  //keep track of all groups used to build the hierarchy
				return hierarchyChildren;
			}

			function aggregateHierarchy(measureSpecifications, nodeHierarchy) {  //aggregate the active filterRecords for each level in the hierarchy. Passes filterTable and node through to aggregation function defined in tableFunctions.
				/**
				 * @typedef {object} measureSpecification - Specify a measure by calculation function.
				 * @property {string} calculation - Calculation function name (required). 
				 */

				for (let nodeIndex = 0; nodeIndex < nodeHierarchy.length; nodeIndex++) {
					let node = nodeHierarchy[nodeIndex];
					if (node.children.length > 0) aggregateHierarchy(measureSpecifications, node.children);  //dig deeper
					let measures = [];
					for (let measureIndex = 0; measureIndex < measureSpecifications.length; measureIndex++) {  //measures are as per specification

						/**
						 * @typedef {object} hierarchyMeasure - Measure value at one level in hierarchy.
						 * @property {object} value - Measure value as returned from function call.
						 */
						measures[measureIndex] = {  //@typedef hierarchyMeasure
							value: filterTable.filterFunctions[measureSpecifications[measureIndex].calculation](filterTable, node)  //call function to calculate measure, passing node and filterTable to lookup fields
						}
					}
					node.measures = measures;
				}
				return nodeHierarchy;  //returns updated hierarchy with measures.
			}

			let filterGroups = buildGroups(aggregateSpecification.dimensions);  //group by the dimensionSpecifications and return a group of records for each unique combination of dimension values
			let filterHierarchy = [];  //each successive dimension will form another level in the hierarchy
			for (let groupIndex = 0; groupIndex < filterGroups.length; groupIndex++) {
			  	filterHierarchy = buildHierarchy(filterGroups[groupIndex], filterHierarchy, 0);  //recursively populate all the levels of hierarchy, one level per dimension
			}
			return aggregateHierarchy(aggregateSpecification.measures, filterHierarchy);  //once the hierarchy is built we can do the calculations
		}
	}
	return filterTable;
}