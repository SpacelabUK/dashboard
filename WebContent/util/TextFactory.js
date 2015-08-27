app.factory('TextFactory', [
	function() {
		var pub = {
			getVNAData : function(text) {
				var i, j, result = {};
				text = text.replace('\r', '\n');
				text = text.replace(/ {1,}/g, ' ');
				var lines = text.split('\n');
				var node_data = {
					rows : []
				};
				var tie_data = {
					rows : []
				};
				var currentRows = null;
				for (i = 0; i < lines.length; i++) {
					if (lines[i].trim().toUpperCase() == '*NODE DATA') {
						currentRows = node_data.rows;
						node_data.headers = lines[i + 1].trim().split(' ');
						i++;
					} else if (lines[i].trim().toUpperCase() == '*TIE DATA') {
						currentRows = tie_data.rows;
						tie_data.headers = lines[i + 1].trim().split(' ');
						i++;
					} else if (currentRows) {
						var line = lines[i].trim();
						if (line.length > 0) {
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
]);