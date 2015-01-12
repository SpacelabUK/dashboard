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
			for (String name : findNames) {
				if (wb.getNameAt(i).getNameName().equalsIgnoreCase(name)) {
					result.put(name, extractNonEmptyCellsFromName(wb, i));
				}
			}
		}
		return result;
	}
	protected Map<String, String> getNamesFormulas(Workbook wb,
			String... findNames) {
		int ns = wb.getNumberOfNames();
		Map<String, String> result = new HashMap<String, String>();
		for (int i = 0; i < ns; i++) {
			for (String name : findNames) {
				System.out.println(wb.getNameAt(i).getNameName() + " "
						+ wb.getNameAt(i).getSheetName() + " "
						+ wb.getNameAt(i).getRefersToFormula());
				if (wb.getNameAt(i).getNameName().equalsIgnoreCase(name)) {
					result.put(name, wb.getNameAt(i).getRefersToFormula());
				}
			}
		}
		return result;
	}
	// protected Map<String, List<String>> getStaticData(String fileName,
	protected JSONObject getStaticData(String fileName, int studyID)
			throws FileNotFoundException, IOException, ClassNotFoundException,
			SQLException, ParseException {
		Database.getConnection();

		XSSFWorkbook wb = new XSSFWorkbook(new FileInputStream(fileName));
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
		String [] requiredNames =
				new String [] {"DEPARTMENT_LIST", "QUESTION_LIST"};
		Map<String, List<String>> staticData =
				extractCellsFromNames(wb, requiredNames);
		for (String name : requiredNames)
			if (!staticData.containsKey(name))
				throw new MalformedDataException(name + " named range missing");
		Map<String, String> nameFormulas = getNamesFormulas(wb, requiredNames);

		JSONArray databaseTeams =
				Database.selectAllFromTableWhere("teams", "study_id=?",
						String.valueOf(studyID));
		JSONArray databaseQuestions =
				Database.customQuery("SELECT interview_questions.id,interview_questions.alias,interview_questions.parent_id,"
						+ "(SELECT alias FROM interview_questions "
						+ "WHERE interview_questions.id=parent_questions.parent_id) AS parent FROM interview_questions JOIN "
						+ "interview_questions AS parent_questions ON interview_questions.id=parent_questions.id;");
		// Database.selectAllFromTable("interview_questions");
		// List<String> databaseTeamsList = new ArrayList<String>();
		// for (int i = 0; i < databaseTeams.length(); i++)
		// databaseTeamsList.add(databaseTeams.getString(i));
		// staticData.put("DATABASE_TEAMS", databaseTeamsList);
		List<XSSFDataValidation> dvs = questionSheet.getDataValidations();
		Map<String, CellRangeAddress []> perNameCellReferences =
				new HashMap<String, CellRangeAddress []>();
		for (XSSFDataValidation dv : dvs) {
			CellRangeAddress [] cral = dv.getRegions().getCellRangeAddresses();
			String formula = dv.getValidationConstraint().getFormula1();
			if (!formula.contains("!"))
				formula = questionSheet.getSheetName() + "!" + formula;
			String formulaKey = null;
			for (String name : nameFormulas.keySet())
				if (formula.equalsIgnoreCase(name)) {
					formulaKey = name;
					break;
				} else if (formula.equalsIgnoreCase(nameFormulas.get(name))) {
					formulaKey = name;
					break;
				}
			if (formulaKey != null)
				perNameCellReferences.put(formulaKey, cral);
		}
		Map<String, Question> idQuestion = new HashMap<String, Question>();
		for (String alias : staticData.get("QUESTION_LIST")) {
			String [] pieces = alias.split("\\(");
			Question question = new Question(alias).title(pieces[0].trim());
			if (pieces.length > 1) { // we have hierarchy
				idQuestion.put(pieces[1].split("\\)")[0], question);
			}
		}
		Map<String, Question> questions = new HashMap<String, Question>();
		for (String key : idQuestion.keySet()) {
			Question question = idQuestion.get(key);
			questions.put(question.alias, question);
			int dotIndex = key.lastIndexOf(".");
			if (-1 == dotIndex) continue;
			String parentID = key.substring(0, dotIndex);
			if (!idQuestion.containsKey(parentID))
				throw new MalformedDataException("Parent " + parentID
						+ " of question " + question.alias + " does not exist");
			question.parent(idQuestion.get(parentID));
		}
		String choiceIdentifier = "CHOICE";
		XSSFRow firstRow = questionSheet.getRow(0);
		for (String key : perNameCellReferences.keySet()) {
			for (CellRangeAddress cra : perNameCellReferences.get(key)) {
				int firstColumnIndex = cra.getFirstColumn();
				int lastColumnIndex = cra.getLastColumn();
				if (lastColumnIndex - firstColumnIndex != 0
						|| !firstRow.getCell(firstColumnIndex)
								.getStringCellValue().trim()
								.equalsIgnoreCase(choiceIdentifier)) continue;
				List<String> questionRefs =
						extractCellsFromRange(questionSheet, cra);
				int choiceColumn = lastColumnIndex + 1;
				List<String> choices = new ArrayList<String>();
				Cell f = null, c = null;
				for (int row = 0; row < questionSheet.getPhysicalNumberOfRows(); row++) {
					Cell d = questionSheet.getRow(row).getCell(choiceColumn);
					if (d == null) continue;
					String cellValue = d.getStringCellValue().trim();
					if (cellValue.length() < 1) continue;
					c = d;
					if (f == null) f = d;
					choices.add(cellValue);
				}
				// System.out.println(questionRefs);
				// System.out.println(choices + " " + f + " " + c);
				if (c != null && f != null)
					for (String questionRef : questionRefs) {
						if (!questions.containsKey(questionRef))
							throw new MalformedDataException(
									"Excel file: Choice Question '"
											+ questionRef
											+ "' not found in list of questions");
						questions.get(questionRef)
								.choices(
										new int [] {f.getRowIndex(),
												c.getRowIndex(),
												f.getColumnIndex(),
												c.getColumnIndex()}, choices);
					}
			}
		}
		// JSONArray databaseQuestions =
		// Database.selectAllFromTable("questions");
		// List<String> databaseQuestionsList = new ArrayList<String>();
		// for (int i = 0; i < databaseQuestions.length(); i++)
		// databaseQuestionsList.add(databaseQuestions.getString(i));
		// staticData.put("DATABASE_QUESTIONS", databaseQuestionsList);
		checkValidation((XSSFSheet) teamSheet);
		checkValidation((XSSFSheet) questionSheet);
		JSONObject out = new JSONObject();
		for (String key : staticData.keySet()) {
			JSONArray arr;
			if (key.equalsIgnoreCase("QUESTION_LIST")) {
				arr = new JSONArray();
				for (String alias : questions.keySet()) {
					Question q = questions.get(alias);
					JSONObject o = new JSONObject();
					String [] theAlias = clearQuestionAlias(alias);
					String clearAlias = theAlias[0];
					String clearID = theAlias[1];

					o.put("alias", clearAlias);
					o.put("id", clearID);
					o.put("title", q.title);
					if (q.parent != null) {
						String [] parentAlias =
								clearQuestionAlias(q.parent.alias);
						o.put("parent", parentAlias[0]);
						o.put("parent_id", parentAlias[1]);
					}
					if (q.choices != null) {
						o.put("choicesReference", new JSONArray(
								q.choicesReference));
						o.put("choices", new JSONArray(q.choices));
					}
					outerloop : for (int i = 0; i < databaseQuestions.length(); i++) {
						JSONObject dbQ = databaseQuestions.getJSONObject(i);
						String dbAlias = dbQ.getString("alias");
						if (clearAlias.equalsIgnoreCase(dbAlias)) {
							int breakcounter = 100;
							Question currentQ = q;
							JSONObject currentDBQ = dbQ;
							while (breakcounter > 1) {
								if (currentQ.parent != null
										&& !currentDBQ.has("parent"))
									break outerloop;
								if (currentQ.parent == null
										&& currentDBQ.has("parent"))
									break outerloop;
								if (currentQ.parent == null
										&& !currentDBQ.has("parent")) break;
								if (!currentDBQ
										.getString("parent")
										.equals(clearQuestionAlias(currentQ.parent.alias)[0]))
									break outerloop;
								currentQ = currentQ.parent;
								currentDBQ =
										findDBQ(databaseQuestions,
												currentDBQ.getInt("parent_id"));
								breakcounter--;
							}
							o.put("prematch", dbAlias);
							break;
						}
					}
					arr.put(o);
				}
			} else {
				arr = new JSONArray();
				for (String alias : staticData.get(key)) {
					JSONObject o = new JSONObject();
					o.put("alias", alias);
					arr.put(o);
				}
			}
			out.put(key, arr);
		}
		out.put("DATABASE_TEAMS", databaseTeams);
		out.put("DATABASE_QUESTIONS", databaseQuestions);

		return out;
	}
	JSONObject findDBQ(JSONArray databaseQuestions, int id) {
		for (int i = 0; i < databaseQuestions.length(); i++)
			if (databaseQuestions.getJSONObject(i).getInt("id") == id)
				return databaseQuestions.getJSONObject(i);
		return null;
	}
	String [] clearQuestionAlias(String questionAlias) {
		String [] result = questionAlias.split("\\(");
		result[1] = result[1].split("\\)")[0].trim();
		result[0] = result[0].trim();
		return result;
	}
	class Question {
		String alias;
		String title;
		Question parent;
		int [] choicesReference;
		List<String> choices;
		Question(String alias) {
			this.alias = alias;
		}
		Question title(String title) {
			this.title = title;
			return this;
		}
		Question parent(Question parent) {
			this.parent = parent;
			return this;
		}
		Question choices(int [] choicesReference, List<String> choices) {
			this.choicesReference = choicesReference;
			this.choices = choices;
			return this;
		}
	}
	protected void convert(String fileName, int studyID,
			Map<String, Map<String, String>> staticData)
			throws ClassNotFoundException, SQLException, IOException {

		XSSFWorkbook wb = new XSSFWorkbook(new FileInputStream(fileName));
		int ns = wb.getNumberOfSheets();
		List<Score> scores = new ArrayList<Score>();
		List<Quote> comments = new ArrayList<Quote>();
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
					String question =
							sheet.getRow(0).getCell(0).getStringCellValue();
					if (!staticData.get("QUESTION_LIST").containsKey(question))
						continue;
					// department to department scoring / first row should
					// contain departments
					Map<Integer, String> teamsHorizontal =
							new HashMap<Integer, String>();
					Map<Integer, String> teamsVertical =
							new HashMap<Integer, String>();
					int commentsColumn = -1;
					for (int j = 0; j < firstRow.getPhysicalNumberOfCells(); j++) {
						if (firstRow.getCell(j) == null) continue;
						String cellVal =
								firstRow.getCell(j).getStringCellValue().trim();
						if (staticData.get("DEPARTMENT_LIST").containsKey(
								cellVal))
							teamsHorizontal.put(j, cellVal);
						else if (cellVal.equalsIgnoreCase("COMMENTS"))
							commentsColumn = j;
					}
					for (int j = 1; j < sheet.getPhysicalNumberOfRows(); j++) {
						Cell c = sheet.getRow(j).getCell(0);
						if (c == null) continue;
						String cellVal = c.getStringCellValue().trim();
						if (cellVal.length() < 1
								|| staticData.get("DEPARTMENT_LIST")
										.containsKey(cellVal)) continue;
						teamsVertical.put(j, cellVal);
						// Database.insertInto(table, columnString, args)
					}
					for (Integer r : teamsVertical.keySet()) {
						String comment =
								sheet.getRow(r).getCell(commentsColumn)
										.getStringCellValue();
						comments.add(new Quote(question, teamsVertical.get(r),
								comment));
						for (Integer c : teamsHorizontal.keySet()) {

							scores.add(new Score(question,
									teamsVertical.get(r), teamsHorizontal
											.get(c), Integer.parseInt(sheet
											.getRow(r).getCell(c)
											.getStringCellValue().trim()), ""));
						}
					}
				} else if (firstCellComment.equals("dept/question")) {
					Map<Integer, String> teamsVertical =
							new HashMap<Integer, String>();
					String currVal = null;
					for (int j = 1; j < sheet.getPhysicalNumberOfRows(); j++) {
						Cell c = sheet.getRow(j).getCell(0);
						if (c == null) continue;
						String cellVal = c.getStringCellValue().trim();
						if (cellVal.length() < 1) {
							if (currVal != null)
								teamsVertical.put(j, currVal);
							else continue;
						}
						if (staticData.get("DEPARTMENT_LIST").containsKey(
								cellVal)) continue;
						teamsVertical.put(j, cellVal);
						currVal = cellVal;
						// Database.insertInto(table, columnString, args)
					}
					for (int j = 0; j < firstRow.getPhysicalNumberOfCells(); j++) {
						if (firstRow.getCell(j) == null) continue;
						String question =
								firstRow.getCell(j).getStringCellValue().trim();
						if (!staticData.get("QUESTION_LIST").containsKey(
								question)) continue;
						for (Integer row : teamsVertical.keySet()) {
							Cell c = sheet.getRow(row).getCell(j);
							if (c == null) continue;
							String cellVal = c.getStringCellValue().trim();
							if (cellVal.length() < 1) continue;
							comments.add(new Quote(question, teamsVertical
									.get(row), cellVal));
						}

						int maxSearchColumns =
								staticData.get("ISSUES_LIST").size() + 2;
						for (int k = 0; k < maxSearchColumns; k++) {
							if (firstRow.getCell(j + 1) == null) break;
							if (firstRow.getCell(j + 1).getStringCellValue()
									.trim().equalsIgnoreCase("ISSUE CATEGORY")) {
								j++;
							} else if (firstRow.getCell(j + 1) != null
									&& firstRow.getCell(j + 1)
											.getStringCellValue().trim()
											.equalsIgnoreCase("FLAG")) {
								j++;
							} else if (firstRow.getCell(j + 1) != null
									&& firstRow.getCell(j + 1)
											.getStringCellValue().trim()
											.equalsIgnoreCase("ISSUE")) {
								j++;
							} else break;
						}
					}
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
	class Quote {
		String question, from, quote;
		boolean flag;
		Quote(String question, String from, String quote) {
			this.question = question;
			this.from = from;
			this.quote = quote;
		}
		Quote flag(boolean flag) {
			this.flag = flag;
			return this;
		}
	}
	class Score {
		String question, from, to, comment;
		float score;
		Score(String question, String from, String to, float score,
				String comment) {
			this.question = question;
			this.from = from;
			this.to = to;
			this.score = score;
			this.comment = comment;
		}
	}
	void checkValidation(XSSFSheet sheet) {
		// TODO fix validation / maybe combine with named ranges
		List<XSSFDataValidation> dvs = sheet.getDataValidations();
		for (XSSFDataValidation dv : dvs) {
			CellRangeAddress [] cral = dv.getRegions().getCellRangeAddresses();
			// System.out.println(dv.getValidationConstraint());
			// System.out.println(dv.getValidationConstraint().getFormula1());
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
	List<String> extractCellsFromRange(Sheet sheet, CellRangeAddress range) {
		List<String> cells = new ArrayList<String>();
		for (int row = range.getFirstRow(); row <= range.getLastRow(); row++) {
			for (int col = range.getFirstColumn(); col <= range.getLastColumn(); col++) {
				Cell c = sheet.getRow(row).getCell(col);
				if (c != null) {
					String cellVal = c.getStringCellValue().trim();
					if (cellVal.length() > 0) cells.add(cellVal);
				}
			}
		}
		return cells;
	}
}
