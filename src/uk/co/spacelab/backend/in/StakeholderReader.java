package uk.co.spacelab.backend.in;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.math.NumberUtils;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.ss.util.CellReference;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFDataValidation;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.ss.util.AreaReference;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import uk.co.spacelab.backend.Database;
import uk.co.spacelab.exception.MalformedDataException;

import static uk.co.spacelab.Constants.DEBUG;

public class StakeholderReader {
	private static final String TABLE_TEAM_TIES = "interview_team_ties",
			TABLE_ISSUES = "interview_issues",
			TABLE_CLIENT_ISSUES = "interview_client_issues",
			TABLE_INTERVIEW_QUOTES = "interview_quotes",
			TABLE_INTERVIEW_QUOTE_ISSUES = "interview_quote_issues",
			TABLE_INTERVIEW_QUESTION_CHOICE_SCORE =
					"interview_team_question_choice_score",
			TABLE_INTERVIEW_QUESTIONS = "interview_questions",
			TABLE_INTERVIEW_POSSIBLE_CHOICES = "interview_possible_choices";
	Map<String, String> validations = new HashMap<String, String>();
	// protected JSONObject initialValidation(String filename, int studyID)
	// throws FileNotFoundException, IOException, ClassNotFoundException,
	// SQLException, ParseException {
	//
	// XSSFWorkbook wb = new XSSFWorkbook(new FileInputStream(filename));
	// int ns = wb.getNumberOfSheets();
	// XSSFSheet teamSheet = null;
	// XSSFSheet questionSheet = null;
	// for (int i = 0; i < ns; i++) {
	// if (wb.getSheetName(i).equalsIgnoreCase("TEAMS"))
	// teamSheet = wb.getSheetAt(i);
	// else if (wb.getSheetName(i).equalsIgnoreCase("QUESTIONS"))
	// questionSheet = wb.getSheetAt(i);
	// }
	// if (teamSheet == null)
	// throw new MalformedDataException("Teams sheet missing");
	// if (questionSheet == null)
	// throw new MalformedDataException("Questions sheet missing");
	// Map<String, List<String>> depsIn =
	// extractCellsFromNames(wb, "DEPARTMENT_LIST", "QUESTION_LIST",
	// "ISSUE_LIST");
	// JSONArray depsDB =
	// Database.selectAllFromTableWhere("teams", "study_id = ?",
	// String.valueOf(studyID));
	// return null;
	// }
	protected Map<String, Collection<String>> extractCellsFromNames(Workbook wb,
			String... findNames) {
		int ns = wb.getNumberOfNames();
		Map<String, Collection<String>> result =
				new HashMap<String, Collection<String>>();
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
				// System.out.println(wb.getNameAt(i).getNameName() + " "
				// + wb.getNameAt(i).getSheetName() + " "
				// + wb.getNameAt(i).getRefersToFormula());
				if (wb.getNameAt(i).getNameName().equalsIgnoreCase(name)) {
					result.put(name, wb.getNameAt(i).getRefersToFormula());
				}
			}
		}
		return result;
	}
	private Map<String, List<String>> getDepartmentStakeholders(
			XSSFSheet peopleSheet) {
		Map<String, List<String>> people = new HashMap<String, List<String>>();
		XSSFRow r = peopleSheet.getRow(0);
		XSSFCell c;
		int nameHeaderIndx = -1;
		int departmentHeaderIndx = -1;
		for (int j = 0; j < r.getPhysicalNumberOfCells(); j++) {
			c = r.getCell(j);
			if (null != c && c.getStringCellValue()
					.equalsIgnoreCase("Name of stakeholder"))
				nameHeaderIndx = j;
			else
				if (null != c
						&& c.getStringCellValue().equalsIgnoreCase("Team"))
					departmentHeaderIndx = j;
		}
		if (nameHeaderIndx == -1 || departmentHeaderIndx == -1) return people;
		String department = null;
		for (int i = 1; i < peopleSheet.getPhysicalNumberOfRows(); i++) {
			r = peopleSheet.getRow(i);
			c = r.getCell(nameHeaderIndx);
			if (null == c || c.getStringCellValue().trim().length() < 1)
				continue;
			String name = c.getStringCellValue();
			c = r.getCell(departmentHeaderIndx);
			if (null != c && c.getStringCellValue().trim().length() > 0)
				department = c.getStringCellValue();
			if (department == null) continue;
			if (!people.containsKey(department))
				people.put(department, new ArrayList<String>());
			people.get(department).add(name);
		}
		return people;
	}
	public JSONObject getStaticData(File file, int studyID)
			throws FileNotFoundException, IOException, ClassNotFoundException,
			SQLException, ParseException {
		// Database.getConnection();

		XSSFWorkbook wb = new XSSFWorkbook(new FileInputStream(file));
		int ns = wb.getNumberOfSheets();
		XSSFSheet teamSheet = null;
		XSSFSheet questionSheet = null;
		XSSFSheet peopleSheet = null;
		for (int i = 0; i < ns; i++) {
			if (wb.getSheetName(i).equalsIgnoreCase("TEAMS"))
				teamSheet = wb.getSheetAt(i);
			else if (wb.getSheetName(i).equalsIgnoreCase("QUESTIONS"))
				questionSheet = wb.getSheetAt(i);
			else
				if (wb.getSheetName(i).equalsIgnoreCase("STAKEHOLDER LIST"))
					peopleSheet = wb.getSheetAt(i);
		}
		if (teamSheet == null)
			throw new MalformedDataException("Teams sheet missing");
		if (questionSheet == null)
			throw new MalformedDataException("Questions sheet missing");
		ns = wb.getNumberOfNames();
		String [] requiredNames =
				new String [] {"DEPARTMENT_LIST", "QUESTION_LIST", "ISSUE_LIST",
						"CLIENT_ISSUE_LIST"};
		Map<String, Collection<String>> staticData =
				extractCellsFromNames(wb, requiredNames);
		for (String name : requiredNames)
			if (!staticData.containsKey(name))
				throw new MalformedDataException(name + " named range missing");
		Map<String, String> nameFormulas = getNamesFormulas(wb, requiredNames);
		Connection psql = Database.getConnection();
		JSONArray databaseTeams =
				Database.selectAllFromTableWhere(psql, "teams", "study_id=?",
						String.valueOf(studyID));
		JSONArray databaseIssues =
				Database.selectAllFromTable(psql, TABLE_ISSUES);
		JSONArray databaseClientIssues =
				Database.selectAllFromTableWhere(psql, TABLE_CLIENT_ISSUES,
						"study_id=?", String.valueOf(studyID));
		JSONArray databaseQuestions =
				Database.customQuery(psql,
						"SELECT interview_questions.id,interview_questions.alias,interview_questions.parent_id,"
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
			if (formulaKey != null) perNameCellReferences.put(formulaKey, cral);
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
				throw new MalformedDataException(
						"Parent " + parentID + " of question " + question.alias
								+ " does not exist");
			question.parent(idQuestion.get(parentID));
		}
		String choiceIdentifier = "CHOICE";
		XSSFRow firstRow = questionSheet.getRow(0);
		for (String key : perNameCellReferences.keySet()) {
			for (CellRangeAddress cra : perNameCellReferences.get(key)) {
				int firstColumnIndex = cra.getFirstColumn();
				int lastColumnIndex = cra.getLastColumn();
				if (lastColumnIndex - firstColumnIndex != 0 || !firstRow
						.getCell(firstColumnIndex).getStringCellValue().trim()
						.equalsIgnoreCase(choiceIdentifier))
					continue;
				List<String> questionRefs =
						extractCellsFromRange(questionSheet, cra);
				int choiceColumn = lastColumnIndex + 1;
				List<String> choices = new ArrayList<String>();
				Cell f = null, c = null;
				for (int row = 0; row < questionSheet
						.getPhysicalNumberOfRows(); row++) {
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
								"Excel file: Choice Question '" + questionRef
										+ "' not found in list of questions");
					questions.get(questionRef).choices(
							new int [] {f.getRowIndex(), c.getRowIndex(),
									f.getColumnIndex(), c.getColumnIndex()},
							choices);
				}
			}
		}

		Map<String, List<String>> depPeople =
				getDepartmentStakeholders(peopleSheet);
		if (depPeople.size() > 0) {
			staticData.put("STAKEHOLDER_LIST", new HashSet<String>());
			for (List<String> dp : depPeople.values())
				staticData.get("STAKEHOLDER_LIST").addAll(dp);
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
			arr = new JSONArray();
			if (key.equalsIgnoreCase("QUESTION_LIST")) {
				for (String alias : questions.keySet()) {
					Question q = questions.get(alias);
					JSONObject o = new JSONObject();
					String [] theAlias = clearQuestionAlias(alias);
					String clearAlias = theAlias[0];
					// String clearID = theAlias[1];

					o.put("alias", alias);
					// o.put("alias", clearAlias);
					// o.put("id", clearID);
					o.put("title", q.title);
					if (q.parent != null) {
						// String [] parentAlias =
						// clearQuestionAlias(q.parent.alias);
						o.put("parent", q.parent.alias);
						// o.put("parent", parentAlias[0]);
						// o.put("parent_id", parentAlias[1]);
					}
					if (q.choices != null) {
						o.put("choicesReference",
								new JSONArray(q.choicesReference));
						o.put("choices", new JSONArray(q.choices));
					}
					outerloop : for (int i = 0; i < databaseQuestions
							.length(); i++) {
						JSONObject dbQ = databaseQuestions.getJSONObject(i);
						String dbAlias = dbQ.getString("alias");
						int dbID = dbQ.getInt("id");
						if (clearAlias.equalsIgnoreCase(dbAlias)) {
							Question currentQ = q;
							JSONObject currentDBQ = dbQ;
							int breakcounter = 100;
							while (breakcounter > 1) {
								for (int j = 0; j < 100 - breakcounter; j++)
									System.out.print(" ");
								if (currentQ.parent != null
										&& !currentDBQ.has("parent"))
									continue outerloop;
								if (currentQ.parent == null
										&& currentDBQ.has("parent"))
									continue outerloop;
								if (currentQ.parent == null
										&& !currentDBQ.has("parent")) {
									if (currentDBQ.getString("alias")
											.equalsIgnoreCase(
													clearQuestionAlias(
															currentQ.alias)[0]))
										break;
								}
								if (!currentDBQ.getString("parent")
										.equalsIgnoreCase(clearQuestionAlias(
												currentQ.parent.alias)[0]))
									continue outerloop;
								currentQ = currentQ.parent;
								currentDBQ =
										findDBQ(databaseQuestions,
												currentDBQ.getInt("parent_id"));
								breakcounter--;
							}
							o.put("prematchproperty", "id");
							o.put("prematch", dbID);
							break;
						}
					}
					arr.put(o);
				}
			} else if (key.equalsIgnoreCase("DEPARTMENT_LIST")) {
				for (String alias : staticData.get(key)) {
					JSONObject o = new JSONObject();
					o.put("alias", alias);
					arr.put(o);
					for (int i = 0; i < databaseTeams.length(); i++) {
						String teamDB =
								databaseTeams.getJSONObject(i)
										.getString("alias");
						if (teamDB.equalsIgnoreCase(alias)) {
							o.put("prematchproperty", "id");
							o.put("prematch", teamDB);

							break;
						}
					}
				}
			} else if (key.equalsIgnoreCase("ISSUE_LIST")) {
				for (String alias : staticData.get(key)) {
					JSONObject o = new JSONObject();
					o.put("alias", alias);
					arr.put(o);
					for (int i = 0; i < databaseIssues.length(); i++) {
						String issueDB =
								databaseIssues.getJSONObject(i)
										.getString("alias");
						if (issueDB.equalsIgnoreCase(alias)) {
							o.put("prematchproperty", "id");
							o.put("prematch", issueDB);

							break;
						}
					}
				}
			} else if (key.equalsIgnoreCase("CLIENT_ISSUE_LIST")) {
				for (String alias : staticData.get(key)) {
					JSONObject o = new JSONObject();
					o.put("alias", alias);
					arr.put(o);
					for (int i = 0; i < databaseClientIssues.length(); i++) {
						String issueDB =
								databaseClientIssues.getJSONObject(i)
										.getString("alias");
						if (issueDB.equalsIgnoreCase(alias)) {
							o.put("prematchproperty", "id");
							o.put("prematch", issueDB);

							break;
						}
					}
				}
			} else {
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
		out.put("DATABASE_ISSUES", databaseIssues);
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
		Integer matchID;
		int [] choicesReference;
		List<String> choices;
		Question(String alias) {
			this.alias = alias;
		}
		Question matchID(int matchID) {
			this.matchID = matchID;
			return this;
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
	int addQuestionToDB(String question, Integer parentID) throws JSONException,
			ClassNotFoundException, SQLException, ParseException {
		int nextval = -1;
		try (Connection psql = Database.getConnection()) {
			psql.setAutoCommit(false);
			nextval =
					Database.getSequenceNextVal(psql,
							"interview_questions_id_seq").getJSONObject(0)
							.getInt("nextval");
			if (parentID != null)
				Database.insertInto(psql, "interview_questions",
						"alias,parent_id", "?,?", question, parentID);
			else
				Database.insertInto(psql, "interview_questions",
						"alias,parent_id", "?,NULL", question);
			psql.commit();
			psql.setAutoCommit(true);
		}
		return nextval;
	}
	void addScoreToDB(Connection psql, int studyID, int questionID,
			int fromTeamID, int toTeamID, float score) throws JSONException,
					ClassNotFoundException, SQLException, ParseException {
		// int nextval =
		// Database.getSequenceNextVal(psql, "interview_questions_id_seq")
		// .getJSONObject(0).getInt("nextval");

		Database.insertInto(psql, TABLE_TEAM_TIES,
				"study_id,question_id,team_from,team_to,score", "?,?,?,?,?",
				studyID, questionID, fromTeamID, toTeamID, score);

		// return voi;
	}
	protected Map<String, Question> processQuestions(JSONArray questionsIn)
			throws ClassNotFoundException, SQLException, ParseException {
		Map<String, Question> questions = new HashMap<String, Question>();
		Map<String, JSONObject> questionsJSON =
				new HashMap<String, JSONObject>();
		// Map<String, String> teams = new HashMap<String, String>();

		for (int i = 0; i < questionsIn.length(); i++) {
			JSONObject q = questionsIn.getJSONObject(i);
			String qAlias = q.getString("alias");
			if (q.optString("match").equals("*")) {
				// question is new
				System.out.println(q.getString("alias") + " is new");
				Question qst = new Question(qAlias);
				if (q.has("choices")) {
					qst.choices = new ArrayList<String>();
					for (int j = 0; j < q.getJSONArray("choices").length(); j++)
						qst.choices.add(q.getJSONArray("choices").getString(j));
				}
				questions.put(qAlias, qst.matchID(-1));

			} else if (q.optString("match").equals("-")) {
				// ignore this question
				System.out.println(qAlias + " to be ingored");
				continue;
			} else if (q.has("match")) {
				JSONObject match = q.getJSONObject("match");
				Question qst = new Question(qAlias);
				if (q.has("choices")) {
					qst.choices = new ArrayList<String>();
					for (int j = 0; j < q.getJSONArray("choices").length(); j++)
						qst.choices.add(q.getJSONArray("choices").getString(j));
				}
				questions.put(qAlias, qst.matchID(match.getInt("id")));
			}
			questionsJSON.put(q.getString("alias"), q);
		}
		for (String q : questions.keySet()) {
			JSONObject qJSON = questionsJSON.get(q);
			if (qJSON.has("parent")
					&& questions.containsKey(qJSON.get("parent")))
				questions.get(q).parent(questions.get(qJSON.get("parent")));
		}
		Connection psql = Database.getConnection();
		psql.setAutoCommit(false);
		for (String question : questions.keySet()) {
			if (questions.get(question).matchID == -1) {
				List<String> validQuestions = new ArrayList<String>();
				String q = question;
				validQuestions.add(q);
				int breakcounter = 100;
				Integer parentID = null;
				while (breakcounter > 1) {
					if (questionsJSON.get(q).has("parent")) {
						q = questionsJSON.get(q).getString("parent");
						if (!questions.containsKey(q))
							throw new MalformedDataException(
									"Parent '" + q + "' missing");
						if (questions.get(q).matchID == -1)
							validQuestions.add(q);
						else {
							parentID = questions.get(q).matchID;
							break;
						}
					} else {
						break;
					}
					breakcounter--;
				}
				if (breakcounter < 1) return null;
				// int
				// System.out.println(validQuestions);
				for (int i = validQuestions.size() - 1; i >= 0; i--) {
					Question qq = questions.get(validQuestions.get(i));
					String clearQ =
							clearQuestionAlias(validQuestions.get(i))[0];
					if (parentID != null)
						Database.insertInto(psql, TABLE_INTERVIEW_QUESTIONS,
								"alias,parent_id", "?,?", clearQ, parentID);
					else
						Database.insertInto(psql, "interview_questions",
								"alias,parent_id", "?,NULL", clearQ);
					int currval =
							Database.getSequenceCurrVal(psql,
									"interview_questions_id_seq")
									.getJSONObject(0).getInt("currval");
					if (qq.choices != null) {
						for (String choice : qq.choices)
							Database.insertInto(psql,
									TABLE_INTERVIEW_POSSIBLE_CHOICES,
									"question_id,choice", "?,?", currval,
									choice);
					}
					parentID = currval;
					questions.put(validQuestions.get(i),
							new Question(validQuestions.get(i))
									.matchID(parentID));
				}
			}

		}
		psql.commit();
		psql.setAutoCommit(true);
		return questions;
	}
	Map<String, Integer> processTeams(JSONArray teamsIn, int studyID)
			throws ClassNotFoundException, SQLException, ParseException {
		Map<String, Integer> teams = new HashMap<String, Integer>();
		Map<String, JSONObject> teamsJSON = new HashMap<String, JSONObject>();
		Map<String, String> teamNames = new HashMap<String, String>();
		for (int i = 0; i < teamsIn.length(); i++) {
			JSONObject q = teamsIn.getJSONObject(i);
			if (q.optString("match").equals("*")) {
				// is new
				System.out.println(q.getString("alias") + " is new");
				teams.put(q.getString("alias").toUpperCase(), -1);

			} else if (q.optString("match").equals("-")) {
				// ignore this
				System.out.println(q.getString("alias") + " to be ingored");
				continue;
			} else if (q.has("match")) {
				JSONObject match = q.getJSONObject("match");
				teams.put(q.getString("alias").toUpperCase(),
						match.getInt("id"));
			}
			teamsJSON.put(q.getString("alias"), q);
			teamNames.put(q.getString("alias").toUpperCase(),
					q.getString("alias"));
		}
		Connection psql = Database.getConnection();
		psql.setAutoCommit(false);
		for (String team : teams.keySet()) {
			if (teams.get(team) == -1) {
				List<String> validTeams = new ArrayList<String>();
				String q = team;
				validTeams.add(q);
				int breakcounter = 100;
				Integer parentID = null;
				while (breakcounter > 1) {
					if (teamsJSON.get(teamNames.get(q)).has("parent")) {
						q = teamsJSON.get(teamNames.get(q)).getString("parent");
						if (!teams.containsKey(q))
							throw new MalformedDataException(
									"Parent '" + q + "' missing");
						if (teams.get(q) == -1)
							validTeams.add(q);
						else {
							parentID = teams.get(q);
							break;
						}
					} else {
						break;
					}
					breakcounter--;
				}
				if (breakcounter < 1) return null;
				// int
				for (int i = validTeams.size() - 1; i >= 0; i--) {
					String clearQ = validTeams.get(i);
					if (parentID != null)
						Database.insertInto(psql, "teams",
								"study_id,alias,parent_id", "?,?,?", studyID,
								clearQ, parentID);
					else
						Database.insertInto(psql, "teams",
								"study_id,alias,parent_id", "?,?,NULL", studyID,
								clearQ);
					int currval =
							Database.getSequenceCurrVal(psql, "teams_id_seq")
									.getJSONObject(0).getInt("currval");
					parentID = currval;
					teams.put(validTeams.get(i), parentID);
				}
			}
		}
		psql.commit();
		psql.setAutoCommit(true);

		return teams;
	}

	Map<String, Integer> processIssues(JSONArray dataIn)
			throws ClassNotFoundException, SQLException, ParseException {
		Map<String, Integer> issues = new HashMap<String, Integer>();
		// List<String> issues = new ArrayList<String>();
		Map<String, JSONObject> issuesJSON = new HashMap<String, JSONObject>();
		for (int i = 0; i < dataIn.length(); i++) {
			JSONObject q = dataIn.getJSONObject(i);
			if (q.optString("match").equals("*")) {
				// is new
				System.out.println(q.getString("alias") + " is new");
				issues.put(q.getString("alias"), -1);

			} else if (q.optString("match").equals("-")) {
				// ignore this
				System.out.println(q.getString("alias") + " to be ingored");
				continue;
			} else if (q.has("match")) {
				JSONObject match = q.getJSONObject("match");
				issues.put(q.getString("alias"), match.getInt("id"));
			}
			issuesJSON.put(q.getString("alias"), q);
		}
		Connection psql = Database.getConnection();
		psql.setAutoCommit(false);
		for (String issue : issues.keySet()) {
			if (issues.get(issue) == -1) {
				List<String> validIssues = new ArrayList<String>();
				String q = issue;
				validIssues.add(q);
				String groupID = null;
				// while (breakcounter > 1) {
				if (issuesJSON.get(q).has("group"))
					groupID = issuesJSON.get(q).getString("group");

				// q = issuesJSON.get(q).getString("group");
				// if (!issues.containsKey(q))
				// throw new MalformedDataException("Group '" + q
				// + "' missing");
				// if (issues.get(q) == -1)
				// validIssues.add(q);
				// else {
				// groupID = issues.get(q);
				// break;
				// }
				// } else {
				// break;
				// }
				// breakcounter--;
				// }
				// if (breakcounter < 1) return null;
				// for (int i = validIssues.size() - 1; i >= 0; i--) {
				// String clearQ = validIssues.get(i);
				if (groupID != null)
					Database.insertInto(psql, TABLE_ISSUES, "alias,issue_group",
							"?,?", issue, groupID);
				else
					Database.insertInto(psql, TABLE_ISSUES, "alias,issue_group",
							"?,NULL", issue);
				int currval =
						Database.getSequenceCurrVal(psql,
								"interview_issues_id_seq").getJSONObject(0)
								.getInt("currval");
				// parentID = currval;
				issues.put(issue, currval);
				// }
			}
		}
		psql.commit();
		psql.setAutoCommit(true);

		return issues;
	}

	public void convert(File file, int studyID, JSONObject staticDataJSON)
			throws ClassNotFoundException, SQLException, IOException,
			ParseException {

		// Map<String, Map<String, String>> staticData =
		// new HashMap<String, Map<String, String>>();
		Map<String, Question> questions =
				processQuestions(staticDataJSON.getJSONArray("questions"));
		Map<String, Integer> teams =
				processTeams(staticDataJSON.getJSONArray("teams"), studyID);

		Connection psql = Database.getConnection();
		psql.setAutoCommit(false);
		Map<String, Integer> issues =
				processIssues(staticDataJSON.getJSONArray("issues"));
		// List<String> issues = new ArrayList<String>();
		// for (int i = 0; i < staticDataJSON.getJSONArray("issues").length();
		// i++) {
		// String alias =
		// staticDataJSON.getJSONArray("issues").getJSONObject(i)
		// .getString("alias");
		// // Database.selectAllFromTableWhere(TABLE_ISSUES, "alias=?", alias);
		// issues.add(alias);
		// }
		Map<String, Integer> clientIssues = new HashMap<String, Integer>();
		// List<String> clientIssues = new ArrayList<String>();
		// for (int i = 0; i < staticDataJSON.getJSONArray("client_issues")
		// .length(); i++)
		// clientIssues.add(staticDataJSON.getJSONArray("client_issues")
		// .getJSONObject(i).getString("alias"));

		psql.commit();
		psql.setAutoCommit(true);
		// if (true) return;
		XSSFWorkbook wb = new XSSFWorkbook(new FileInputStream(file));
		int ns = wb.getNumberOfSheets();
		List<Score> teamTeamScores = new ArrayList<Score>();
		List<Quote> comments = new ArrayList<Quote>();
		Map<String, Map<String, Map<String, Float>>> teamQuestionScores =
				new HashMap<String, Map<String, Map<String, Float>>>();
		for (int i = 0; i < ns; i++) {
			if (wb.getSheetName(i).equalsIgnoreCase("TEAMS")) {
			} else if (wb.getSheetName(i).equalsIgnoreCase("QUESTIONS")) {
			} else if (wb.getSheetName(i).equalsIgnoreCase("ISSUES")) {
			} else {
				XSSFSheet sheet = wb.getSheetAt(i);
				XSSFRow firstRow = sheet.getRow(0);
				// System.out.println("Sheet " + sheet.getSheetName());
				if (sheet.getRow(0) == null
						|| sheet.getRow(0).getCell(0) == null
						|| sheet.getRow(0).getCell(0).getCellComment() == null)
					continue;
				// System.out.println("Comment: "
				// + firstRow.getCell(0).getCellComment().getString());
				String firstCellComment =
						firstRow.getCell(0).getCellComment().getString()
								.getString();
				if (firstCellComment.equals("dept/dept")) {
					String question =
							sheet.getRow(0).getCell(0).getStringCellValue();
					if (!questions.containsKey(question))
						throw new MalformedDataException(
								"Unknown question '" + question + "' in sheet"
										+ sheet.getSheetName());
					// if
					// (!staticData.get("QUESTION_LIST").containsKey(question))
					// continue;
					// department to department scoring / first row should
					// contain departments
					Map<Integer, String> teamsHorizontal =
							new HashMap<Integer, String>();
					Map<Integer, String> teamsVertical =
							new HashMap<Integer, String>();
					int commentsColumn = -1;
					for (int j = 0; j < firstRow
							.getPhysicalNumberOfCells(); j++) {
						if (firstRow.getCell(j) == null) continue;
						String cellVal =
								firstRow.getCell(j).getStringCellValue().trim()
										.toUpperCase();
						if (teams.containsKey(cellVal))
							// if
							// (staticData.get("DEPARTMENT_LIST").containsKey(
							// cellVal))
							teamsHorizontal.put(j, cellVal);
						else
							if (cellVal.equalsIgnoreCase("COMMENTS"))
								commentsColumn = j;
					}
					for (int j = 1; j < sheet.getPhysicalNumberOfRows(); j++) {
						Cell c = sheet.getRow(j).getCell(0);
						if (c == null) continue;
						String cellVal =
								c.getStringCellValue().trim().toUpperCase();
						if (cellVal != null && cellVal.length() < 1
								// || staticData.get("DEPARTMENT_LIST")
								|| !teams.containsKey(cellVal))
							continue;
						teamsVertical.put(j, cellVal);
						// Database.insertInto(table, columnString, args)
					}
					for (Integer r : teamsVertical.keySet()) {
						if (commentsColumn != -1 && sheet.getRow(r)
								.getCell(commentsColumn) != null) {
							String comment =
									sheet.getRow(r).getCell(commentsColumn)
											.getStringCellValue();
							comments.add(new Quote(
									questions.get(question),
									teamsVertical.get(r), comment));
						}
						for (Integer c : teamsHorizontal.keySet()) {
							if (teamsVertical.get(r)
									.equalsIgnoreCase(teamsHorizontal.get(c))) {
								continue;
							}
							if (sheet.getRow(r) == null
									|| sheet.getRow(r).getCell(c) == null)
								continue;
							float score =
									(float) sheet.getRow(r).getCell(c)
											.getNumericCellValue();
							if (score < 0.01) continue;
							teamTeamScores.add(new Score(
									question, teamsVertical.get(r),
									teamsHorizontal.get(c), score, ""));
						}
					}
				} else if (firstCellComment.equals("dept/question")) {
					Map<Integer, String> teamsVertical =
							new HashMap<Integer, String>();
					String currVal = null;
					for (int j = 1; j < sheet.getPhysicalNumberOfRows(); j++) {
						Row rr = sheet.getRow(j);
						if (null == rr) continue;
						Cell c = rr.getCell(0);
						if (c == null) {
							if (currVal != null) teamsVertical.put(j, currVal);
							continue;
						}
						String cellVal = c.getStringCellValue().trim();
						if (cellVal.length() < 1) {
							if (currVal != null) teamsVertical.put(j, currVal);
							continue;
						}
						// System.out.println(j+" " + cellVal+" " +
						// teams.containsKey(cellVal.toUpperCase()));
						if (!teams.containsKey(cellVal.toUpperCase())) continue;
						teamsVertical.put(j, cellVal);
						currVal = cellVal;
					}
					for (int j = 0; j < firstRow
							.getPhysicalNumberOfCells(); j++) {
						int currCell = j;
						if (firstRow.getCell(j) == null) continue;
						String question =
								firstRow.getCell(j).getStringCellValue().trim();
						if (!questions.containsKey(question)) continue;

						List<Integer> issueCols = new ArrayList<Integer>();
						List<Integer> clientIssueCols =
								new ArrayList<Integer>();
						Integer flagColumn = null;
						int maxSearchColumns =
								issues.size() + clientIssues.size() + 1;
						for (int k = 0; k < maxSearchColumns; k++) {
							if (firstRow.getCell(j + 1) == null) break;
							String cellV =
									firstRow.getCell(j + 1).getStringCellValue()
											.trim();
							if (cellV.equalsIgnoreCase("ISSUE CATEGORY")) {
								issueCols.add(j + 1);
								j++;
							} else if (cellV.equalsIgnoreCase("CLIENT ISSUE")) {
								clientIssueCols.add(j + 1);
								j++;
							} else if (cellV.equalsIgnoreCase("FLAG")) {
								flagColumn = j + 1;
								j++;
							} else break;
						}

						for (Integer row : teamsVertical.keySet()) {
							Cell c = sheet.getRow(row).getCell(currCell);
							if (c == null) continue;
							String cellVal = c.getStringCellValue().trim();
							// System.out.println(cellVal);
							if (cellVal.length() < 1) continue;
							Quote qt =
									new Quote(
											questions.get(question),
											teamsVertical.get(row), cellVal);
							comments.add(qt);
							if (sheet.getRow(row).getCell(flagColumn) != null
									&& Math.abs(sheet.getRow(row)
											.getCell(flagColumn)
											.getNumericCellValue() - 1) < 0.001)
								qt.flag = true;
							for (Integer col : issueCols) {
								Cell c1 = sheet.getRow(row).getCell(col);
								if (c1 == null) continue;
								String cellVal1 =
										c1.getStringCellValue().trim();
								// if (cellVal1.length() > 0)
								// System.out.println(cellVal1 + " "
								// + issues.get(cellVal1));
								if (null == cellVal1 || cellVal1.length() < 1
										|| !issues.containsKey(cellVal1))
									continue;
								qt.addIssue(issues.get(cellVal1));
								// if (!issueQuotes.containsKey())
								// issueQuotes.put(cellVal1,
								// new ArrayList<Quote>());
								// issueQuotes.get(cellVal1).add(qt);
							}
							for (Integer col : clientIssueCols) {
								Cell c1 = sheet.getRow(row).getCell(col);
								if (c1 == null) continue;
								String cellVal1 =
										c1.getStringCellValue().trim();
								if (cellVal1.length() < 1
										|| !clientIssues.containsKey(cellVal1))
									continue;
								qt.addClientIssue(clientIssues.get(cellVal1));
								// if (!clientIssueQuotes.containsKey(cellVal1))
								// clientIssueQuotes.put(cellVal1,
								// new ArrayList<Quote>());
								// clientIssueQuotes.get(cellVal1).add(qt);
							}
						}
					}
					// for (String issue : issueQuotes.keySet()) {
					// System.out.println(issue);
					// for (Quote qt : issueQuotes.get(issue)) {
					// System.out.println(qt.quote);
					// }
					// }
					// for (String issue : clientIssueQuotes.keySet()) {
					// System.out.println(issue);
					// for (Quote qt : issueQuotes.get(issue)) {
					// System.out.println(qt.quote);
					// }
					// }
				} else if (firstCellComment.equals("question/choice")) {
					Map<Integer, String> parentQuestionsVertical =
							new HashMap<Integer, String>();
					List<Integer> haveComment = new ArrayList<Integer>();
					Map<Integer, String> teamsVertical =
							new HashMap<Integer, String>();
					String tVal = null;
					String qVal = null;
					for (int j = 1; j < sheet.getPhysicalNumberOfRows(); j++) {
						Row rr = sheet.getRow(j);
						if (null == rr) continue;
						Cell c = rr.getCell(0);

						System.out.println("Row: " + j);

						boolean hasComment =
								(sheet.getRow(j + 1) != null
										&& (sheet.getRow(j + 1)
												.getCell(0) != null)
										&& (sheet.getRow(j + 1).getCell(0)
												.getStringCellValue().trim()
												.equalsIgnoreCase("COMMENTS")));
						if (hasComment) haveComment.add(j);
						if (c == null) {
							if (qVal != null)
								parentQuestionsVertical.put(j, qVal);
							continue;
						}
						String cellVal = c.getStringCellValue().trim();
						if (cellVal.length() < 1) {
							if (qVal != null)
								parentQuestionsVertical.put(j, qVal);
							continue;
						}
						if (!questions.containsKey(cellVal)) continue;
						String nqVal = cellVal;

						c = sheet.getRow(j).getCell(1);
						if (c == null) {
							if (tVal != null) teamsVertical.put(j, tVal);
							continue;
						}
						cellVal = c.getStringCellValue().trim();

						if (cellVal.length() < 1) {
							if (tVal != null) teamsVertical.put(j, tVal);
							continue;
						}
						if (!teams.containsKey(cellVal.toUpperCase())) continue;

						parentQuestionsVertical.put(j, nqVal);
						qVal = nqVal;
						teamsVertical.put(j, cellVal);
						tVal = cellVal;

						System.out.println(cellVal);
						if (hasComment) j++;
					}
					List<String> possibleChoices = new ArrayList<String>();
					for (Question q : questions.values())
						if (q.choices != null)
							possibleChoices.addAll(q.choices);

					for (int col = 0; col < firstRow
							.getPhysicalNumberOfCells(); col++) {
						if (firstRow.getCell(col) == null) continue;
						String choice =
								firstRow.getCell(col).getStringCellValue()
										.trim();
						if (choice.length() < 1) continue;
						if (!possibleChoices.contains(choice)) continue;
						for (Integer row : parentQuestionsVertical.keySet()) {
							String q = parentQuestionsVertical.get(row);
							String currTeam = teamsVertical.get(row);
							if (!questions.containsKey(q)) continue;
							// FIXME fix this below (it was supposed to be
							// checked earlier)
							if (null == currTeam) continue;
							if (!teams.containsKey(currTeam.toUpperCase()))
								continue;
							List<Question> children =
									getChildQuestions(questions.get(q),
											questions);
							Question actualQuestion = null;
							for (Question child : children) {
								if (child.choices.contains(choice))
									actualQuestion = child;
							}
							if (actualQuestion == null) break;
							if (haveComment.contains(row)
									&& sheet.getRow(row + 1) != null
									&& sheet.getRow(row + 1)
											.getCell(col) != null) {
								String cv =
										sheet.getRow(row + 1).getCell(col)
												.getStringCellValue().trim();
								if (cv.length() > 0) {
									Quote qt =
											new Quote(
													actualQuestion, currTeam,
													cv);
									comments.add(qt);
									// System.out.println(qt);
								}
							}
							float score = 0;
							if (sheet.getRow(row).getCell(col) != null) {
								try {
									score =
											(float) sheet.getRow(row)
													.getCell(col)
													.getNumericCellValue();
								} catch (java.lang.IllegalStateException e) {
									String cellVal =
											sheet.getRow(row).getCell(col)
													.getStringCellValue();
									if (NumberUtils.isNumber(cellVal))
										score = Float.parseFloat(cellVal);
								}
							}
							if (score < 0.001) continue;
							if (!teamQuestionScores.containsKey(currTeam))
								teamQuestionScores.put(currTeam,
										new HashMap<String, Map<String, Float>>());
							if (!teamQuestionScores.get(currTeam)
									.containsKey(actualQuestion.alias))
								teamQuestionScores.get(currTeam).put(
										actualQuestion.alias,
										new HashMap<String, Float>());
							teamQuestionScores.get(currTeam)
									.get(actualQuestion.alias)
									.put(choice, score);

						}
					}
					// TODO: implement database transfer
					if (DEBUG) {
						System.out.println("Team / Question / Score ");
						for (String k : teamQuestionScores.keySet()) {
							System.out.println(k);
							for (String n : teamQuestionScores.get(k).keySet())
								System.out.println(" " + n + " "
										+ teamQuestionScores.get(k).get(n));

						}
					}
				}
			}
		}
		psql = Database.getConnection();
		psql.setAutoCommit(false);
		Database.deleteFrom(psql, TABLE_TEAM_TIES, "study_id=?", studyID);
		for (Score s : teamTeamScores) {
			addScoreToDB(psql, studyID, questions.get(s.question).matchID,
					teams.get(s.from), teams.get(s.to), s.score);
		}
		Database.customQueryNoResult(psql,
				"DELETE FROM " + TABLE_INTERVIEW_QUOTE_ISSUES
						+ " WHERE quote_id IN (SELECT id FROM "
						+ TABLE_INTERVIEW_QUOTES + " WHERE study_id=?)",
				studyID);
		Database.deleteFrom(psql, TABLE_INTERVIEW_QUOTES, "study_id=?",
				studyID);
		for (Quote q : comments) {
			Database.insertInto(psql, TABLE_INTERVIEW_QUOTES,
					"study_id,question_id,quote,flag", "?,?,?,?", studyID,
					q.question.matchID, q.quote, q.flag ? 1 : 0);
			int currval =
					Database.getSequenceCurrVal(psql, "interview_quotes_id_seq")
							.getJSONObject(0).getInt("currval");
			if (q.issues != null) for (Integer issue : q.issues) {
				// System.out.println(issue);
				Database.insertInto(psql, TABLE_INTERVIEW_QUOTE_ISSUES,
						"quote_id,issue_id", "?,?", currval, issue);
			}
		}
		Database.deleteFrom(psql, TABLE_INTERVIEW_QUESTION_CHOICE_SCORE,
				"study_id=?", studyID);
		for (String team : teamQuestionScores.keySet()) {
			Integer teamID = teams.get(team.toUpperCase());
			System.out.println(team + " " + teamID);
			for (String questionAlias : teamQuestionScores.get(team).keySet()) {
				Question question = questions.get(questionAlias);
				// System.out.println(questionAlias);
				Map<String, Float> scores =
						teamQuestionScores.get(team).get(questionAlias);
				for (String choice : scores.keySet()) {
					// System.out.println(choice);
					if (!question.choices.contains(choice)) continue;
					Float score = scores.get(choice);

					Database.insertInto(psql,
							TABLE_INTERVIEW_QUESTION_CHOICE_SCORE,
							"study_id,question_id,team_id,choice,score",
							"?,?,?,?,?", studyID, question.matchID, teamID,
							choice, score);
				}
			}

		}
		System.out.println("Comitting...");
		psql.commit();
		System.out.println("Done!");
		psql.setAutoCommit(true);
	}
	List<Question> getChildQuestions(Question parent,
			Map<String, Question> questions) {
		List<Question> children = new ArrayList<Question>();
		for (Question q : questions.values())
			if (q.parent == parent) children.add(q);
		return children;
	}
	class Quote {
		String from, quote;
		Question question;
		boolean flag;
		private List<Integer> issues;
		private List<Integer> clientIssues;
		Quote(Question question, String from, String quote) {
			this.question = question;
			this.from = from;
			this.quote = quote;
		}
		Quote flag(boolean flag) {
			this.flag = flag;
			return this;
		}
		public String toString() {
			return "?: " + question.alias + ", T: " + from + " !:" + quote;
		}
		private void addIssue(Integer issue) {
			if (issues == null) issues = new ArrayList<Integer>();
			issues.add(issue);
		}
		private void addClientIssue(Integer issue) {
			if (clientIssues == null) clientIssues = new ArrayList<Integer>();
			clientIssues.add(issue);
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
					Row rr = sheet.getRow(i);
					if (rr == null) continue;
					c = rr.getCell(cr.getCol());
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
			for (int col = range.getFirstColumn(); col <= range
					.getLastColumn(); col++) {
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
