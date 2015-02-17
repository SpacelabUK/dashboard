package uk.co.spacelab.backend;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.json.JSONArray;
import org.json.JSONObject;

import uk.co.spacelab.fileio.FileIO;

public class StaffSurveyReader {
	private enum QuestionType {
		TEXT, SCORE, CHOICE, ATTRIBUTE;
	}

	private static String IN_COL_ID = "id", IN_COL_NAME = "name",
			IN_COL_EMAIL = "email", IN_COL_COMPLETED = "completed";
	// IN_COL_COMPLETED_COMPLETE = "Complete",
	// IN_COL_COMPLETED_NOT_STARTED = "NotStarted",
	// IN_COL_COMPLETED_INCOMPLETE = "Incomplete",
	// IN_COL_COMPLETED_BOUNCES = "Bounced",
	private static final String //
			TABLE_QUESTIONS = "survey_questions",
			QUESTION_ID = "id",
			QUESTION_ALIAS = "alias",
			QUESTION_TEXT = "question",
			QUESTION_BODY = "explaination",
			QUESTION_COMMENT = "comment",
			QUESTION_PARENT_ID = "parent_question_id",
			QUESTION_TYPE_ID = "type_id", //
			CREATE_TABLE_QUESTIONS = "create table " + TABLE_QUESTIONS //
					+ "(" //
					+ QUESTION_ID + " integer primary key not null, "//
					+ QUESTION_ALIAS + " text not null, " //
					+ QUESTION_TEXT + " text, " //
					+ QUESTION_BODY + " text, " //
					+ QUESTION_COMMENT + " text, "//
					+ QUESTION_PARENT_ID + " integer, " //
					+ QUESTION_TYPE_ID + " integer not null " //
					+ ");",

			TABLE_CHOICES = "survey_choices",
			CHOICE_QUESTION_ID = "question_id", //
			CHOICE_ID = "id",
			CREATE_TABLE_CHOICES = "create table " + TABLE_CHOICES //
					+ "(" //
					+ CHOICE_QUESTION_ID + " integer not null, "//
					+ CHOICE_ID + " text not null " //
					+ ");",

			TABLE_QUOTES = "survey_quotes", //
			QUOTE_ID = "id",
			QUOTE_QUESTION_ID = "question_id",
			QUOTE_TEXT = "quote", //
			QUOTE_PERSON_ID = "person_id", //
			QUOTE_STUDY_ID = "study_id", //
			CREATE_TABLE_QUOTES = "create table " + TABLE_QUOTES //
					+ "(" //
					+ QUOTE_ID + " integer primary key not null, "//
					+ QUOTE_QUESTION_ID + " integer not null, " //
					+ QUOTE_TEXT + " text, "//
					+ QUOTE_PERSON_ID + " integer " //
					+ ");",

			TABLE_ATTRIBUTES = "staff_attributes", //
			ATTRIBUTE_ID = "attribute_id",
			ATTRIBUTE_QUESTION_ID = "question_id",
			ATTRIBUTE_TEXT = "attribute", //
			ATTRIBUTE_PERSON_ID = "person_id", //
			CREATE_TABLE_ATTRIBUTES = "create table " + TABLE_ATTRIBUTES //
					+ "(" //
					+ ATTRIBUTE_ID + " integer primary key not null, "//
					+ ATTRIBUTE_QUESTION_ID + " integer not null, " //
					+ ATTRIBUTE_TEXT + " text, "//
					+ ATTRIBUTE_PERSON_ID + " integer " //
					+ ");",

			TABLE_SCORES = "survey_scores",
			SCORE_QUESTION_ID = "question_id",
			SCORE_PERSON_ID = "person_id",
			SCORE_CHOICE_ID = "choice_id",
			SCORE_MARK = "mark", //
			SCORE_STUDY_ID = "study_id", //
			CREATE_TABLE_SCORES = "create table " + TABLE_SCORES //
					+ "(" //
					+ SCORE_QUESTION_ID + " integer not null, " //
					+ SCORE_PERSON_ID + " text, " //
					+ SCORE_CHOICE_ID + " integer, " //
					+ SCORE_MARK + " real " //
					+ ");", //
			TABLE_STAFF = "staff",
			STAFF_ID = "id",
			STAFF_SURVEY_ID = "survey_id",
			STAFF_ID_ON_SURVEY = "id_on_survey",
			STAFF_COMPLETED = "survey_completed", //
			CREATE_TABLE_STAFF = "create table " + TABLE_STAFF //
					+ "(" //
					+ STAFF_ID_ON_SURVEY + " integer not null, " //
					+ STAFF_COMPLETED + " text not null " //
					+ ");", //
			TABLE_TIE_TYPES = "survey_tie_types", //
			TIE_TYPE_TYPE_ID = "id", //
			TIE_TYPE_NAME = "name", //
			CREATE_TABLE_TIE_TYPES = "create table " + TABLE_TIE_TYPES //
					+ "(" //
					+ TIE_TYPE_TYPE_ID + " integer not null, " //
					+ TIE_TYPE_NAME + " text not null " //
					+ ");", //
			TABLE_TIES = "staff_ties", //
			TIE_FROM = "from", //
			TIE_TO = "to", //
			TIE_TYPE_ID = "type_id", //
			TIE_WEIGHT = "weight", //
			CREATE_TABLE_TIES = "create table " + TABLE_TIES //
					+ "(" //
					+ TIE_FROM + " integer not null, " //
					+ TIE_TO + " integer not null, " //
					+ TIE_TYPE_ID + " integer not null, " //
					+ TIE_WEIGHT + " integer not null " //
					+ ");";

	public void convert(String inFile, Integer studyid)
			throws ClassNotFoundException, SQLException, ParseException {
		Logger.getLogger("com.almworks.sqlite4java").setLevel(Level.OFF);
		Map<Integer, List<String>> answerStrings =
				new HashMap<Integer, List<String>>();
		Map<Integer, Person> people;
		List<Tie> ties = new ArrayList<Tie>();
		List<String> tiesIn = new ArrayList<String>();
		String tieHeader = null;
		List<String> nodes = new ArrayList<String>();
		String nodeHeader = null;
		List<String> currentList = null;
		BufferedReader reader = null;
		try {
			File file = new File(inFile);
			// file.deleteOnExit();
			reader = new BufferedReader(new FileReader(file));

			String line;
			while ((line = reader.readLine()) != null) {
				if (line.equalsIgnoreCase("*node data")) {
					currentList = nodes;
					nodeHeader = reader.readLine();
				} else if (line.equalsIgnoreCase("*tie data")) {
					currentList = tiesIn;
					tieHeader = reader.readLine();
				} else if (currentList != null) {
					currentList.add(line);
				}
			}

		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			try {
				reader.close();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		String [] head = nodeHeader.split(" ");

		for (int i = 0; i < head.length; i++) {
			List<String> in = new ArrayList<String>();
			in.add(head[i]);
			answerStrings.put(i, in);
		}
		for (String line : nodes) {
			// System.out.println(line);
			String [] node =
					(line.substring(1, line.length() - 1) + " ").split("\" \"");
			if (node.length != head.length)
				throw new RuntimeException(
						"Error parsing! Check for double quotes(\") in the answers and convert them to single(') ones. Error on line: "
								+ line.substring(1, line.length() - 1)
								+ " ("
								+ node[node.length - 1] + ")");
			for (int i = 0; i < node.length; i++)
				answerStrings.get(i).add(node[i]);
		}

		String [] tieHead = tieHeader.split(" ");
		List<String> tieTypes = new ArrayList<String>();
		Map<Integer, String> tieProps = new HashMap<Integer, String>();
		for (int i = 0; i < tieHead.length; i++) {
			if (!tieHead[i].trim().equalsIgnoreCase("from")
					&& !tieHead[i].trim().equalsIgnoreCase("to")
					&& !tieHead[i].trim().equalsIgnoreCase("ownernode"))
				tieTypes.add(tieHead[i]);
			tieProps.put(i, tieHead[i]);
			// else
		}
		for (String line : tiesIn) {
			// System.out.println(line);
			String [] tie = line.substring(1, line.length() - 1).split("\" \"");
			int from = -1, to = -1;
			for (int i = 0; i < tie.length; i++) {
				String tieProp = tieProps.get(i);
				if (tieHead[i].trim().equalsIgnoreCase("from"))
					from = Integer.parseInt(tie[i]);
				else if (tieHead[i].trim().equalsIgnoreCase("to"))
					to = Integer.parseInt(tie[i]);
			}
			for (int i = 0; i < tie.length; i++) {
				if (!tieHead[i].trim().equals("from")
						&& !tieHead[i].trim().equalsIgnoreCase("to")
						&& !tieHead[i].trim().equalsIgnoreCase("ownernode")) {
					Tie t = new Tie();
					t.from = from;
					t.to = to;
					t.typeID = tieTypes.indexOf(tieProps.get(i));
					t.weight = Integer.parseInt(tie[i]);
					ties.add(t);
				}

			}
		}
		for (Tie tie : ties)
			System.out.println(tie.from + " " + tie.to + " " + tie.typeID + " "
					+ tie.weight);
		// System.out.println(answerStrings);
		// if (true) return;

		Map<String, List<String>> answers = new HashMap<String, List<String>>();
		for (Integer i : answerStrings.keySet()) {
			String name = answerStrings.get(i).get(0);
			answerStrings.get(i).remove(0);
			answers.put(name, answerStrings.get(i));
			if (name.equalsIgnoreCase(IN_COL_ID)) IN_COL_ID = name;
			if (name.equalsIgnoreCase(IN_COL_NAME)) IN_COL_NAME = name;
			if (name.equalsIgnoreCase(IN_COL_EMAIL)) IN_COL_EMAIL = name;
			if (name.equalsIgnoreCase(IN_COL_COMPLETED))
				IN_COL_COMPLETED = name;
		}

		answerStrings = null;

		people = new HashMap<Integer, Person>(answers.get(IN_COL_ID).size());
		for (int i = 0; i < answers.get(IN_COL_ID).size(); i++) {
			try {
				int id = Integer.parseInt(answers.get(IN_COL_ID).get(i));
				String name = answers.get(IN_COL_NAME).get(i);
				String email = answers.get(IN_COL_EMAIL).get(i);
				String completed = answers.get(IN_COL_COMPLETED).get(i);
				Person p = new Person(id, name, email);
				for (String q : answers.keySet()) {
					if (q.equals(IN_COL_COMPLETED))
						p.setCompleted(completed);
					else if (!q.equals(IN_COL_NAME) && !q.equals(IN_COL_NAME))
						p.setAnswer(q, answers.get(q).get(i));
				}
				people.put(id, p);
			} catch (NumberFormatException e) {
				e.printStackTrace();
			}
		}
		System.out.println("people: " + answers.get(IN_COL_ID).size());
		answers.remove(IN_COL_ID);
		answers.remove(IN_COL_NAME);
		answers.remove(IN_COL_EMAIL);
		answers.remove(IN_COL_COMPLETED);
		Map<String, List<String>> choices = new HashMap<String, List<String>>();
		Map<String, QuestionType> simpleQuestions =
				new HashMap<String, QuestionType>();
		for (String s : answers.keySet()) {
			String [] complex = s.split("-");
			if (complex.length > 1) {
				// we have a complex question where the first part is the code
				// of the question and the second part is the code of one of the
				// things the user has to score
				if (!choices.containsKey(complex[0]))
					choices.put(complex[0], new ArrayList<String>());
				choices.get(complex[0]).add(complex[1]);
			} else {
				// we have a simple "rate something" question
				simpleQuestions.put(s, areAnswersNumbers(answers.get(s))
						? QuestionType.SCORE
						: QuestionType.TEXT);
			}
		}
		for (String question : simpleQuestions.keySet()) {
			System.out.println(question);
		}
		for (String question : choices.keySet()) {
			System.out.println("Choices for question: ");
			System.out.print(question);
			System.out.println(choices.get(question));
		}
		// File dbFile;
		// dbFile = new File("res/data/staffsurvey.db");
		// try {
		// dbFile.createNewFile();
		// } catch (IOException e1) {
		// System.err.println("Could not create File");
		// e1.printStackTrace();
		// }
		// SQLiteConnection db = new SQLiteConnection(dbFile);
		// SQLiteStatement st = null;
		// int [] ids,states,statix,timestamps;
		// float [] xposs,yposs;
		System.out.println("----------- Populating database");
		// int round = 4;
		// try {
		Connection psql = Database.getConnection();
		psql.setAutoCommit(false);
		// db.open(true);
		// db.exec(CREATE_TABLE_ATTRIBUTES);
		// db.exec(CREATE_TABLE_QUESTIONS);
		// db.exec(CREATE_TABLE_CHOICES);
		// db.exec(CREATE_TABLE_QUOTES);
		// db.exec(CREATE_TABLE_SCORES);
		// db.exec(CREATE_TABLE_STAFF);

		String columnString = QUESTION_ALIAS + "," + QUESTION_TYPE_ID;
		String valueString = "?,?";

		String statement = "";
		Map<String, Integer> questionMap = new HashMap<String, Integer>();
		for (String q : simpleQuestions.keySet()) {
			QuestionType qType = simpleQuestions.get(q);

			JSONArray r =
					Database.selectWhatFromTableWhere(psql, TABLE_QUESTIONS,
							QUESTION_ID, "alias=?", q);
			if (r.length() == 0) {
				Object [] args = new Object [] {q, qType.toString()};
				Database.insertInto(psql, TABLE_QUESTIONS, columnString,
						valueString, args);
				questionMap.put(
						q,
						Database.getSequenceCurrVal(psql,
								"survey_questions_id_seq").getJSONObject(0)
								.getInt("currval"));
			} else questionMap.put(q, r.getJSONObject(0).getInt("id"));

		}

		for (String q : choices.keySet()) {
			JSONArray r =
					Database.selectWhatFromTableWhere(psql, TABLE_QUESTIONS,
							QUESTION_ID, "alias=?", q);
			if (r.length() == 0) {
				Object [] args =
						new Object [] {q, QuestionType.CHOICE.toString()};
				Database.insertInto(psql, TABLE_QUESTIONS, columnString,
						valueString, args);
				questionMap.put(
						q,
						Database.getSequenceCurrVal(psql,
								"survey_questions_id_seq").getJSONObject(0)
								.getInt("currval"));
			} else questionMap.put(q, r.getJSONObject(0).getInt("id"));

		}

		Database.deleteFrom(psql, TABLE_QUOTES, QUOTE_STUDY_ID + "=?", studyid);
		Database.deleteFrom(psql, TABLE_SCORES, SCORE_STUDY_ID + "=?", studyid);
		Database.deleteFrom(psql, TABLE_STAFF, STAFF_SURVEY_ID + "=?", studyid);
		columnString =
				STAFF_ID_ON_SURVEY + "," + STAFF_COMPLETED + ","
						+ STAFF_SURVEY_ID;
		valueString = "?,?,?";
		Map<Person, Integer> peopleMap = new HashMap<Person, Integer>();
		for (Integer i : people.keySet()) {

			JSONArray r =
					Database.selectWhatFromTableWhere(psql, TABLE_STAFF,
							STAFF_ID, STAFF_ID_ON_SURVEY + "=? AND "
									+ STAFF_SURVEY_ID + "=?", people.get(i).ID,
							studyid);
			if (r.length() < 1) {
				Object [] args =
						new Object [] {people.get(i).ID,
								people.get(i).completed, studyid};
				Database.insertInto(psql, TABLE_STAFF, columnString,
						valueString, args);
				peopleMap.put(people.get(i),
						Database.getSequenceCurrVal(psql, "staff_id_seq")
								.getJSONObject(0).getInt("currval"));
			} else {
				peopleMap.put(people.get(i), r.getJSONObject(0).getInt("id"));
			}
		}
		people = null;
		for (String questionAlias : questionMap.keySet()) {
			int questionID = questionMap.get(questionAlias);
			List<String> ch = choices.get(questionAlias);

			// System.out.println(ch);
			if (ch == null) {
				for (Person p : peopleMap.keySet())
					// if (simpleQuestions.containsKey(questionAlias))
					switch (simpleQuestions.get(questionAlias)) {
						case TEXT :
							String quote =
									cleanString(p.answers.get(questionAlias));
							if (quote.trim().length() != 0) {

								columnString =
										QUOTE_QUESTION_ID + "," + QUOTE_TEXT
												+ "," + QUOTE_PERSON_ID
												+ ",study_id";
								valueString = "?,?,?,?";
								Database.insertInto(psql, TABLE_QUOTES,
										columnString, valueString,
										String.valueOf(questionID), quote,
										String.valueOf(peopleMap.get(p)),
										String.valueOf(studyid));
							}
							break;
						case SCORE :
							String score = p.answers.get(questionAlias);
							if (score.trim().length() > 0) {

								// if (Database.selectWhatFromTableWhere(
								// psql,
								// TABLE_SCORES,
								// "*",
								// SCORE_STUDY_ID + "=? AND "
								// + SCORE_QUESTION_ID + "=? AND "
								// + SCORE_PERSON_ID + "=?",
								// new Object [] {studyid, questionID,
								// peopleMap.get(p)}).length() < 1) {
								columnString =
										SCORE_QUESTION_ID + ","
												+ SCORE_PERSON_ID + ","
												+ SCORE_MARK + ",study_id";
								valueString = "?,?,?,?";
								Database.insertInto(psql, TABLE_SCORES,
										columnString, valueString, questionID,
										peopleMap.get(p), score, studyid);
								// } else Database.update(psql, TABLE_SCORES,
								// SCORE_MARK + "=?", SCORE_STUDY_ID
								// + "=? AND " + SCORE_QUESTION_ID
								// + "=? AND " + SCORE_PERSON_ID
								// + "=?", score, studyid,
								// questionID, peopleMap.get(p));
							}

							break;
						default :
							break;
					}
				continue;
			}
			for (String c : ch) {

				columnString = CHOICE_QUESTION_ID + "," + CHOICE_ID;
				valueString = "?,?";

				if (Database.selectWhatFromTableWhere(psql, TABLE_CHOICES,
						CHOICE_ID,
						CHOICE_QUESTION_ID + "=? AND " + CHOICE_ID + "=?",
						new Object [] {questionID, c}).length() < 1)
					Database.insertInto(psql, TABLE_CHOICES, columnString,
							valueString, String.valueOf(questionID), c);

				for (Person p : peopleMap.keySet()) {
					String score = p.answers.get(questionAlias + "-" + c);
					if (score.trim().length() > 0) {

						// if (Database.selectWhatFromTableWhere(
						// psql,
						// TABLE_SCORES,
						// "*",
						// SCORE_STUDY_ID + "=? AND " + SCORE_QUESTION_ID
						// + "=? AND " + SCORE_CHOICE_ID
						// + "=? AND " + SCORE_PERSON_ID + "=?",
						// new Object [] {studyid, questionID, c,
						// peopleMap.get(p)}).length() < 1) {
						columnString =
								SCORE_QUESTION_ID + "," + SCORE_PERSON_ID + ","
										+ SCORE_MARK + "," + SCORE_CHOICE_ID
										+ "," + SCORE_STUDY_ID;
						valueString = "?,?,?,?,?";

						Database.insertInto(psql, TABLE_SCORES, columnString,
								valueString, questionID, peopleMap.get(p),
								score, c, studyid);
						// } else Database.update(psql, TABLE_SCORES, SCORE_MARK
						// + "=?", SCORE_STUDY_ID + "=? AND "
						// + SCORE_QUESTION_ID + "=? AND "
						// + SCORE_PERSON_ID + "=? AND " + SCORE_CHOICE_ID
						// + "=?", score, studyid, questionID,
						// peopleMap.get(p), c);

					}
				}
			}
		}
		psql.commit();
		psql.close();
	}
	private boolean areAnswersNumbers(List<String> list) {
		// will not catch quoted numbers i.e. "2"
		try {
			for (String s : list) {
				if (s.trim().length() < 1) continue;
				Float.parseFloat(s.trim());
			}
		} catch (NumberFormatException nfe) {
			return false;
		}
		return true;
	}
	private String cleanString(String s) {
		return s.replaceAll("\"", "\"\"")
		// unicode 8211 EN DASH
				.replaceAll(String.valueOf(((char) 8211)), "-")
				// unicode 8216 LEFT SINGLE QUOTATION MARK
				.replaceAll(String.valueOf(((char) 8216)), "'")
				// unicode 8217 RIGHT SINGLE QUOTATION MARK
				.replaceAll(String.valueOf(((char) 8217)), "'")
				// unicode 8220 LEFT DOUBLE QUOTATION MARK
				.replaceAll(String.valueOf(((char) 8220)), "\"")
				// unicode 8211 RIGHT DOUBLE QUOTATION MARK
				.replaceAll(String.valueOf(((char) 8221)), "\"");

	}
	class Tie {
		int from, to, weight, typeID;
	}
	class Person {
		int ID;
		Map<String, String> answers = new HashMap<String, String>();
		Map<String, String> attributes = new HashMap<String, String>();
		String name, email, completed;
		Person(int ID, String name, String email) {
			this.ID = ID;
			this.name = name;
			this.email = email;
		}
		void setCompleted(String completed) {
			this.completed = completed;
		}
		void setAnswer(String question, String answer) {
			answers.put(question, answer);
		}
		void setAttribute(String question, String attribute) {
			attributes.put(question, attribute);
		}
	}
}
