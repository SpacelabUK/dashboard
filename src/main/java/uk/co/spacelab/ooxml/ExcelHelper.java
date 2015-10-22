package uk.co.spacelab.ooxml;

import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Chart;
import org.apache.poi.ss.usermodel.Comment;
import org.apache.poi.ss.usermodel.RichTextString;
import org.apache.poi.ss.usermodel.charts.AxisCrosses;
import org.apache.poi.ss.usermodel.charts.AxisPosition;
import org.apache.poi.ss.usermodel.charts.ChartAxis;
import org.apache.poi.ss.usermodel.charts.ChartDataSource;
import org.apache.poi.ss.usermodel.charts.ChartLegend;
import org.apache.poi.ss.usermodel.charts.DataSources;
import org.apache.poi.ss.usermodel.charts.LegendPosition;
import org.apache.poi.ss.usermodel.charts.LineChartData;
import org.apache.poi.ss.usermodel.charts.ValueAxis;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.ss.util.CellReference;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFChart;
import org.apache.poi.xssf.usermodel.XSSFClientAnchor;
import org.apache.poi.xssf.usermodel.XSSFCreationHelper;
import org.apache.poi.xssf.usermodel.XSSFDrawing;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFName;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.xssf.usermodel.charts.XSSFChartLegend;
import org.openxmlformats.schemas.drawingml.x2006.chart.CTAreaChart;
import org.openxmlformats.schemas.drawingml.x2006.chart.CTAreaSer;
import org.openxmlformats.schemas.drawingml.x2006.chart.CTBarChart;
import org.openxmlformats.schemas.drawingml.x2006.chart.CTBarSer;
import org.openxmlformats.schemas.drawingml.x2006.chart.CTCatAx;
import org.openxmlformats.schemas.drawingml.x2006.chart.CTDLbl;
import org.openxmlformats.schemas.drawingml.x2006.chart.CTDLbls;
import org.openxmlformats.schemas.drawingml.x2006.chart.CTDPt;
import org.openxmlformats.schemas.drawingml.x2006.chart.CTDouble;
import org.openxmlformats.schemas.drawingml.x2006.chart.CTManualLayout;
import org.openxmlformats.schemas.drawingml.x2006.chart.CTNumRef;
import org.openxmlformats.schemas.drawingml.x2006.chart.CTPieSer;
import org.openxmlformats.schemas.drawingml.x2006.chart.CTPlotArea;
import org.openxmlformats.schemas.drawingml.x2006.chart.CTSerTx;
import org.openxmlformats.schemas.drawingml.x2006.chart.CTStrRef;
import org.openxmlformats.schemas.drawingml.x2006.chart.CTTitle;
import org.openxmlformats.schemas.drawingml.x2006.chart.CTValAx;
import org.openxmlformats.schemas.drawingml.x2006.chart.STAxPos;
import org.openxmlformats.schemas.drawingml.x2006.chart.STBarDir;
import org.openxmlformats.schemas.drawingml.x2006.chart.STBarGrouping;
import org.openxmlformats.schemas.drawingml.x2006.chart.STGrouping;
import org.openxmlformats.schemas.drawingml.x2006.chart.STLayoutMode;
import org.openxmlformats.schemas.drawingml.x2006.chart.STLayoutTarget;
import org.openxmlformats.schemas.drawingml.x2006.chart.STLblAlgn;
import org.openxmlformats.schemas.drawingml.x2006.chart.STOrientation;
import org.openxmlformats.schemas.drawingml.x2006.chart.STTickMark;
import org.openxmlformats.schemas.drawingml.x2006.main.CTRegularTextRun;
import org.openxmlformats.schemas.drawingml.x2006.main.CTShapeProperties;
import org.openxmlformats.schemas.drawingml.x2006.main.CTTextBody;
import org.openxmlformats.schemas.drawingml.x2006.main.CTTextBodyProperties;
import org.openxmlformats.schemas.drawingml.x2006.main.CTTextCharacterProperties;
import org.openxmlformats.schemas.drawingml.x2006.main.CTTextFont;
import org.openxmlformats.schemas.drawingml.x2006.main.CTTextParagraph;
/**
 * Helper class to make writing excel files a bit less annoying
 * 
 * @author pk
 *
 */
public class ExcelHelper {

	// prc, prcGrayOdd, prcGrayEven, prcNoDecimal, prcPaleGreen,
	// style, yellow, paleGreen, green, redCell, grayEven, grayOdd,
	// verticalString, wrappedText, boldText, leftBorder, paleBlue;
	int thinColumnWidth = 5 * 256, prcColumnWidth = 9 * 256;
	public String chartBaseColour = "2DC3F0";
	public String chartLineColour = "FFFFFF";
	public String chartDP1Colour = "F2902A";
	public String chartDP2Colour = "BA56A0";
	public String chartDP3Colour = "6D4FA0";

	public String oldBlue = "002060";
	public String oldCyan = "0070C0";
	public String oldRed = "D01712";

	String [] palette =
			new String [] {"F2902A", "BA56A0", "6D4FA0", "75BF44", "FFF200",
					"838280", "2A3890", "EB008C", "A5DFF6", "D6A3CA", "A897C8",
					"B6DA9A", "F6B387", "442A79", "006738", "57595B"};
	String [] paletteWithBase =
			new String [] {"2DC3F0", "F2902A", "BA56A0", "6D4FA0", "75BF44",
					"FFF200", "838280", "2A3890", "EB008C", "A5DFF6", "D6A3CA",
					"A897C8", "B6DA9A", "F6B387", "442A79", "006738", "57595B"};

	public ExcelHelper(XSSFWorkbook wb) {
		for (QuickStyle q : QuickStyle.values())
			q.construct(wb);
	}
	public List<XSSFCell> addCell(XSSFRow row, Object... values) {
		List<XSSFCell> cc = new ArrayList<XSSFCell>();
		for (Object o : values) {
			XSSFCell c = row.createCell(row.getPhysicalNumberOfCells());
			c.setCellStyle(row.getRowStyle());
			cc.add(c);
			decideAndSetCell(c, o);
		}
		return cc;
	}
	XSSFCell addFormulaCell(XSSFRow row, String formula) {
		XSSFCell c = row.createCell(row.getPhysicalNumberOfCells());
		c.setCellStyle(row.getRowStyle());
		c.setCellFormula(formula);
		return c;
	}
	XSSFCell decideAndSetCell(XSSFCell c, Object o) {
		if (o instanceof Integer || o.getClass().isAssignableFrom(int.class))
			c.setCellValue((Integer) o);
		else
			if (o instanceof Float
					|| o.getClass().isAssignableFrom(float.class))
			c.setCellValue((Float) o);
		else
				if (o instanceof Double
						|| o.getClass().isAssignableFrom(double.class))
			c.setCellValue((Double) o);
		else
					if (o instanceof Boolean
							|| o.getClass().isAssignableFrom(boolean.class))
			c.setCellValue((Double) o);
		else c.setCellValue(String.valueOf(o));
		return c;
	}
	// void addCell(Row row, double... values) {
	// for (double d : values)
	// row.createCell(row.getPhysicalNumberOfCells()).setCellValue(d);
	// }
	// void addCell(Row row, boolean... values) {
	// for (boolean b : values)
	// row.createCell(row.getPhysicalNumberOfCells()).setCellValue(b);
	// }
	void copyCellToRow(XSSFRow row, XSSFCell cell) {
		int cellType = cell.getCellType();
		switch (cellType) {
			case XSSFCell.CELL_TYPE_NUMERIC :
				addCell(row, cell.getNumericCellValue()).get(0)
						.setCellStyle(cell.getCellStyle());
				break;
			case XSSFCell.CELL_TYPE_BOOLEAN :
				addCell(row, cell.getBooleanCellValue()).get(0)
						.setCellStyle(cell.getCellStyle());
				break;
			case XSSFCell.CELL_TYPE_BLANK :
				addCell(row, "").get(0).setCellStyle(cell.getCellStyle());
				break;
			default :
				addCell(row, cell.getStringCellValue()).get(0)
						.setCellStyle(cell.getCellStyle());;
		}
	}
	List<XSSFCell> addCell(XSSFRow row, String... values) {
		List<XSSFCell> cc = new ArrayList<XSSFCell>(values.length);
		for (String s : values) {
			XSSFCell c = row.createCell(row.getPhysicalNumberOfCells());
			c.setCellStyle(row.getRowStyle());
			c.setCellValue(s);
			cc.add(c);
		}
		return cc;
	}
	public synchronized XSSFRow addRow(XSSFSheet sheet) {
		return sheet.createRow(sheet.getPhysicalNumberOfRows());
	}

	void copyRow(XSSFRow source, XSSFRow dest) {
		dest.setRowStyle(source.getRowStyle());
		// List<String> rc = new ArrayList<String>();
		Iterator<Cell> it = source.cellIterator();
		while (it.hasNext())
			// rc.add(((XSSFCell) it.next()).getRawValue());
			copyCellToRow(dest, (XSSFCell) it.next());
		// addCell(dest, rc.toArray());
		it = null;
	}
	void applyStyleToRow(XSSFCellStyle style, XSSFRow row) {
		row.setRowStyle(style);
		Iterator<Cell> it = row.cellIterator();
		while (it.hasNext())
			it.next().setCellStyle(style);
	}
	void applyStyleToRowCells(XSSFCellStyle style, XSSFRow row) {
		Iterator<Cell> it = row.cellIterator();
		while (it.hasNext())
			it.next().setCellStyle(style);
	}
	public void saveFile(XSSFWorkbook wb, String filename) {

		FileOutputStream fileOut;
		try {
			fileOut = new FileOutputStream(filename);
			wb.write(fileOut);
			fileOut.close();
		} catch (FileNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	public CellRangeAddress newCellRange(int firstRow, int lastRow,
			int firstCol, int lastCol) {
		return new CellRangeAddress(firstRow, lastRow, firstCol, lastCol);
	}
	public CellRangeAddress newCellRange(XSSFCell firstCell,
			XSSFCell lastCell) {
		return new CellRangeAddress(
				firstCell.getRowIndex(), lastCell.getRowIndex(),
				firstCell.getColumnIndex(), lastCell.getColumnIndex());
	}
	public String getColumnAlias(XSSFCell c) {
		return c.getReference().split("[0-9]+")[0];
	}
	public String getAbsoluteCellReference(XSSFCell c, boolean attachSheet) {
		return (attachSheet ? "'" + c.getSheet().getSheetName() + "'!" : "")
				+ "$" + getColumnAlias(c) + "$" + (c.getRowIndex() + 1);
	}
	public String getAbsoluteRangeReference(XSSFCell c1, XSSFCell c2,
			boolean attachSheet) {
		return getAbsoluteCellReference(c1, attachSheet) + ":"
				+ getAbsoluteCellReference(c2, false);
	}
	public void addTitle(XSSFChart chart, CTTextFont font, String title,
			int size) {
		CTTitle t = chart.getCTChart().addNewTitle();
		CTTextBody rich = t.addNewTx().addNewRich();
		rich.addNewBodyPr();
		rich.addNewLstStyle();
		String [] lines = title.trim().split("\\r?\\n");
		for (String line : lines) {
			CTTextParagraph p = rich.addNewP();
			CTTextCharacterProperties cpr = p.addNewPPr().addNewDefRPr();
			cpr.setSz(size * 100);
			cpr.setLatin(font);
			CTRegularTextRun r = p.addNewR();
			cpr = r.addNewRPr();
			cpr.setSz(size * 100);
			cpr.setLatin(font);
			r.setT(line);
		}
		t.addNewLayout();
		t.addNewOverlay().setVal(true);
	}
	public XSSFChart addDoughnutChart(XSSFSheet sheet, int col1, int row1,
			int col2, int row2, String title, CellRangeAddress names,
			CellRangeAddress values, boolean addLegend) {
		XSSFDrawing drawing = sheet.createDrawingPatriarch();
		XSSFClientAnchor anchor =
				// drawing.createAnchor(0, 0, 0, 0, 6, 23, 13, 44);
				drawing.createAnchor(0, 0, 0, 0, col1, row1, col2, row2);

		XSSFChart chart = drawing.createChart(anchor);
		chart.getCTChartSpace().addNewRoundedCorners().setVal(false);
		CTTextFont font = CTTextFont.Factory.newInstance();
		font.setTypeface("Apercu");
		font.setPitchFamily((byte) 50);
		font.setCharset((byte) 0);

		addTitle(chart, font, title, 18);

		if (addLegend) {
			XSSFChartLegend legend = chart.getOrCreateLegend();
			legend.setPosition(LegendPosition.TOP_RIGHT);
		}
		XSSFDoughnutChartData data = new XSSFDoughnutChartData(chart);
		// data.getCTDoughnutChart().getSerArray(0).getDLbls().getDLblList();

		CTSerTx st = CTSerTx.Factory.newInstance();
		st.setV(title);
		ChartTextSource xs = new XSSFChartTextSource(st);
		ChartDataSource<String> ys1 =
				DataSources.fromStringCellRange(sheet, names
		// new CellRangeAddress(1, 1, 0, NUM_OF_COLUMNS - 1)
		);
		ChartDataSource<Number> ys2 =
				DataSources.fromNumericCellRange(sheet, values
		// new CellRangeAddress(2, 2, 0, NUM_OF_COLUMNS - 1)
		);

		data.addSerie(xs, ys1, ys2);
		chart.plot(data);

		XSSFChart xssfChart = (XSSFChart) chart;
		CTPlotArea plotarea = xssfChart.getCTChart().getPlotArea();
		CTManualLayout manualLayout = plotarea.getLayout().addNewManualLayout();
		manualLayout.addNewLayoutTarget().setVal(STLayoutTarget.INNER);
		manualLayout.addNewXMode().setVal(STLayoutMode.EDGE);
		manualLayout.addNewYMode().setVal(STLayoutMode.EDGE);
		manualLayout.addNewX().setVal(0.27);
		manualLayout.addNewY().setVal(0.16);
		manualLayout.addNewW().setVal(0.43);
		manualLayout.addNewH().setVal(0.72);
		return chart;
	}

	public XSSFChart addDoughnutChart(XSSFSheet sheet, Cell c1, Cell c2,
			String title, CellRangeAddress names, CellRangeAddress values,
			boolean addLegend) {
		return addDoughnutChart(sheet, c1.getColumnIndex(), c1.getRowIndex(),
				c2.getColumnIndex(), c2.getRowIndex(), title, names, values,
				addLegend);
	}
	public XSSFChart addDoughnutChart(XSSFSheet sheet, int col1, int row1,
			int col2, int row2, String title, String namesRangeAddress,
			String valuesRangeAddress, boolean addLegend) {
		if (col1 > col2 || row1 > row2)
			throw new RuntimeException("error in chart placement");
		XSSFChart chart =
				addDoughnutChart(sheet, col1, row1, col2, row2, title,
						newCellRange(0, 0, 1, 1), newCellRange(0, 0, 1, 1),
						false);

		CTStrRef ref1 = CTStrRef.Factory.newInstance();
		ref1.setF(namesRangeAddress);
		ref1.addNewStrCache().addNewPtCount().setVal(1);
		chart.getCTChart().getPlotArea().getDoughnutChartArray(0).getSerArray(0)
				.getCat().setStrRef(ref1);
		CTNumRef ref2 = CTNumRef.Factory.newInstance();
		ref2.setF(valuesRangeAddress);
		ref2.addNewNumCache().addNewPtCount().setVal(1);
		chart.getCTChart().getPlotArea().getDoughnutChartArray(0).getSerArray(0)
				.getVal().setNumRef(ref2);
		return chart;
	}
	public void enableChartValues(XSSFChart ch) {
		CTPieSer ser =
				ch.getCTChart().getPlotArea().getDoughnutChartArray(0)
						.getSerArray(0);
		CTDLbls lbls = ser.getDLbls();
		if (null == lbls) lbls = ser.addNewDLbls();
		// else ser.setDLbls(CTDLbls.Factory.newInstance());
		lbls.addNewShowLegendKey().setVal(false);
		lbls.addNewShowVal().setVal(true);
		lbls.addNewShowCatName().setVal(false);
		lbls.addNewShowSerName().setVal(false);
		lbls.addNewShowPercent().setVal(false);
		lbls.addNewShowBubbleSize().setVal(false);
		CTTextBody b = lbls.addNewTxPr();
		b.addNewBodyPr();
		b.addNewLstStyle();
		b.addNewP().addNewPPr().addNewDefRPr().addNewLatin()
				.setTypeface("Apercu");
		b.getPArray(0).addNewEndParaRPr().setLang("en-US");
	}
	public void colourChartValues(XSSFChart ch, String colour) {
		if (null == ch.getCTChart().getPlotArea().getDoughnutChartArray(0)
				.getSerArray(0).getDLbls()) {
			enableChartValues(ch);
		}
		CTDLbls labels =
				ch.getCTChart().getPlotArea().getDoughnutChartArray(0)
						.getSerArray(0).getDLbls();
		CTTextCharacterProperties rpr =
				labels.getTxPr().getPArray(0).getPPr().getDefRPr();
		rpr.setSz(1200);
		rpr.setB(true);
		rpr.setI(false);
		rpr.addNewSolidFill().addNewSrgbClr()
				.setVal(getBytesFromHexString(colour));

	}
	public void enableChartPercentages(XSSFChart ch) {
		CTDLbls lbls =
				ch.getCTChart().getPlotArea().getDoughnutChartArray(0)
						.getSerArray(0).addNewDLbls();
		lbls.addNewShowLegendKey().setVal(false);
		lbls.addNewShowVal().setVal(false);
		lbls.addNewShowCatName().setVal(false);
		lbls.addNewShowSerName().setVal(false);
		lbls.addNewShowPercent().setVal(true);
		lbls.addNewShowBubbleSize().setVal(false);
		CTTextBody b = lbls.addNewTxPr();
		b.addNewBodyPr();
		b.addNewLstStyle();
		b.addNewP().addNewPPr().addNewDefRPr().addNewLatin()
				.setTypeface("Apercu");
		b.getPArray(0).addNewEndParaRPr().setLang("en-US");
	}
	public void enableChartLegend(XSSFChart ch) {
		ch.getCTChart().addNewLegend();
	}
	public void makeDoughnutChartLabelVisible(XSSFChart ch, int idx,
			boolean visible, Float posX, Float posY) {
		if (ch.getCTChart().getPlotArea().getDoughnutChartArray(0)
				.getSerArray(0).getDLbls() == null) {
			CTDLbls lbls =
					ch.getCTChart().getPlotArea().getDoughnutChartArray(0)
							.getSerArray(0).addNewDLbls();
			lbls.addNewShowLegendKey().setVal(false);
			lbls.addNewShowVal().setVal(false);
			lbls.addNewShowCatName().setVal(false);
			lbls.addNewShowSerName().setVal(false);
			lbls.addNewShowPercent().setVal(false);
			lbls.addNewShowBubbleSize().setVal(false);
			CTTextBody b = lbls.addNewTxPr();
			b.addNewBodyPr();
			b.addNewLstStyle();
			b.addNewP().addNewPPr().addNewDefRPr().addNewLatin()
					.setTypeface("Apercu");
			b.getPArray(0).addNewEndParaRPr().setLang("en-US");
		}
		CTDLbl lbl =
				ch.getCTChart().getPlotArea().getDoughnutChartArray(0)
						.getSerArray(0).getDLbls().addNewDLbl();
		lbl.addNewIdx().setVal(0);
		lbl.addNewShowLegendKey().setVal(false);
		lbl.addNewShowVal().setVal(visible);
		lbl.addNewShowCatName().setVal(false);
		lbl.addNewShowSerName().setVal(false);
		lbl.addNewShowPercent().setVal(false);
		lbl.addNewShowBubbleSize().setVal(false);
		if (posX == null || null == posY) return;
		CTManualLayout ml = lbl.addNewLayout().addNewManualLayout();
		// ml.addNewLayoutTarget().setVal(STLayoutTarget.INNER);
		// System.out.println(ch.getCTChart().getPlotArea().getDoughnutChartArray(0)
		// .getSerArray(0).getDLbls().getDLblArray(0).getDLblPos().getVal());
		CTManualLayout cml =
				ch.getCTChart().getPlotArea().getLayout().getManualLayout();
		double x = cml.getX().getVal() + cml.getW().getVal() * 0.5 - 0.04;

		double y = cml.getY().getVal() + cml.getH().getVal() * 0.5 - 0.04;
		// ml.addNewHMode().setVal(STLayoutMode.EDGE);
		// ml.addNewWMode().setVal(STLayoutMode.EDGE);
		ml.addNewXMode().setVal(STLayoutMode.EDGE);
		ml.addNewYMode().setVal(STLayoutMode.EDGE);
		ml.addNewX().setVal(x);
		ml.addNewY().setVal(y);
		// ml.addNewH().setVal(.90);
		// ml.addNewW().setVal(.90);
	}
	public static byte getByteFromHexString(String colour, int RGBindex) {
		return (byte) Integer.parseInt(
				colour.length() == 3
						? colour.substring(RGBindex, RGBindex + 1)
								+ colour.substring(RGBindex, RGBindex)
						: colour.substring(RGBindex * 2, (RGBindex + 1) * 2),
				16);
	}
	public static byte [] getBytesFromHexString(String colour) {
		return new byte [] {getByteFromHexString(colour, 0),
				getByteFromHexString(colour, 1),
				getByteFromHexString(colour, 2)};
	}
	public XSSFChart setDoughnutChartStyle(XSSFChart c, String colourBase,
			String colourLine, boolean shadow, String... colourDPs) {

		byte [] colourBaseBytes = new byte [3];
		byte [] [] colourDPsBytes = new byte [colourDPs.length] [3];
		for (int i = 0; i < 3; i++) {
			colourBaseBytes[i] = getByteFromHexString(colourBase, i);
			for (int j = 0; j < colourDPs.length; j++)
				colourDPsBytes[j][i] = getByteFromHexString(colourDPs[j], i);
		}
		if (null == colourLine || colourLine.isEmpty())
			return setDoughnutChartStyle(c, colourBaseBytes, null, shadow,
					colourDPsBytes);
		byte [] colourBaseLineBytes = new byte [3];
		for (int i = 0; i < 3; i++)
			colourBaseLineBytes[i] = getByteFromHexString(colourLine, i);

		return setDoughnutChartStyle(c, colourBaseBytes, colourBaseLineBytes,
				shadow, colourDPsBytes);
	}
	public XSSFChart setDoughnutChartStyle(XSSFChart c, byte [] colourBase,
			byte [] colourLine, boolean shadow, byte [] [] colourDPs) {
		CTShapeProperties shpp = CTShapeProperties.Factory.newInstance();
		shpp.addNewSolidFill().addNewSrgbClr().setVal(colourBase);
		shpp.addNewEffectLst();
		if (null != colourLine)
			shpp.addNewLn().addNewSolidFill().addNewSrgbClr()
					.setVal(colourLine);
		c.getCTChart().getPlotArea().getDoughnutChartArray(0).getSerArray(0)
				.setSpPr(shpp);
		CTDPt [] ptz = new CTDPt [colourDPs.length];
		for (int i = 0; i < colourDPs.length; i++) {
			ptz[i] = CTDPt.Factory.newInstance();
			ptz[i].addNewIdx().setVal(i + 1);
			ptz[i].addNewBubble3D().setVal(false);
			ptz[i].addNewSpPr().addNewSolidFill().addNewSrgbClr()
					.setVal(colourDPs[i]);
			ptz[i].getSpPr().addNewEffectLst();
			if (null == colourLine) continue;
			ptz[i].getSpPr().addNewLn().addNewSolidFill().addNewSrgbClr()
					.setVal(colourLine);
		}
		c.getCTChart().getPlotArea().getDoughnutChartArray(0).getSerArray(0)
				.setDPtArray(ptz);
		return c;
	}
	public XSSFChart addDoughnutChart(XSSFSheet sheet, Cell c1, Cell c2,
			String title, String namesRangeAddress, String valuesRangeAddress,
			boolean addLegend) {
		return addDoughnutChart(sheet, c1.getColumnIndex(), c1.getRowIndex(),
				c2.getColumnIndex(), c2.getRowIndex(), title, namesRangeAddress,
				valuesRangeAddress, addLegend);
	}
	public XSSFChart addLineChart(XSSFSheet sheet, int col1, int row1, int col2,
			int row2, CellRangeAddress columnRange, CellReference [] rowNames,
			CellRangeAddress [] rowData) {
		XSSFDrawing drawing = sheet.createDrawingPatriarch();
		XSSFClientAnchor anchor =
				drawing.createAnchor(0, 0, 0, 0, col1, row1, col2, row2);
		XSSFChart chart = drawing.createChart(anchor);
		ChartLegend legend = chart.getOrCreateLegend();
		legend.setPosition(LegendPosition.TOP_RIGHT);
		LineChartData data = chart.getChartDataFactory().createLineChartData();
		// Use a category axis for the bottom axis.
		ChartAxis bottomAxis =
				chart.getChartAxisFactory()
						.createCategoryAxis(AxisPosition.BOTTOM);
		ValueAxis leftAxis =
				chart.getChartAxisFactory().createValueAxis(AxisPosition.LEFT);
		leftAxis.setCrosses(AxisCrosses.AUTO_ZERO);
		ChartDataSource<String> xs =
				DataSources.fromStringCellRange(sheet, columnRange);
		for (int i = 0; i < rowData.length; i++) {
			ChartDataSource<Number> ys1 =
					DataSources.fromNumericCellRange(sheet, rowData[i]);
			// ChartDataSource<Number> ys2 =
			// DataSources.fromNumericCellRange(sheet, columnNames);
			data.addSerie(xs, ys1).setTitle(rowNames[i]);
		}
		chart.getCTChartSpace().addNewRoundedCorners().setVal(false);
		// data.addSerie(xs, ys2);
		chart.plot(data, bottomAxis, leftAxis);

		for (int i = 0; i < rowData.length; i++)
			chart.getCTChart().getPlotArea().getLineChartArray(0).getSerArray(i)
					.addNewSmooth().setVal(false);

		return chart;
	}
	public XSSFChart addBarChart(XSSFSheet sheet, int col1, int row1, int col2,
			int row2, String columnRange, String [] rowNames,
			String [] rowData) {
		XSSFDrawing drawing = sheet.createDrawingPatriarch();
		XSSFClientAnchor anchor =
				drawing.createAnchor(0, 0, 0, 0, col1, row1, col2, row2);
		XSSFChart chart = drawing.createChart(anchor);
		ChartLegend legend = chart.getOrCreateLegend();
		legend.setPosition(LegendPosition.TOP_RIGHT);
		CTPlotArea pl = chart.getCTChart().getPlotArea();
		CTBarChart ch = pl.addNewBarChart();
		ch.addNewBarDir().setVal(STBarDir.COL);
		ch.addNewGrouping().setVal(STBarGrouping.STACKED);
		ch.addNewVaryColors().setVal(true);
		ch.addNewOverlap().setVal((byte) 100);
		CTBarSer ser;
		for (int i = 0; i < rowData.length; i++) {
			ser = ch.addNewSer();
			ser.addNewIdx().setVal(i);
			ser.addNewOrder().setVal(i);
			ser.addNewTx().addNewStrRef().setF(rowNames[i]);
			ser.addNewCat().addNewStrRef().setF(columnRange);
			ser.addNewVal().addNewNumRef().setF(rowData[i]);
		}

		chart.getCTChart().addNewAutoTitleDeleted().setVal(true);
		chart.getCTChartSpace().addNewRoundedCorners().setVal(false);
		CTCatAx ca = pl.addNewCatAx();
		CTValAx va = pl.addNewValAx();
		long axB = -(long) (Math.random() * Integer.MAX_VALUE);
		long axL = -(long) (Math.random() * Integer.MAX_VALUE);
		ca.addNewAxId().setVal(axB);
		ca.addNewScaling().addNewOrientation().setVal(STOrientation.MIN_MAX);
		ca.addNewCrossAx().setVal(axL);
		ca.addNewAxPos().setVal(STAxPos.B);
		ca.addNewDelete().setVal(false);
		ca.addNewMinorTickMark().setVal(STTickMark.NONE);
		ca.addNewTxPr().addNewBodyPr();
		ca.getTxPr().addNewLstStyle();
		ca.getTxPr().addNewP().addNewPPr().addNewDefRPr().addNewLatin()
				.setTypeface("Apercu");
		ca.getTxPr().getPArray(0).addNewEndParaRPr().setLang("en-US");

		va.addNewAxId().setVal(axL);
		va.addNewScaling().addNewOrientation().setVal(STOrientation.MIN_MAX);
		va.addNewCrossAx().setVal(axB);
		va.addNewAxPos().setVal(STAxPos.L);
		va.addNewDelete().setVal(false);
		va.addNewMinorTickMark().setVal(STTickMark.NONE);
		va.addNewMajorGridlines();
		va.addNewTxPr().addNewBodyPr();
		va.getTxPr().addNewLstStyle();
		va.getTxPr().addNewP().addNewPPr().addNewDefRPr().addNewLatin()
				.setTypeface("Apercu");
		va.getTxPr().getPArray(0).addNewEndParaRPr().setLang("en-US");

		ch.addNewAxId().setVal(axB);
		ch.addNewAxId().setVal(axL);
		return chart;
	}
	public XSSFChart addAreaChart(XSSFSheet sheet, int col1, int row1, int col2,
			int row2, String columnRange, String [] rowNames,
			String [] rowData) {
		XSSFDrawing drawing = sheet.createDrawingPatriarch();
		XSSFClientAnchor anchor =
				drawing.createAnchor(0, 0, 0, 0, col1, row1, col2, row2);
		XSSFChart chart = drawing.createChart(anchor);
		ChartLegend legend = chart.getOrCreateLegend();
		legend.setPosition(LegendPosition.TOP_RIGHT);
		CTPlotArea pl = chart.getCTChart().getPlotArea();
		CTAreaChart ch = pl.addNewAreaChart();
		ch.addNewGrouping().setVal(STGrouping.STACKED);
		ch.addNewVaryColors().setVal(true);
		CTAreaSer ser;
		for (int i = 0; i < rowData.length; i++) {
			ser = ch.addNewSer();
			ser.addNewIdx().setVal(i);
			ser.addNewOrder().setVal(i);
			ser.addNewTx().addNewStrRef().setF(rowNames[i]);
			ser.addNewCat().addNewStrRef().setF(columnRange);
			ser.addNewVal().addNewNumRef().setF(rowData[i]);
		}

		chart.getCTChart().addNewAutoTitleDeleted().setVal(true);
		chart.getCTChartSpace().addNewRoundedCorners().setVal(false);
		CTCatAx ca = pl.addNewCatAx();
		CTValAx va = pl.addNewValAx();
		long axB = -(long) (Math.random() * Integer.MAX_VALUE);
		long axL = -(long) (Math.random() * Integer.MAX_VALUE);
		ca.addNewAxId().setVal(axB);
		ca.addNewScaling().addNewOrientation().setVal(STOrientation.MIN_MAX);
		ca.addNewCrossAx().setVal(axL);
		ca.addNewAxPos().setVal(STAxPos.B);
		ca.addNewDelete().setVal(false);
		ca.addNewMinorTickMark().setVal(STTickMark.NONE);
		ca.addNewTxPr().addNewBodyPr();
		ca.getTxPr().addNewLstStyle();
		ca.getTxPr().addNewP().addNewPPr().addNewDefRPr().addNewLatin()
				.setTypeface("Apercu");
		ca.getTxPr().getPArray(0).addNewEndParaRPr().setLang("en-US");

		va.addNewAxId().setVal(axL);
		va.addNewScaling().addNewOrientation().setVal(STOrientation.MIN_MAX);
		va.addNewCrossAx().setVal(axB);
		va.addNewAxPos().setVal(STAxPos.L);
		va.addNewDelete().setVal(false);
		va.addNewMinorTickMark().setVal(STTickMark.NONE);
		va.addNewMajorGridlines();
		va.addNewTxPr().addNewBodyPr();
		va.getTxPr().addNewLstStyle();
		va.getTxPr().addNewP().addNewPPr().addNewDefRPr().addNewLatin()
				.setTypeface("Apercu");
		va.getTxPr().getPArray(0).addNewEndParaRPr().setLang("en-US");

		ch.addNewAxId().setVal(axB);
		ch.addNewAxId().setVal(axL);
		chart.getCTChart().getLegend().addNewLayout();
		return chart;
	}
	void setChartValAxis(XSSFChart chart, float max, float unit) {
		chart.getCTChart().getPlotArea().getValAxArray(0).getScaling()
				.addNewMax().setVal(max);
		chart.getCTChart().getPlotArea().getValAxArray(0).addNewMajorUnit()
				.setVal(unit);
	}
	void rotateChartCatAxisLabels(XSSFChart chart, float angle) {
		// while (angle < 0)
		// angle = 360 + angle;
		CTCatAx catax = chart.getCTChart().getPlotArea().getCatAxArray(0);
		CTTextBody tx = catax.getTxPr();
		if (null == tx) tx = catax.addNewTxPr();
		CTTextBodyProperties body = tx.getBodyPr();
		if (null == body) body = tx.addNewBodyPr();
		body.setRot((int) (angle * (-60000)));

		List<CTTextParagraph> pp = tx.getPList();
		CTTextParagraph p = null;
		if (null == pp || pp.size() < 1)
			p = tx.addNewP();
		else p = pp.get(0);
		catax.addNewAuto().setVal(true);
		catax.addNewLblAlgn().setVal(STLblAlgn.CTR);
		catax.addNewLblOffset().setVal(100);
		catax.addNewNoMultiLvlLbl().setVal(false);
	}

	public XSSFChart setBarChartStyle(XSSFChart c, String colourLine,
			boolean shadow, String... colourDPs) {

		byte [] [] colourDPsBytes = new byte [colourDPs.length] [3];
		for (int i = 0; i < 3; i++) {
			for (int j = 0; j < colourDPs.length; j++)
				colourDPsBytes[j][i] = getByteFromHexString(colourDPs[j], i);
		}
		if (null == colourLine || colourLine.isEmpty())
			return setBarChartStyle(c, null, shadow, colourDPsBytes);
		byte [] colourBaseLineBytes = new byte [3];
		for (int i = 0; i < 3; i++)
			colourBaseLineBytes[i] = getByteFromHexString(colourLine, i);
		return setBarChartStyle(c, colourBaseLineBytes, shadow, colourDPsBytes);
	}
	public XSSFChart setBarChartStyle(XSSFChart c, byte [] colourLine,
			boolean shadow, byte [] [] colourDPs) {
		List<CTBarSer> sers =
				c.getCTChart().getPlotArea().getBarChartArray(0).getSerList();
		for (int i = 0; i < sers.size(); i++) {
			if (colourDPs.length <= i) break;
			CTShapeProperties shpp = CTShapeProperties.Factory.newInstance();
			shpp.addNewSolidFill().addNewSrgbClr().setVal(colourDPs[i]);
			shpp.addNewEffectLst();
			if (null != colourLine)
				shpp.addNewLn().addNewSolidFill().addNewSrgbClr()
						.setVal(colourLine);
			sers.get(i).setSpPr(shpp);
		}
		return c;
	}

	public XSSFChart setAreaChartStyle(XSSFChart c, String colourLine,
			boolean shadow, String... colourDPs) {

		byte [] [] colourDPsBytes = new byte [colourDPs.length] [3];
		for (int i = 0; i < 3; i++) {
			for (int j = 0; j < colourDPs.length; j++)
				colourDPsBytes[j][i] = getByteFromHexString(colourDPs[j], i);
		}
		if (null == colourLine || colourLine.isEmpty())
			return setAreaChartStyle(c, null, shadow, colourDPsBytes);
		byte [] colourBaseLineBytes = new byte [3];
		for (int i = 0; i < 3; i++)
			colourBaseLineBytes[i] = getByteFromHexString(colourLine, i);
		return setAreaChartStyle(c, colourBaseLineBytes, shadow,
				colourDPsBytes);
	}
	public XSSFChart setAreaChartStyle(XSSFChart c, byte [] colourLine,
			boolean shadow, byte [] [] colourDPs) {
		List<CTAreaSer> sers =
				c.getCTChart().getPlotArea().getAreaChartArray(0).getSerList();
		for (int i = 0; i < sers.size(); i++) {
			if (colourDPs.length <= i) break;
			CTShapeProperties shpp = CTShapeProperties.Factory.newInstance();
			shpp.addNewSolidFill().addNewSrgbClr().setVal(colourDPs[i]);
			shpp.addNewEffectLst();
			if (null != colourLine)
				shpp.addNewLn().addNewSolidFill().addNewSrgbClr()
						.setVal(colourLine);
			sers.get(i).setSpPr(shpp);
		}
		// CTDPt [] ptz = new CTDPt [colourDPs.length];
		// for (int i = 0; i < colourDPs.length; i++) {
		// ptz[i] = CTDPt.Factory.newInstance();
		// ptz[i].addNewIdx().setVal(i + 1);
		// ptz[i].addNewBubble3D().setVal(false);
		// ptz[i].addNewSpPr().addNewSolidFill().addNewSrgbClr()
		// .setVal(colourDPs[i]);
		// ptz[i].getSpPr().addNewEffectLst();
		// if (null == colourLine) continue;
		// ptz[i].getSpPr().addNewLn().addNewSolidFill().addNewSrgbClr()
		// .setVal(colourLine);
		// }
		// c.getCTChart().getPlotArea().getDoughnutChartArray(0).getSerArray(0)
		// .setDPtArray(ptz);
		return c;
	}
	// public XSSFChart addLineChart(XSSFSheet sheet, int col1, int row1,
	// int col2, int row2, String columnNames, String [] rowTitles,
	// String [] rowData) {
	// XSSFChart chart =
	// addLineChart(sheet, col1, row1, col2, row2,
	// new CellRangeAddress(0, 0, 0, 0), new CellRangeAddress(
	// 0, 0, 0, 0), new CellRangeAddress(0, 0, 0, 0));
	// CTLineSer [] sers = new CTLineSer [rowData.length];
	// for (String data : rowData) {
	// CTStrRef ref1 = CTStrRef.Factory.newInstance();
	// ref1.setF(rowNames);
	// ref1.addNewStrCache().addNewPtCount().setVal(1);
	// chart.getCTChart().getPlotArea().getLineChartArray(0)
	// .getSerArray(0).getCat().setStrRef(ref1);
	// CTNumRef ref2 = CTNumRef.Factory.newInstance();
	// ref2.setF(dataRange);
	// ref2.addNewNumCache().addNewPtCount().setVal(1);
	// chart.getCTChart().getPlotArea().getLineChartArray(0)
	// .getSerArray(0).getVal().setNumRef(ref2);
	// }
	//
	// return chart;
	// }
	public XSSFName createNamedRange(XSSFSheet sheet, XSSFCell startCell,
			XSSFCell endCell, String rangeName) {
		XSSFName namedRange = sheet.getWorkbook().createName();
		namedRange.setNameName(rangeName);
		namedRange.setRefersToFormula("'" + sheet.getSheetName() + "'!"
				+ getAbsoluteCellReference(startCell, false) + ":"
				+ getAbsoluteCellReference(endCell, false));
		return namedRange;
	}

	public void sampleLineChart(XSSFWorkbook wb) {
		XSSFSheet sheet = wb.createSheet("linechart");
		final int NUM_OF_ROWS = 3;
		final int NUM_OF_COLUMNS = 10;
		// Create a row and put some cells in it. Rows are 0 based.
		XSSFRow row;
		Cell cell;
		for (int rowIndex = 0; rowIndex < NUM_OF_ROWS; rowIndex++) {
			row = sheet.createRow((short) rowIndex);
			for (int colIndex = 0; colIndex < NUM_OF_COLUMNS; colIndex++) {
				cell = row.createCell((short) colIndex);
				cell.setCellValue(colIndex * (rowIndex + 1));
			}
		}
		XSSFDrawing drawing = sheet.createDrawingPatriarch();
		XSSFClientAnchor anchor =
				drawing.createAnchor(0, 0, 0, 0, 0, 5, 10, 15);
		Chart chart = drawing.createChart(anchor);
		ChartLegend legend = chart.getOrCreateLegend();
		legend.setPosition(LegendPosition.TOP_RIGHT);
		LineChartData data = chart.getChartDataFactory().createLineChartData();
		// Use a category axis for the bottom axis.
		ChartAxis bottomAxis =
				chart.getChartAxisFactory()
						.createCategoryAxis(AxisPosition.BOTTOM);
		ValueAxis leftAxis =
				chart.getChartAxisFactory().createValueAxis(AxisPosition.LEFT);
		leftAxis.setCrosses(AxisCrosses.AUTO_ZERO);
		ChartDataSource<Number> xs =
				DataSources.fromNumericCellRange(sheet,
						new CellRangeAddress(0, 0, 0, NUM_OF_COLUMNS - 1));
		ChartDataSource<Number> ys1 =
				DataSources.fromNumericCellRange(sheet,
						new CellRangeAddress(1, 1, 0, NUM_OF_COLUMNS - 1));
		ChartDataSource<Number> ys2 =
				DataSources.fromNumericCellRange(sheet,
						new CellRangeAddress(2, 2, 0, NUM_OF_COLUMNS - 1));
		data.addSerie(xs, ys1);
		data.addSerie(xs, ys2);
		chart.plot(data, bottomAxis, leftAxis);
	}
	public static void sampleAreaChart(XSSFWorkbook wb) {
		XSSFSheet sheet = wb.createSheet("linechart");
		final int NUM_OF_ROWS = 3;
		final int NUM_OF_COLUMNS = 10;
		// Create a row and put some cells in it. Rows are 0 based.
		XSSFRow row;
		Cell cell;
		for (int rowIndex = 0; rowIndex < NUM_OF_ROWS; rowIndex++) {
			row = sheet.createRow((short) rowIndex);
			cell = row.createCell(0);
			cell.setCellValue("abcdefghijklmnopqrstuvwxyz".substring(
					(int) (Math.random() * 12),
					(int) (12 + Math.random() * 12)));
			for (int colIndex = 1; colIndex < NUM_OF_COLUMNS + 1; colIndex++) {
				cell = row.createCell((short) colIndex);
				cell.setCellValue(colIndex * (rowIndex + 1));
			}
		}
		XSSFDrawing drawing = sheet.createDrawingPatriarch();
		XSSFClientAnchor anchor =
				drawing.createAnchor(0, 0, 0, 0, 0, 5, 10, 15);
		XSSFChart chart = drawing.createChart(anchor);
		ChartLegend legend = chart.getOrCreateLegend();
		legend.setPosition(LegendPosition.TOP_RIGHT);
		// CTDrawing d = drawing.getCTDrawing();
		CTPlotArea pl = chart.getCTChart().getPlotArea();
		// CTManualLayout ml = pa.addNewLayout().addNewManualLayout();
		// CTLayoutTarget ctl = CTLayoutTarget.Factory.newInstance();
		// ctl.setVal(STLayoutTarget.INNER);
		// ml.setLayoutTarget(ctl);
		// ml.addNewX().setVal(0.04);
		// ml.addNewY().setVal(0.07);
		// ml.addNewW().setVal(0.8);
		// ml.addNewH().setVal(0.7);
		CTAreaChart ch = pl.addNewAreaChart();
		ch.addNewGrouping().setVal(STGrouping.STACKED);
		ch.addNewVaryColors().setVal(true);
		CTAreaSer ser = ch.addNewSer();
		ser.addNewIdx().setVal(0);
		ser.addNewOrder().setVal(0);
		ser.addNewTx().addNewStrRef().setF("linechart!$A$2");
		ser.addNewCat().addNewStrRef().setF("linechart!$B$1:$K$1");
		ser.addNewVal().addNewNumRef().setF("linechart!$B$2:$K$2");

		ser = ch.addNewSer();
		ser.addNewIdx().setVal(1);
		ser.addNewOrder().setVal(1);
		ser.addNewTx().addNewStrRef().setF("linechart!$A$3");
		ser.addNewCat().addNewStrRef().setF("linechart!$B$1:$K$1");
		ser.addNewVal().addNewNumRef().setF("linechart!$B$3:$K$3");

		chart.getCTChart().addNewAutoTitleDeleted().setVal(true);
		chart.getCTChartSpace().addNewRoundedCorners().setVal(false);
		CTCatAx ca = pl.addNewCatAx();
		CTValAx va = pl.addNewValAx();
		long axB = -(long) (Math.random() * Integer.MAX_VALUE);
		long axL = -(long) (Math.random() * Integer.MAX_VALUE);
		ca.addNewAxId().setVal(axB);
		ca.addNewScaling().addNewOrientation().setVal(STOrientation.MIN_MAX);
		ca.addNewCrossAx().setVal(axL);
		ca.addNewAxPos().setVal(STAxPos.B);
		ca.addNewDelete().setVal(false);
		// ca.addNewMajorTickMark().setVal(STTickMark.OUT);
		ca.addNewMinorTickMark().setVal(STTickMark.NONE);

		va.addNewAxId().setVal(axL);
		va.addNewScaling().addNewOrientation().setVal(STOrientation.MIN_MAX);
		va.addNewCrossAx().setVal(axB);
		va.addNewAxPos().setVal(STAxPos.L);
		va.addNewDelete().setVal(false);
		// va.addNewMajorTickMark().setVal(STTickMark.OUT);
		va.addNewMinorTickMark().setVal(STTickMark.NONE);

		ch.addNewAxId().setVal(axB);
		ch.addNewAxId().setVal(axL);
		// pa.addNewCatAx();
		// pa.addNewValAx();
		// LineChartData data =
		// chart.getChartDataFactory().createLineChartData();
		// // Use a category axis for the bottom axis.
		// ChartAxis bottomAxis =
		// chart.getChartAxisFactory().createCategoryAxis(
		// AxisPosition.BOTTOM);
		// ValueAxis leftAxis =
		// chart.getChartAxisFactory().createValueAxis(AxisPosition.LEFT);
		// leftAxis.setCrosses(AxisCrosses.AUTO_ZERO);
		// ChartDataSource<Number> xs =
		// DataSources.fromNumericCellRange(sheet, new CellRangeAddress(0,
		// 0, 0, NUM_OF_COLUMNS - 1));
		// ChartDataSource<Number> ys1 =
		// DataSources.fromNumericCellRange(sheet, new CellRangeAddress(1,
		// 1, 0, NUM_OF_COLUMNS - 1));
		// ChartDataSource<Number> ys2 =
		// DataSources.fromNumericCellRange(sheet, new CellRangeAddress(2,
		// 2, 0, NUM_OF_COLUMNS - 1));
		// data.addSerie(xs, ys1);
		// data.addSerie(xs, ys2);
		// chart.plot(data, bottomAxis, leftAxis);
	}
	// public static void main(String [] args) throws IOException, XmlException
	// {
	// XSSFWorkbook wb = new XSSFWorkbook();
	// XSSFSheet sheet = wb.createSheet("linechart");
	// final int NUM_OF_ROWS = 3;
	// final int NUM_OF_COLUMNS = 10;
	// XSSFRow row;
	// XSSFCell cell;
	// for (int rowIndex = 0; rowIndex < NUM_OF_ROWS; rowIndex++) {
	// row = sheet.createRow((short) rowIndex);
	// cell = row.createCell(0);
	// cell.setCellValue("abcdefghijklmnopqrstuvwxyz".substring(
	// (int) (Math.random() * 12), (int) (12 + Math.random() * 12)));
	// for (int colIndex = 1; colIndex < NUM_OF_COLUMNS + 1; colIndex++) {
	// cell = row.createCell((short) colIndex);
	// cell.setCellValue(colIndex * (rowIndex + 1));
	// }
	// }
	// XSSFChart ch =
	// new ExcelHelper(wb).addAreaChart(sheet, 0, 5, 10, 15,
	// "linechart!$B$1:$K$1", new String [] {"linechart!$A$2",
	// "linechart!$A$3"}, new String [] {
	// "linechart!$B$2:$K$2", "linechart!$B$3:$K$3"});
	// new ExcelHelper(wb).rotateAreaChartCatAxisLabels(ch, - 45f);
	// // sampleAreaChart(wb);
	// FileOutputStream fileOut;
	// try {
	// fileOut = new FileOutputStream("test.xlsx");
	// wb.write(fileOut);
	// fileOut.close();
	// System.out.println("created chart");
	// } catch (FileNotFoundException e) {
	// // TODO Auto-generated catch block
	// e.printStackTrace();
	// } catch (IOException e) {
	// // TODO Auto-generated catch block
	// e.printStackTrace();
	// }
	// }
	void attachComment(XSSFCell c, String commentString) {
		XSSFCreationHelper factory =
				c.getSheet().getWorkbook().getCreationHelper();
		XSSFDrawing drawing = c.getSheet().createDrawingPatriarch();

		XSSFClientAnchor anchor = factory.createClientAnchor();
		anchor.setCol1(c.getColumnIndex());
		anchor.setCol2(c.getColumnIndex() + 5);
		anchor.setRow1(c.getRowIndex());
		anchor.setRow2(c.getRowIndex() + 10);
		Comment comment = drawing.createCellComment(anchor);
		RichTextString str =
				factory.createRichTextString(
						commentString + "\n\n" + "-the machine");
		comment.setString(str);
		comment.setAuthor("The machine");
		c.setCellComment(comment);
	}
	public void setDefaultFont(XSSFWorkbook wb, XSSFFont font) {
		XSSFSheet sheet = wb.createSheet("def");
		XSSFRow r = addRow(sheet);
		addCell(r, "def").get(0).getCellStyle().setFont(font);
		wb.removeSheetAt(wb.getSheetIndex(sheet));
	}
}
