package uk.co.spacelab.depthmap;
import java.awt.Color;
import java.awt.image.BufferedImage;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import uk.co.spacelab.dxf.DXFReader;

//public class DepthMap extends Layer {
public class DepthMap {
	final int accuracy = 1; // the units of these numbers are the same as the
							// units in the csv file
	float scale = 1;
	String refKey = "Ref", xKey = "x", yKey = "y";
	public double cellW = Float.MAX_VALUE, cellH = Float.MAX_VALUE;
	public double maxX = -Float.MAX_VALUE, minX = Float.MAX_VALUE;
	public double maxY = -Float.MAX_VALUE, minY = Float.MAX_VALUE;
	int cellNumberX, cellNumberY;
	public DepthCell [] cells;
	float yAxis = 1;
	public Map<String, double []> blockPositions;
	DepthMap parent;
	Raster raster;
	// contains id of measure and min [0] and max [1] values
	Map<String, float []> measureLimits = new HashMap<String, float []>();
	public String name;
	public DepthMap(DepthMap parent, List<DepthCell> cells, String name,
			double [] origin) {
		this.parent = parent;
		this.name = parent.name;
		this.cells = cells.toArray(new DepthCell [cells.size()]);
		blockPositions = new HashMap<String, double []>();
		blockPositions.put(name, origin);
		this.scale = parent.scale;
		this.measureLimits = parent.measureLimits;
		findProperties();
	}
	public DepthMap(String name, List<String> linesIn, DXFReader dxf,
			float scale) {
		this.name = name;
		this.scale = scale;
		// linesIn = loadStrings("Vis3.csv");
		String [] titles;
		if (linesIn.contains("\""))
			titles =
					linesIn.get(0).substring(1, linesIn.get(0).length() - 1)
							.split("\",\"");
		else titles = linesIn.get(0).split(",");
		List<String> cleanLines = new ArrayList<String>();
		for (String line : linesIn)
			if (line.trim().length() > 0) cleanLines.add(line);
		cleanLines.remove(0);
		cells = new DepthCell [cleanLines.size()];
		for (String t : titles) {
			System.out.println(t);
			if (t.trim().equalsIgnoreCase(refKey)) {
				refKey = t;
				System.out.println("Ref found: " + refKey);
			} else if (t.trim().toLowerCase().equals(xKey))
				xKey = t;
			else if (t.trim().toLowerCase().equals(yKey)) yKey = t;
			// measures.put(t, new float [cleanLines.size()]);
		}
		for (int i = 0; i < cleanLines.size(); i++) {
			cells[i] = new DepthCell();
			String [] cellValues;
			if (cleanLines.get(i).contains("\""))
				cellValues =
						cleanLines.get(i)
								.substring(1, cleanLines.get(i).length() - 1)
								.split("\",\"");
			else cellValues = cleanLines.get(i)

			.split(",");
			try {
				for (int j = 0; j < titles.length; j++)
					if (titles[j].equalsIgnoreCase(refKey)) {
						cells[i].ref = Integer.parseInt(cellValues[j]);
					} else if (titles[j].equals(xKey))
						cells[i].x = Float.parseFloat(cellValues[j]) * scale;
					else if (titles[j].equals(yKey))
						cells[i].y =
								yAxis * Float.parseFloat(cellValues[j]) * scale;
					else {
						String measureKey = titles[j];
						float measureValue = Float.parseFloat(cellValues[j]);
						cells[i].setMeasure(measureKey, measureValue);
						if (!measureLimits.containsKey(measureKey))
							measureLimits.put(measureKey, new float [] {
									Float.MAX_VALUE, -Float.MAX_VALUE});
						if (measureValue < measureLimits.get(measureKey)[0])
							measureLimits.get(measureKey)[0] = measureValue;
						if (measureValue > measureLimits.get(measureKey)[1])
							measureLimits.get(measureKey)[1] = measureValue;
					}
			} catch (NumberFormatException nfe) {
				nfe.printStackTrace();
			}
		}
		blockPositions = new HashMap<String, double []>();
		addInfoFromDXF(dxf, scale);
		findProperties();
	}
	public Raster getMeasuresMap() {
		if (null != raster) return raster;
		raster =
				new Raster(minX - cellW * 0.5, minY - cellH * 0.5, cellW,
						cellH, (int) ((maxX - minX + cellW) / cellW),
						(int) ((maxY - minY + cellH) / cellH));
		for (String measureKey : measureLimits.keySet()) {
			System.out.println(measureKey + " "
					+ measureLimits.get(measureKey)[0] + " "
					+ measureLimits.get(measureKey)[1]);
			Float [][] fa = asFloatArray(measureKey);
			raster.addBand(measureKey, "32BF", 0, fa,
					measureLimits.get(measureKey));
		}
		return raster;
	}
	public Float [][] asFloatArray(String measureName) {
		Float [][] fa = new Float [cellNumberX] [cellNumberY];
		for (int i = 0; i < cells.length; i++) {
			int cellX = (int) ((-minX + cells[i].x) / cellW);
			int cellY = (int) ((-minY + cells[i].y) / cellH);
			fa[cellX][cellY] = cells[i].measures.get(measureName);
		}
		return fa;
	}

	public void addInfoFromDXF(DXFReader dxf, float scale) {
		String currBlock = null;
		List<String []> blockData = dxf.breakDXFEntities(dxf.blk);
		for (String [] e : blockData) {
			if (e[0].equalsIgnoreCase("BLOCK")) {
				String blockName = e[1].trim().split(" ")[0];
				if (!blockName.startsWith(DXFReader.generalIdentifier)) {
					currBlock = null;
					continue;
				}
				currBlock =
						e[1].substring(DXFReader.generalIdentifier.length());
			}
			if (null == currBlock) continue;
			if (!e[0].equalsIgnoreCase("MTEXT")) continue;
			if (!e[1].equalsIgnoreCase(DXFReader.generalIdentifier
					+ DXFReader.propIdentifier)) continue;
			if (!e[3].trim().equalsIgnoreCase(DXFReader.baselineIdentifier))
				continue;
			try {

				blockPositions.put(currBlock,
						new double [] {Float.parseFloat(e[4]) * scale,
								yAxis * Float.parseFloat(e[5]) * scale, 0, 0});
			} catch (NumberFormatException nfe) {
				continue;
			}
		}
		Map<String, double []> insertLocations =
				new HashMap<String, double []>();
		List<String []> entData = dxf.breakDXFEntities(dxf.ent);
		for (String [] e : entData) {
			if (!e[0].equalsIgnoreCase("INSERT")) continue;
			String blockName = e[2].trim().split(" ")[0];
			if (!blockName.startsWith(DXFReader.generalIdentifier)) continue;
			blockName =
					blockName.substring(DXFReader.generalIdentifier.length());
			System.out.println("rotation of " + blockName + ": " + e[9]);
			if (blockPositions.containsKey(blockName))
				insertLocations.put(blockName,
						new double [] {Double.parseDouble(e[3]) * scale,
								yAxis * Double.parseDouble(e[4]) * scale, 0,
								Double.parseDouble(e[9])});

		}
		for (String key : blockPositions.keySet()) {
			if (insertLocations.containsKey(key)) {
				blockPositions.get(key)[0] += insertLocations.get(key)[0];
				blockPositions.get(key)[1] += insertLocations.get(key)[1];
				blockPositions.get(key)[2] += insertLocations.get(key)[2];
				blockPositions.get(key)[3] += insertLocations.get(key)[3];
				System.out.println("Block position: " + key
						+ blockPositions.get(key)[0] + " "
						+ blockPositions.get(key)[1]);
			}
		}
	}
	public void findProperties() {
		for (int i = 0; i < cells.length; i++) {
			for (int j = i + 1; j < cells.length; j++) {
				if (Math.abs(cells[i].x - cells[j].x) > scale
						&& cellW > Math.abs(cells[i].x - cells[j].x))
					cellW = Math.abs(cells[i].x - cells[j].x);
				if (Math.abs(cells[i].y - cells[j].y) > scale
						&& cellH > Math.abs(cells[i].y - cells[j].y))
					cellH = Math.abs(cells[i].y - cells[j].y);
			}
			if (maxX < cells[i].x) maxX = cells[i].x;
			if (minX > cells[i].x) minX = cells[i].x;
			if (maxY < cells[i].y) maxY = cells[i].y;
			if (minY > cells[i].y) minY = cells[i].y;
		}
		cellNumberX = (int) Math.abs((maxX - minX) / cellW) + 1;
		cellNumberY = (int) Math.abs((maxY - minY) / cellH) + 1;
	}
	public class DepthCell {
		public int ref;
		// int iX, iY;
		public double x, y; // THIS IS THE CENTER OF THE CELLL!
		public Map<String, Float> measures = new HashMap<String, Float>();
		DepthCell() {
		}
		private DepthCell(double x, double y, Map<String, Float> measures) {
			this.x = x;
			this.y = y;
			this.measures = measures;
		}
		private DepthCell(int ref, double x, double y,
				Map<String, Float> measures) {
			this.ref = ref;
			this.x = x;
			this.y = y;
			this.measures = measures;
		}
		void setMeasure(String measure, float value) {
			measures.put(measure, value);
		}
		public DepthCell copyAt(int ref, double offsetX, double offsetY) {
			// TODO: The two cells will reference the same measures array......
			return new DepthCell(ref, x + offsetX, y + offsetY, measures);
		}
	}
}
