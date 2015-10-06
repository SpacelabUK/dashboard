package uk.co.spacelab.depthmap;

import java.awt.Color;
import java.awt.image.BufferedImage;
import java.util.HashMap;
import java.util.Map;

public class Raster {

	public double x, y, cellW, cellH;
	public int id, cellNumX, cellNumY;
	public Map<String, RasterBand> bands;
	Raster(double x, double y, double cellW, double cellH, int cellNumX,
			int cellNumY) {
		this.x = x;
		this.y = y;
		this.cellW = cellW;
		this.cellH = cellH;
		this.cellNumX = cellNumX;
		this.cellNumY = cellNumY;
		bands = new HashMap<String, RasterBand>();
	}
	public void addBand(String name, String dataType, float initialValue,
			Float [][] bf, float [] limits) {
		System.out.println(name);
		bands.put(name, new RasterBand(this, dataType, initialValue).setData(
				bf, limits));
	}
	public class RasterBand {

		public int id;
		public float initialValue = 0;
		public String dataType = "32BF";
		public Float [][] fa;
		public Raster parent;
		float [] limits;
		/**
		 * @param dataType
		 *            is the type of date, i.e. "32BF" From:
		 *            http://postgis.net/docs/RT_ST_BandPixelType.html <br>
		 *            There are 11 pixel types. Pixel Types supported are as
		 *            follows: <br>
		 *            1BB - 1-bit boolean <br>
		 *            2BUI - 2-bit unsigned integer <br>
		 *            4BUI - 4-bit unsigned integer <br>
		 *            8BSI - 8-bit signed integer <br>
		 *            8BUI - 8-bit unsigned integer <br>
		 *            16BSI - 16-bit signed integer <br>
		 *            16BUI - 16-bit unsigned integer <br>
		 *            32BSI - 32-bit signed integer <br>
		 *            32BUI - 32-bit unsigned integer <br>
		 *            32BF - 32-bit float <br>
		 *            64BF - 64-bit float <br>
		 */
		public RasterBand(Raster parent, String dataType, float initialValue) {
			this.parent = parent;
			this.dataType = dataType;
			this.initialValue = initialValue;
		}
		public RasterBand setData(Float [][] fa, float [] limits) {
			this.fa = fa;
			this.limits = limits;
			return this;
		}
		public BufferedImage asBufferedImage() {
			int cellNumberX = fa.length;
			int cellNumberY = fa[0].length;
			BufferedImage bf =
					new BufferedImage(cellNumberX, cellNumberY,
							BufferedImage.TYPE_INT_ARGB);
			for (int i = 0; i < cellNumberX; i++) {
				for (int j = 0; j < cellNumberY; j++) {
					bf.setRGB(i, j, 0x00000000);
				}
			}
			boolean displayEdges = false;
			if (displayEdges) {
				bf.setRGB(0, 0, 0xff0000ff);
				bf.setRGB(cellNumberX - 1, cellNumberY - 1, 0xff0000ff);
			}
			for (int i = 0; i < cellNumberX; i++) {
				for (int j = 0; j < cellNumberY; j++) {
					if (fa[i][j] == null) continue;
					float measure = fa[i][j];
					float measureColor =
							0.66f * (1f - Math.abs((measure - limits[0])
									/ (limits[1] - limits[0])));
					int rgb = Color.HSBtoRGB(measureColor, 1f, 1f);
					if (i < cellNumberX && j < cellNumberY)
					// bf.setRGB(cellX, cellY, 0xff000000 | measure << 16);
						bf.setRGB(i, j, 0xff000000 | rgb);
				}
			}
			return bf;
		}
	}
}
