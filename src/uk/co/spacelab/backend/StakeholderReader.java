package uk.co.spacelab.backend;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.sql.SQLException;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.ss.util.CellReference;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFDataValidation;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.ss.util.AreaReference;
import org.json.JSONArray;
import org.json.JSONObject;

public class StakeholderReader {
	Map<String, String> validations = new HashMap<String, String>();
	protected JSONObject initialValidation(String filename, int studyID)
			throws FileNotFoundException, IOException, ClassNotFoundException,
			SQLException, ParseException {

		XSSFWorkbook wb = new XSSFWorkbook(new FileInputStream(filename));
		int ns = wb.getNumberOfSheets();
		XSSFSheet teamSheet = null;
		XSSFSheet questionSheet = null;
		for (int i = 0; i < ns; i++) {
			if (wb.getSheetName(i).equalsIgnoreCase("TEAMS"))
				teamSheet = wb.getSheetAt(i);
			else if (wb.getSheetName(i).equalsIgnoreCase("QUESTIONS"))
				questionSheet = wb.getSheetAt(i);
		}
		if (teamSheet == null)
			throw new MalformedDataException("Teams sheet missing");
		if (questionSheet == null)
			throw new MalformedDataException("Questions sheet missing");
		Map<String, List<String>> depsIn =
				extractCellsFromNames(wb, "DEPARTMENT_LIST", "QUESTION_LIST");
		JSONArray depsDB =
				Database.selectAllFromTableWhere("teams", "study_id = ?",
						String.valueOf(studyID));
		return null;
	}
	protected Map<String, List<String>> extractCellsFromNames(Workbook wb,
			String... findNames) {
		int ns = wb.getNumberOfNames();
		Map<String, List<String>> result = new HashMap<String, List<String>>();
		for (int i = 0; i < ns; i++) {
			System.out.println(wb.getNameAt(i).getNameName() + " "
					+ wb.getNameAt(i).getSheetName() + " "
					+ wb.getNameAt(i).getRefersToFormula());
			for (String name : findNames) {
				if (wb.getNameAt(i).getNameName().equalsIgnoreCase(name)) {
					result.put(name, extractNonEmptyCellsFromName(wb, i));
				}
			}
		}
		return result;
	}
	protected void convert(String filename, int studyID)
			throws ClassNotFoundException, SQLException, IOException {
		Database.getConnection();

		XSSFWorkbook wb = new XSSFWorkbook(new FileInputStream(filename));
		int ns = wb.getNumberOfSheets();
		XSSFSheet teamSheet = null;
		XSSFSheet questionSheet = null;
		for (int i = 0; i < ns; i++) {
			if (wb.getSheetName(i).equalsIgnoreCase("TEAMS"))
				teamSheet = wb.getSheetAt(i);
			else if (wb.getSheetName(i).equalsIgnoreCase("QUESTIONS"))
				questionSheet = wb.getSheetAt(i);
		}
		if (teamSheet == null)
			throw new MalformedDataException("Teams sheet missing");
		if (questionSheet == null)
			throw new MalformedDataException("Questions sheet missing");
		ns = wb.getNumberOfNames();

		Map<String, List<String>> deps =
				extractCellsFromNames(wb, "DEPARTMENT_LIST", "QUESTION_LIST");
		if (!deps.containsKey("DEPARTMENT_LIST"))
			throw new MalformedDataException("Teams named range missing");
		if (!deps.containsKey("QUESTION_LIST"))
			throw new MalformedDataException("Questions named range missing");
		checkValidation((XSSFSheet) teamSheet);
		checkValidation((XSSFSheet) questionSheet);
		ns = wb.getNumberOfSheets();
		for (int i = 0; i < ns; i++) {
			if (wb.getSheetName(i).equalsIgnoreCase("TEAMS")) {
			} else if (wb.getSheetName(i).equalsIgnoreCase("QUESTIONS")) {
			} else {
				XSSFSheet sheet = wb.getSheetAt(i);
				XSSFRow firstRow = sheet.getRow(0);
				if (sheet.getRow(0) == null
						|| sheet.getRow(0).getCell(0) == null
						|| sheet.getRow(0).getCell(0).getCellComment() == null)
					continue;
				String firstCellComment =
						firstRow.getCell(0).getCellComment().getString()
								.getString();
				if (firstCellComment.equals("dept/dept")) {
					// department to department scoring / first row should
					// contain departments
					Map<Integer, String> teamsFound =
							new HashMap<Integer, String>();
					int commentsColumn = -1;
					for (int j = 0; j < firstRow.getPhysicalNumberOfCells(); j++) {
						if (firstRow.getCell(j) == null) continue;
						String cellVal =
								firstRow.getCell(j).getStringCellValue().trim();
						if (deps.get("DEPARTMENT_LIST").contains(cellVal))
							teamsFound.put(j, cellVal);
						else if (cellVal.equalsIgnoreCase("COMMENTS"))
							commentsColumn = j;
					}
					for (int j = 1; j < sheet.getPhysicalNumberOfRows(); j++) {
						Cell c = sheet.getRow(j).getCell(0);
						if (c == null) continue;
						String cellVal = c.getStringCellValue().trim();
						if (cellVal.length() < 1
								|| deps.get("DEPARTMENT_LIST")
										.contains(cellVal)) continue;
						// Database.insertInto(table, columnString, args)
					}
				} else if (firstCellComment.equals("dept/question")) {
					// department answering question
				} else if (firstCellComment.equals("question/choice")) {
					// department scoring question
				}
				// check column 0
				// int foundTeams = 0;
				// for (int j = 0; j < sheet.getPhysicalNumberOfRows(); j++) {
				// sheet.getRow(j).getCell(0);
				// }
			}
		}
	}
	void checkValidation(XSSFSheet sheet) {
		// TODO fix validation / maybe combine with named ranges
		List<XSSFDataValidation> dvs = sheet.getDataValidations();
		for (XSSFDataValidation dv : dvs) {
			CellRangeAddress [] cral = dv.getRegions().getCellRangeAddresses();
			System.out.println(dv.getValidationConstraint());
			System.out.println(dv.getValidationConstraint().getFormula1());
			for (CellRangeAddress cra : cral) {
				// System.out.println(cra.get);
			}
		}
	}
	List<String> removeEmpty(List<String> in) {
		Iterator<String> it = in.iterator();
		while (it.hasNext()) {
			String s = it.next();
			if (s.trim().length() < 1) it.remove();
		}
		return in;
	}
	List<String> extractNonEmptyCellsFromName(Workbook wb, int nameIndex) {
		return removeEmpty(extractCellsFromName(wb, nameIndex));
	}
	List<String> extractCellsFromName(Workbook wb, int nameIndex) {
		List<String> cells = new ArrayList<String>();
		AreaReference area =
				new AreaReference(wb.getNameAt(nameIndex).getRefersToFormula());
		CellReference [] crList = area.getAllReferencedCells();
		for (CellReference cr : crList) {
			Sheet sheet = wb.getSheet(cr.getSheetName());
			int row = cr.getRow();
			int col = cr.getCol();
			Cell c = null;

			if (row == -1) {
				// whole column
				for (int i = 0; i < sheet.getPhysicalNumberOfRows(); i++) {
					c = sheet.getRow(i).getCell(cr.getCol());
					if (c != null) cells.add(c.getStringCellValue().trim());
				}
				continue;
			}
			if (col == -1) {
				// whole row
				Row r = sheet.getRow(cr.getRow());
				for (int i = 0; i < r.getPhysicalNumberOfCells(); i++) {
					c = r.getCell(i);
					if (c != null) cells.add(c.getStringCellValue().trim());
				}
				continue;
			}
			c = sheet.getRow(row).getCell(col);
			if (c != null) cells.add(c.getStringCellValue().trim());
		}
		return cells;
	}
}
