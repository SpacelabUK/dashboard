(function() {
	angular.module('app.core').factory('textParserService', textParseService);
	textParseService.$inject = [];
	function textParseService() {
		var pub = {
			getVNAData : function(text) {
				"use strict";
				var i, j, result = {};
				text = text.replace(/\r\n/g, '\n');
				text = text.replace(/\r/g, '\n');
				text = text.replace(/ {1,}/g, ' ');
				var lines = text.split('\n');
				var node_data = {
					rows : []
				};
				var tie_data = {
					rows : []
				};
				var vnaFormat = 'ona';
				var currentRows = null;
				for (i = 0; i < lines.length; i++) {
					if (lines[i].trim().toUpperCase() === '*NODE DATA') {
						currentRows = node_data.rows;
						if (startsWith(lines[i + 1], '"') || vnaFormat === 'ucinet') {
							node_data.headers = lines[i + 1].trim().slice(1,
									lines[i + 1].length - 1).replace(/"[ \t\r]*?,[ \t\r]*?"/g,
									'","').split('\",\"');
							vnaFormat = 'ucinet';
						} else
							node_data.headers = lines[i + 1].trim().split(' ');
						i++;
					} else if (lines[i].trim().toUpperCase() == '*TIE DATA') {
						currentRows = tie_data.rows;
						if (startsWith(lines[i + 1], 'FROM TO "') || vnaFormat === 'ucinet') {
							// UCINET format... for example:
							// FROM TO "ownernode","col2", "col3" etc...
							tie_data.headers = [];
							tie_data.headers.push('from');
							tie_data.headers.push('to');
							var ln = lines[i + 1].substr('FROM TO '.length).trim();
							// remove spaces between double quotes and commas
							// i.e. "aaaa" , "aaaa" to "aaaa","aaaa"
							ln = ln.replace(/"[ \t\r]*?,[ \t\r]*?"/g, '","');
							// remove preceding and trailing double quotes
							ln = ln.slice(1, line.length - 1);
							// split by ","
							tie_data.headers.push(ln.split(/\",\"/g));
							vnaFormat = 'ucinet';
						} else
							tie_data.headers = lines[i + 1].trim().split(' ');
						i++;
					} else if (startsWith(lines[i].trim(), '*')) {
						currentRows = null
					} else if (currentRows) {
						var line = lines[i].trim();
						if (line.length > 0) {
							if (vnaFormat === 'ucinet') {
								if (currentRows === tie_data.rows)
									line = line.replace(/"/g, '').trim().split(",");
								else if (currentRows === node_data.rows)
									line = line.slice(1, line.length - 1).split("\",\"");
							} else
								line = line.slice(1, line.length - 1).split("\" \"");
							currentRows.push(line);
						}
					}
				}
				result.node_data = node_data;
				result.tie_data = tie_data;
				return result;
			},
			/**
			 * @returns object with keys for each header. The data under the header is
			 *          in result[key].data (array)
			 * 
			 */
			extractVNADataUnderHeaders : function(vnasection, reqHeaders) {
				var headers = vnasection.headers;
				var rows = vnasection.rows;
				var i, j;
				var result = {};
				for (i = 0; i < headers.length; i++)
					for (j = 0; j < reqHeaders.length; j++)
						if (eql(headers[i], reqHeaders[j]))
							result[reqHeaders[j]] = {
								index : i,
								data : []
							};
				var avlbHeaders = Object.keys(result);
				for (i = 0; i < rows.length; i++)
					for (j = 0; j < avlbHeaders.length; j++)
						// maybe should be written in a better way eh?
						result[avlbHeaders[j]].data
								.push(rows[i][result[avlbHeaders[j]].index]);
				return result;
			},
			/**
			 * @see extractVNADataUnderHeaders
			 * @returns array with each object having the required headers as
			 *          properties
			 */
			extractVNARowsUnderHeaders : function(vnasection, reqHeaders) {
				var headers = vnasection.headers;
				var rows = vnasection.rows;
				var i, j;
				var avlbHeaders = [];
				var result = [];
				for (i = 0; i < headers.length; i++)
					for (j = 0; j < reqHeaders.length; j++)
						if (eql(headers[i], reqHeaders[j]))
							avlbHeaders.push({
								header : reqHeaders[j],
								index : i
							});
				for (i = 0; i < rows.length; i++) {
					var row = {};
					for (j = 0; j < avlbHeaders.length; j++)
						row[avlbHeaders[j].header] = rows[i][avlbHeaders[j].index];
					result.push(row);
				}
				return result;
			}
		};
		return pub;
	}
})();