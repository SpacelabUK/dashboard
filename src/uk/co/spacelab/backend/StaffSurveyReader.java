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
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.lang3.math.NumberUtils;
import org.json.JSONArray;
import org.json.JSONObject;

import uk.co.spacelab.backend.StakeholderReader.Question;
import uk.co.spacelab.fileio.FileIO;

public class StaffSurveyReader {
	// private enum QuestionType {
	// TEXT, CHOICE, ATTRIBUTE, TIESCORE;
	// }

	private static String IN_COL_ID = "id", //
			IN_COL_NAME = "name", //
			IN_COL_EMAIL = "email", //
			IN_COL_COMPLETED = "completed", //
			IN_COL_TEAM = "department", //
			IN_COL_LOCATION = "location", //
			IN_COL_BUILDING = "building", //
			IN_COL_FLOOR = "floor";
	boolean locationColExists = false;
	// IN_COL_COMPLETED_COMPLETE = "Complete",
	// IN_COL_COMPLETED_NOT_STARTED = "NotStarted",
	// IN_COL_COMPLETED_INCOMPLETE = "Incomplete",
	// IN_COL_COMPLETED_BOUNCES = "Bounced",
	private static final String //
			TABLE_QUESTIONS = "staff_survey_questions",
			TABLE_QUESTIONS_SEQ = "staff_survey_questions_id_seq",
			QUESTION_ID = "id",
			QUESTION_ALIAS = "alias",
			QUESTION_TEXT = "question",
			QUESTION_BODY = "explanation",
			QUESTION_COMMENT = "comment",
			QUESTION_PARENT_ID = "parent_question_id",
			QUESTION_TYPE_ID = "type_id", //
			QUESTION_GROUP = "question_group", //
			// CREATE_TABLE_QUESTIONS = "create table " + TABLE_QUESTIONS //
			// + "(" //
			// + QUESTION_ID + " integer primary key not null, "//
			// + QUESTION_ALIAS + " text not null, " //
			// + QUESTION_TEXT + " text, " //
			// + QUESTION_BODY + " text, " //
			// + QUESTION_COMMENT + " text, "//
			// + QUESTION_PARENT_ID + " integer, " //
			// + QUESTION_TYPE_ID + " integer not null " //
			// + ");",

			TABLE_POSSIBLE_CHOICES = "staff_survey_possible_choices",
			POSSIBLE_CHOICE_QUESTION_ID = "question_id", //
			POSSIBLE_CHOICE_ID = "id",
			POSSIBLE_CHOICE_MARK = "mark",
			// CREATE_TABLE_POSSIBLE_CHOICES = "create table "
			// + TABLE_POSSIBLE_CHOICES //
			// + "(" //
			// + POSSIBLE_CHOICE_QUESTION_ID + " integer not null, "//
			// + POSSIBLE_CHOICE_ID + " text not null " //
			// + ");",

			// TABLE_SCALES = "staff_survey_scales",
			// SCALE_STUDY_ID = "study_id", //
			// SCALE_PERSON_ID = "person_id", //
			// SCALE_QUESTION_ID = "question_id", //
			// SCALE_POINT = "scale_point",

			TABLE_CHOICES = "staff_survey_choices",
			CHOICE_STUDY_ID = "study_id", //
			CHOICE_PERSON_ID = "person_id", //
			CHOICE_QUESTION_ID = "question_id", //
			CHOICE_ID = "choice_id",

			TABLE_QUOTES = "staff_survey_quotes", //
			QUOTE_ID = "id",
			QUOTE_QUESTION_ID = "question_id",
			QUOTE_TEXT = "quote", //
			QUOTE_PERSON_ID = "person_id", //
			QUOTE_STUDY_ID = "study_id", //
			// CREATE_TABLE_QUOTES = "create table " + TABLE_QUOTES //
			// + "(" //
			// + QUOTE_ID + " integer primary key not null, "//
			// + QUOTE_QUESTION_ID + " integer not null, " //
			// + QUOTE_TEXT + " text, "//
			// + QUOTE_PERSON_ID + " integer " //
			// + ");",

			TABLE_ATTRIBUTES = "staff_attributes", //
			ATTRIBUTE_ID = "attribute_id",
			ATTRIBUTE_QUESTION_ID = "question_id",
			ATTRIBUTE_TEXT = "attribute", //
			ATTRIBUTE_PERSON_ID = "person_id", //
			// CREATE_TABLE_ATTRIBUTES = "create table " + TABLE_ATTRIBUTES //
			// + "(" //
			// + ATTRIBUTE_ID + " integer primary key not null, "//
			// + ATTRIBUTE_QUESTION_ID + " integer not null, " //
			// + ATTRIBUTE_TEXT + " text, "//
			// + ATTRIBUTE_PERSON_ID + " integer " //
			// + ");",

			// TABLE_SCORES = "survey_scores",
			// SCORE_QUESTION_ID = "question_id",
			// SCORE_PERSON_ID = "person_id",
			// SCORE_CHOICE_ID = "choice_id",
			// SCORE_MARK = "mark", //
			// SCORE_STUDY_ID = "study_id", //
			// CREATE_TABLE_SCORES = "create table " + TABLE_SCORES //
			// + "(" //
			// + SCORE_QUESTION_ID + " integer not null, " //
			// + SCORE_PERSON_ID + " text, " //
			// + SCORE_CHOICE_ID + " integer, " //
			// + SCORE_MARK + " real " //
			// + ");", //
			TABLE_STAFF = "staff",
			STAFF_ID = "id",
			STAFF_SURVEY_ID = "survey_id",
			STAFF_TEAM_ID = "team_id",
			STAFF_FLOOR_ID = "floor_id",
			STAFF_ID_ON_SURVEY = "id_on_survey",
			STAFF_COMPLETED = "survey_completed", //
			// CREATE_TABLE_STAFF = "create table " + TABLE_STAFF //
			// + "(" //
			// + STAFF_ID_ON_SURVEY + " integer not null, " //
			// + STAFF_COMPLETED + " text not null " //
			// + ");", //
			// TABLE_TIE_TYPES = "survey_tie_types", //
			// TIE_TYPE_TYPE_ID = "id", //
			// TIE_TYPE_NAME = "name", //
			// CREATE_TABLE_TIE_TYPES = "create table " + TABLE_TIE_TYPES //
			// + "(" //
			// + TIE_TYPE_TYPE_ID + " integer not null, " //
			// + TIE_TYPE_NAME + " text not null " //
			// + ");", //
			TABLE_TIES = "staff_survey_ties", //
			TIE_FROM = "from_staff_id", //
			TIE_TO = "to_staff_id", //
			TIE_QUESTION_ID = "question_id", //
			TIE_SCORE = "score", //
			TIE_STUDY_ID = "study_id"; //
	// CREATE_TABLE_TIES = "create table " + TABLE_TIES //
	// + "(" //
	// + TIE_FROM + " bigint not null, " //
	// + TIE_TO + " bigint not null, " //
	// + TIE_QUESTION_ID + " bigint not null, " //
	// + TIE_SCORE + " real not null " //
	// + ");";
	abstract class Question {
		String alias;
		String group;
		public String type;
		Question(String alias) {
			this.alias = alias;
		}
	}
	class ChoiceQuestion extends Question {
		// Set<String> choices;
		Map<String, Float> choiceScale;
		ChoiceQuestion(String alias) {
			super(alias);
			type = "CHOICE";
			choiceScale = new HashMap<String, Float>();
		}
	}
	class TieQuestion extends Question {
		TieQuestion(String alias) {
			super(alias);
			type = "TIESCORE";
		}
	}
	class TextQuestion extends Question {
		TextQuestion(String alias) {
			super(alias);
			type = "TEXT";
		}
	}
	/**
	 * Object describing the data taken from the VNA file
	 * 
	 * @author petros
	 *
	 */
	class Dataset {
		Map<Integer, Person> people;
		List<Tie> ties;
		Map<Integer, String> tieProps;
		Map<String, List<String>> answers;
		Map<String, Question> questions;
		private Dataset expand(String inFile) {

			ties = new ArrayList<Tie>();
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
			Map<Integer, List<String>> answerStrings =
					new HashMap<Integer, List<String>>();
			String [] head = nodeHeader.split(" ");

			for (int i = 0; i < head.length; i++) {
				List<String> in = new ArrayList<String>();
				in.add(head[i]);
				answerStrings.put(i, in);
			}
			for (String line : nodes) {
				// System.out.println(line);
				String [] node =
						(line.substring(1, line.length() - 1) + " ")
								.split("\" \"");
				// for (Integer i : answerStrings.keySet()) {
				// String name = answerStrings.get(i).get(0);
				// if (name.equals("XAwayFromDesk")) {
				// // System.out.println(answerStrings.get(i));
				// System.out.println(node[i]);
				// }
				// }
				if (node.length != head.length)
					throw new RuntimeException(
							"Error parsing! Check for double quotes(\") in the answers and convert them to single(') ones. Error on line: "
									+ line.substring(1, line.length() - 1)
									+ " (" + node[node.length - 1] + ")");
				for (int i = 0; i < node.length; i++)
					answerStrings.get(i).add(node[i]);
			}

			answers = new HashMap<String, List<String>>();
			for (Integer i : answerStrings.keySet()) {
				String name = answerStrings.get(i).get(0);
				answerStrings.get(i).remove(0);
				answers.put(name, answerStrings.get(i));
				if (name.equalsIgnoreCase(IN_COL_ID)) IN_COL_ID = name;
				if (name.equalsIgnoreCase(IN_COL_NAME)) IN_COL_NAME = name;
				if (name.equalsIgnoreCase(IN_COL_EMAIL)) IN_COL_EMAIL = name;
				if (name.equalsIgnoreCase(IN_COL_TEAM)) IN_COL_TEAM = name;
				if (name.equalsIgnoreCase(IN_COL_LOCATION)) {
					IN_COL_LOCATION = name;
					locationColExists = true;
				}
				if (name.equalsIgnoreCase(IN_COL_BUILDING))
					IN_COL_BUILDING = name;
				if (name.equalsIgnoreCase(IN_COL_FLOOR)) IN_COL_FLOOR = name;
				if (name.equalsIgnoreCase(IN_COL_COMPLETED))
					IN_COL_COMPLETED = name;
			}

			answerStrings = null;
			String [] tieHead = tieHeader.split(" ");
			List<String> tieQuestions = new ArrayList<String>();
			List<Integer> ignore = new ArrayList<Integer>();
			tieProps = new HashMap<Integer, String>();
			int fromCol = -1, toCol = -1, ownerCol = -1;
			for (int i = 0; i < tieHead.length; i++) {
				// if (!tieHead[i].trim().equalsIgnoreCase("from")
				// && !tieHead[i].trim().equalsIgnoreCase("to")
				// && !tieHead[i].trim().equalsIgnoreCase("ownernode"))
				//
				// else {
				// if (tieHead[i].trim().equalsIgnoreCase(
				// "relationship_set_people_you_interact_with")) {
				// ignore.add(i);
				// continue;
				// }
				if (tieHead[i].trim().equalsIgnoreCase("from"))
					fromCol = i;
				else if (tieHead[i].trim().equalsIgnoreCase("to"))
					toCol = i;
				else if (tieHead[i].trim().equalsIgnoreCase("ownernode"))
					ownerCol = i;
				else tieQuestions.add(tieHead[i]);

				tieProps.put(i, tieHead[i]);
			}
			for (String line : tiesIn) {
				String [] tie =
						line.substring(1, line.length() - 1).split("\" \"");
				int from = -1, to = -1;
				from = Integer.parseInt(tie[fromCol]);
				to = Integer.parseInt(tie[toCol]);
				for (int i = 0; i < tie.length; i++) {
					if (tie[i].equals("-")) continue;
					if (i == fromCol || i == toCol || i == ownerCol) continue;
					Tie t = null;
					for (Tie nt : ties)
						if (from == nt.from && to == nt.to && i == nt.question) {
							t = nt;
							break;
						}
					if (t == null) {
						t = new Tie(from, to, i);
						if (!ignore.contains(i)) ties.add(t);
					}
					t.score = Float.parseFloat(tie[i]);

				}
			}
			// for (Tie tie : ties)
			// System.out.println(tie.from + " " + tie.to + " " + tie.typeID +
			// " "
			// + tie.weight);
			// System.out.println(answerStrings);
			// if (true) return;

			people =
					new HashMap<Integer, Person>(answers.get(IN_COL_ID).size());
			for (int i = 0; i < answers.get(IN_COL_ID).size(); i++) {
				try {
					int id = Integer.parseInt(answers.get(IN_COL_ID).get(i));
					String name = answers.get(IN_COL_NAME).get(i).trim();
					String email = answers.get(IN_COL_EMAIL).get(i).trim();
					String completed =
							answers.get(IN_COL_COMPLETED).get(i).trim();
					Person p = new Person(id, name, email);
					p.team = answers.get(IN_COL_TEAM).get(i).trim();
					if (IN_COL_BUILDING != null
							&& answers.containsKey(IN_COL_BUILDING))
						p.building = answers.get(IN_COL_BUILDING).get(i).trim();
					if (IN_COL_FLOOR != null
							&& answers.containsKey(IN_COL_FLOOR))
						p.floor = answers.get(IN_COL_FLOOR).get(i).trim();
					if (locationColExists)
						p.location = answers.get(IN_COL_LOCATION).get(i).trim();
					else if (IN_COL_BUILDING != null
							&& answers.containsKey(IN_COL_BUILDING)
							&& IN_COL_FLOOR != null
							&& answers.containsKey(IN_COL_FLOOR)) {
						p.location = p.building + "_" + p.floor;
					} else if (IN_COL_FLOOR != null
							&& answers.containsKey(IN_COL_FLOOR)) {
						p.location = p.floor;
					}
					for (String q : answers.keySet()) {
						if (q.equals(IN_COL_COMPLETED))
							p.setCompleted(completed);
						else if (!q.equals(IN_COL_NAME)
								&& !q.equals(IN_COL_NAME))
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
			answers.remove(IN_COL_TEAM);
			answers.remove(IN_COL_LOCATION);
			answers.remove(IN_COL_BUILDING);
			answers.remove(IN_COL_FLOOR);
			questions = new HashMap<String, Question>();
			// Map<String, Set<String>> choices = new HashMap<String,
			// Set<String>>();
			// Map<String, Map<String, Float>> scales =
			// new HashMap<String, Map<String, Float>>();
			// Map<String, String> questionGroup = new HashMap<String,
			// String>();
			// Map<String, QuestionType> simpleQuestions =
			// new HashMap<String, QuestionType>();
			for (String s : answers.keySet()) {
				String [] complex = s.split("-");
				Map<String, Float> scale = extractScale(answers.get(s), "-");
				Set<String> exchoices = extractChoices(answers.get(s), "-");
				String qGroup = null;
				String question = null;
				if (complex.length > 1) {
					// we have a complex question alias where the first part is
					// the
					// group of the question and the second part is question
					// code
					qGroup = complex[0];
					question = complex[1];
				} else {
					// we have a simple "rate something" question
					question = s;
				}
				Question q;
				if (exchoices != null) {
					q = new ChoiceQuestion(question);
					for (String choice : exchoices) {
						Float scp = null;
						if (scale != null && scale.containsKey(choice))
							scp = scale.get(choice);
						((ChoiceQuestion) q).choiceScale.put(choice, scp);
					}
				} else q = new TextQuestion(question);
				if (qGroup != null) q.group = qGroup;
				questions.put(question, q);
			}

			for (String s : tieQuestions) {
				questions.put(s, new TieQuestion(s));
			}
			// for (String question : questions.keySet()) {
			// System.out.println(question);
			// }
			// for (String question : choices.keySet()) {
			// System.out.println("Choices for question: ");
			// System.out.print(question);
			// System.out.println(choices.get(question));
			// }
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
			return this;
		}
	}
	Map<String, Integer> processTeams(JSONArray teamsIn, int studyID)
			throws ClassNotFoundException, SQLException, ParseException {
		Map<String, Integer> teams = new HashMap<String, Integer>();
		Map<String, JSONObject> teamsJSON = new HashMap<String, JSONObject>();
		for (int i = 0; i < teamsIn.length(); i++) {
			JSONObject q = teamsIn.getJSONObject(i);
			if (q.optString("match").equals("*")) {
				// is new
				System.out.println(q.getString("alias") + " is new");
				teams.put(q.getString("alias"), -1);

			} else if (q.optString("match").equals("-")) {
				// ignore this
				System.out.println(q.getString("alias") + " to be ingored");
				continue;
			} else if (q.has("match")) {
				JSONObject match = q.getJSONObject("match");
				teams.put(q.getString("alias"), match.getInt("id"));
			}
			teamsJSON.put(q.getString("alias"), q);
		}
		System.out.println(teams);
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
					if (teamsJSON.get(q).has("parent")) {
						q = teamsJSON.get(q).getString("parent");
						if (!teams.containsKey(q))
							throw new MalformedDataException("Parent '" + q
									+ "' missing");
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
					else Database.insertInto(psql, "teams",
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
	Map<String, Integer> processFloors(JSONArray floorsIn, int studyID)
			throws ClassNotFoundException, SQLException, ParseException {
		Map<String, Integer> floors = new HashMap<String, Integer>();
		Map<String, JSONObject> floorsJSON = new HashMap<String, JSONObject>();
		for (int i = 0; i < floorsIn.length(); i++) {
			JSONObject q = floorsIn.getJSONObject(i);
			if (q.optString("match").equals("*")) {
				// is new
				System.out.println(q.getString("alias") + " is new");
				floors.put(q.getString("alias"), -1);

			} else if (q.optString("match").equals("-")) {
				// ignore this
				System.out.println(q.getString("alias") + " to be ingored");
				continue;
			} else if (q.has("match")) {
				JSONObject match = q.getJSONObject("match");
				floors.put(q.getString("alias"), match.getInt("id"));
			}
			floorsJSON.put(q.getString("alias"), q);
		}
		System.out.println(floors);
		Connection psql = Database.getConnection();
		psql.setAutoCommit(false);
		for (String floor : floors.keySet()) {
			if (floors.get(floor) == -1) {
				// List<String> validTeams = new ArrayList<String>();
				String q = floor;
				// validTeams.add(q);
				// int breakcounter = 100;
				// Integer parentID = null;
				// while (breakcounter > 1) {
				String buildingName = null;
				String floorName = null;
				String location = null;
				if (floorsJSON.get(q).has("building")) {
					buildingName = floorsJSON.get(q).getString("building");
				}
				if (floorsJSON.get(q).has("floor")) {
					floorName = floorsJSON.get(q).getString("floor");
				}
				if (floorsJSON.get(q).has("location")) {
					location = floorsJSON.get(q).getString("location");
				}
				if (location != null) {
					if (buildingName != null && floorName == null) {
						int index = location.indexOf(buildingName);
						if (index + buildingName.length() < location.length())
							floorName =
									location.substring(index
											+ buildingName.length());
					} else if (floorName != null && buildingName == null) {
						int index = location.indexOf(floorName);
						if (index != 0)
							buildingName = location.substring(0, index);
					}
				}
				// q = floorsJSON.get(q).getString("parent");
				// if (!floors.containsKey(q))
				// throw new MalformedDataException("Parent '" + q
				// + "' missing");
				// if (floors.get(q) == -1)
				// validTeams.add(q);
				// else {
				// parentID = floors.get(q);
				// break;
				// }
				// } else {
				// break;
				// }
				// breakcounter--;
				// }
				// if (breakcounter < 1) return null;
				// // int
				// for (int i = validTeams.size() - 1; i >= 0; i--) {
				// String clearQ = validTeams.get(i);
				String colString = "study_id,alias,name";
				String valString = "?,?,?";
				List<Object> args = new ArrayList<Object>();
				args.add(studyID);
				args.add(q);
				args.add(q);
				if (buildingName != null) {
					colString += ",building";
					valString += ",?";
					args.add(buildingName);
				}
				if (floorName != null) {
					colString += ",floor";
					valString += ",?";
					args.add(floorName);
				}
				Database.insertInto(psql, "spaces", colString, valString,
						args.toArray());
				int currval =
						Database.getSequenceCurrVal(psql, "spaces_id_seq")
								.getJSONObject(0).getInt("currval");
				floors.put(q, currval);
				// }
			}
		}
		psql.commit();
		psql.setAutoCommit(true);

		return floors;
	}
	public void convert(String inFile, Integer studyID,
			JSONObject staticDataJSON) throws ClassNotFoundException,
			SQLException, ParseException {

		Map<String, Integer> teams =
				processTeams(staticDataJSON.getJSONArray("teams"), studyID);
		Map<String, Integer> floors =
				processFloors(staticDataJSON.getJSONArray("floors"), studyID);
		// System.out.println(teams);
		// Logger.getLogger("com.almworks.sqlite4java").setLevel(Level.OFF);
		Dataset dst = new Dataset().expand(inFile);

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

		System.out.println("-- adding questions");
		// String statement = "";
		Map<String, Integer> questionMap = new HashMap<String, Integer>();
		for (String q : dst.questions.keySet()) {
			Question qst = dst.questions.get(q);
			JSONArray r =
					Database.selectWhatFromTableWhere(psql, TABLE_QUESTIONS,
							QUESTION_ID, "alias=?", q);
			int quid = -1;
			if (r.length() == 0) {
				String columnString = QUESTION_ALIAS + "," + QUESTION_TYPE_ID;
				String valueString = "?,?";
				List<Object> vals = new ArrayList<Object>();
				vals.add(q);
				vals.add(qst.type);
				if (qst.group != null) {
					columnString += "," + QUESTION_GROUP;
					valueString += ",?";
					vals.add(qst.group);
				}
				Database.insertInto(psql, TABLE_QUESTIONS, columnString,
						valueString, vals.toArray());
				quid =
						Database.getSequenceCurrVal(psql, TABLE_QUESTIONS_SEQ)
								.getJSONObject(0).getInt("currval");
				if (qst instanceof ChoiceQuestion) {
					for (String choice : ((ChoiceQuestion) qst).choiceScale
							.keySet()) {

						columnString =
								POSSIBLE_CHOICE_QUESTION_ID + ","
										+ POSSIBLE_CHOICE_ID;
						valueString = "?,?";
						vals = new ArrayList<Object>();
						vals.add(quid);
						vals.add(choice);
						Float mark =
								((ChoiceQuestion) qst).choiceScale.get(choice);
						if (mark != null) {
							columnString += "," + POSSIBLE_CHOICE_MARK;
							valueString += ",?";
							vals.add(mark);
						}
						Database.insertInto(psql, TABLE_POSSIBLE_CHOICES,
								columnString, valueString, vals.toArray());
					}
				}
			} else {
				quid = r.getJSONObject(0).getInt("id");

				if (qst instanceof ChoiceQuestion) {

					for (String choice : ((ChoiceQuestion) qst).choiceScale
							.keySet()) {
						JSONArray ch =
								Database.selectWhatFromTableWhere(psql,
										TABLE_POSSIBLE_CHOICES,
										POSSIBLE_CHOICE_ID,
										POSSIBLE_CHOICE_QUESTION_ID + "=? AND "
												+ POSSIBLE_CHOICE_ID
												+ " =?::text", quid, choice);
						if (ch.length() == 0) {

							String columnString =
									POSSIBLE_CHOICE_QUESTION_ID + ","
											+ POSSIBLE_CHOICE_ID;
							String valueString = "?,?";
							List<Object> vals = new ArrayList<Object>();
							vals.add(quid);
							vals.add(choice);
							Float mark =
									((ChoiceQuestion) qst).choiceScale
											.get(choice);
							if (mark != null) {
								columnString += "," + POSSIBLE_CHOICE_MARK;
								valueString += ",?";
								vals.add(mark);
							}
							Database.insertInto(psql, TABLE_POSSIBLE_CHOICES,
									columnString, valueString, vals.toArray());
						}
					}
				}
			}
			questionMap.put(q, quid);
		}

		// System.out.println("-- adding choices");
		// for (String q : questions.keySet()) {
		// JSONArray r =
		// Database.selectWhatFromTableWhere(psql, TABLE_QUESTIONS,
		// QUESTION_ID, "alias=?", q);
		// if (r.length() == 0) {
		// Object [] args =
		// new Object [] {q, QuestionType.CHOICE.toString()};
		// Database.insertInto(psql, TABLE_QUESTIONS, columnString,
		// valueString, args);
		// questionMap.put(
		// q,
		// Database.getSequenceCurrVal(psql,
		// "survey_questions_id_seq").getJSONObject(0)
		// .getInt("currval"));
		// } else questionMap.put(q, r.getJSONObject(0).getInt("id"));
		//
		// }
		Database.deleteFrom(psql, TABLE_TIES, TIE_STUDY_ID + "=?", studyID);
		Database.deleteFrom(psql, TABLE_QUOTES, QUOTE_STUDY_ID + "=?", studyID);
		// Database.deleteFrom(psql, TABLE_SCORES, SCORE_STUDY_ID + "=?",
		// studyid);
		// Database.deleteFrom(psql, TABLE_SCALES, CHOICE_STUDY_ID + "=?",
		// studyid);
		Database.deleteFrom(psql, TABLE_CHOICES, CHOICE_STUDY_ID + "=?",
				studyID);
		Database.deleteFrom(psql, TABLE_STAFF, STAFF_SURVEY_ID + "=?", studyID);
		String columnString =
				STAFF_ID_ON_SURVEY + "," + STAFF_COMPLETED + ","
						+ STAFF_SURVEY_ID + "," + STAFF_TEAM_ID + ","
						+ STAFF_FLOOR_ID;
		String valueString = "?,?,?,?,?";

		System.out.println("-- adding people");
		Map<Person, Integer> peopleMap = new HashMap<Person, Integer>();
		for (Integer i : dst.people.keySet()) {
			// Skipping dummy people
			if (dst.people.get(i).name.startsWith("*")) continue;
			JSONArray r =
					Database.selectWhatFromTableWhere(psql, TABLE_STAFF,
							STAFF_ID, STAFF_ID_ON_SURVEY + "=? AND "
									+ STAFF_SURVEY_ID + "=?",
							dst.people.get(i).ID, studyID);
			if (r.length() < 1) {
				String team = dst.people.get(i).team;
				if (!teams.containsKey(team)) continue;
				int teamID = teams.get(team);
				String floor = dst.people.get(i).location;
				if (!floors.containsKey(floor)) continue;
				int floorID = floors.get(floor);
				Object [] args =
						new Object [] {dst.people.get(i).ID,
								dst.people.get(i).completed, studyID, teamID,
								floorID};
				Database.insertInto(psql, TABLE_STAFF, columnString,
						valueString, args);
				peopleMap.put(dst.people.get(i),
						Database.getSequenceCurrVal(psql, "staff_id_seq")
								.getJSONObject(0).getInt("currval"));
			} else {
				peopleMap.put(dst.people.get(i), r.getJSONObject(0)
						.getInt("id"));
			}
		}
		dst.people = null;

		System.out.println("-- matching people to questions");
		for (String questionAlias : questionMap.keySet()) {
			int questionID = questionMap.get(questionAlias);
			Question q = dst.questions.get(questionAlias);
			// System.out.println(ch);
			if (q instanceof TextQuestion) {
				for (Person p : peopleMap.keySet()) {
					// if (simpleQuestions.containsKey(questionAlias))
					// switch (questions.get(questionAlias)) {
					// case TEXT :
					String quote =
							cleanString(p.answers.get((q.group != null
									? q.group
									: "") + questionAlias));
					if (quote.trim().length() != 0) {

						columnString =
								QUOTE_QUESTION_ID + "," + QUOTE_TEXT + ","
										+ QUOTE_PERSON_ID + ",study_id";
						valueString = "?,?,?,?";
						Database.insertInto(psql, TABLE_QUOTES, columnString,
								valueString, String.valueOf(questionID), quote,
								String.valueOf(peopleMap.get(p)),
								String.valueOf(studyID));
					}
					// break;
					// case SCORE :
					// String score = p.answers.get(questionAlias);
					// if (score.trim().length() > 0) {
					//
					// // if (Database.selectWhatFromTableWhere(
					// // psql,
					// // TABLE_SCORES,
					// // "*",
					// // SCORE_STUDY_ID + "=? AND "
					// // + SCORE_QUESTION_ID + "=? AND "
					// // + SCORE_PERSON_ID + "=?",
					// // new Object [] {studyid, questionID,
					// // peopleMap.get(p)}).length() < 1) {
					// columnString =
					// SCORE_QUESTION_ID + ","
					// + SCORE_PERSON_ID + ","
					// + SCORE_MARK + ",study_id";
					// valueString = "?,?,?,?";
					// Database.insertInto(psql, TABLE_SCORES,
					// columnString, valueString, questionID,
					// peopleMap.get(p), score, studyid);
					// // } else Database.update(psql, TABLE_SCORES,
					// // SCORE_MARK + "=?", SCORE_STUDY_ID
					// // + "=? AND " + SCORE_QUESTION_ID
					// // + "=? AND " + SCORE_PERSON_ID
					// // + "=?", score, studyid,
					// // questionID, peopleMap.get(p));
					// }
					//
					// break;
					// default :
					// break;
					// }
				}
				continue;
			}
			if (q instanceof ChoiceQuestion) {
				Set<String> ch = ((ChoiceQuestion) q).choiceScale.keySet();

				// for (String c : ch) {

				// columnString = CHOICE_QUESTION_ID + "," + CHOICE_ID;
				// valueString = "?,?";
				//
				// if (Database.selectWhatFromTableWhere(psql,
				// TABLE_CHOICES,
				// CHOICE_ID,
				// CHOICE_QUESTION_ID + "=? AND " + CHOICE_ID + "=?",
				// new Object [] {questionID, c}).length() < 1)
				// Database.insertInto(psql, TABLE_CHOICES, columnString,
				// valueString, String.valueOf(questionID), c);

				for (Person p : peopleMap.keySet()) {
					String choice =
							p.answers.get(
									(q.group != null ? q.group + "-" : "")
											+ questionAlias).trim();
					if (choice.length() > 0 && ch.contains(choice)) {

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
								CHOICE_STUDY_ID + "," + CHOICE_PERSON_ID + ","
										+ CHOICE_QUESTION_ID + "," + CHOICE_ID;
						valueString = "?,?,?,?";
						Database.insertInto(psql, TABLE_CHOICES, columnString,
								valueString, studyID, peopleMap.get(p),
								questionID, choice);
						// } else Database.update(psql, TABLE_SCORES,
						// SCORE_MARK
						// + "=?", SCORE_STUDY_ID + "=? AND "
						// + SCORE_QUESTION_ID + "=? AND "
						// + SCORE_PERSON_ID + "=? AND " + SCORE_CHOICE_ID
						// + "=?", score, studyid, questionID,
						// peopleMap.get(p), c);

					}
				}
				// }
			}
		}
		System.out.println("-- matching ties to people, questions");
		// int counter = 0;
		for (Tie t : dst.ties) {
			int qID = questionMap.get(dst.tieProps.get(t.question));
			int fromID = -1, toID = -1;
			for (Person p : peopleMap.keySet()) {
				if (p.ID == t.from) {
					fromID = peopleMap.get(p);
					if (toID != -1) {
						break;
					}
				}
				if (p.ID == t.to) {
					toID = peopleMap.get(p);
					if (fromID != -1) {
						break;
					}
				}
			}
			if (fromID == -1 || toID == -1) continue;
			columnString =
					TIE_FROM + "," + TIE_TO + "," + TIE_QUESTION_ID + ","
							+ TIE_SCORE + "," + TIE_STUDY_ID;
			valueString = "?,?,?,?,?";
			// TODO update this with UPSERT when introduced in Postgres. If we
			// accept that there will never be duplicates in the file this won't
			// be necessary...

			// try {
			// if (Database.selectAllFromTableWhere(
			// psql,
			// TABLE_TIES,
			// TIE_FROM + " = ? AND " + TIE_TO + " = ? AND "
			// + TIE_QUESTION_ID, fromID, toID, qID).length() == 0)
			Database.insertInto(psql, TABLE_TIES, columnString, valueString,
					fromID, toID, qID, t.score, studyID);
			// else Database.update(psql, TABLE_TIES, TABLE_TIES, TIE_FROM +
			// " = ? AND " + TIE_TO + " = ? AND "
			// + TIE_QUESTION_ID, fromID, toID, qID);
			// } catch (org.postgresql.util.PSQLException e) {
			// System.out.println(t.from + " " + t.to + " " + t.question);
			// e.printStackTrace();
			// psql.close();
			// return;
			// }
			// if (counter > 15000) break;
			// counter++;
		}
		psql.commit();
		psql.close();
	}
	private Map<String, Float>
			extractScale(List<String> list, String... ignore) {
		// will not catch quoted numbers i.e. "2"
		// try {
		Map<String, Float> scale = new HashMap<String, Float>();
		outerloop : for (String s : list) {
			s = s.trim();
			if (s.length() < 1) continue;
			for (String i : ignore)
				if (s.equals(i)) continue outerloop;
			if (!NumberUtils.isNumber(s)) {
				System.out.println(s + " found, NaN");
				return null;
			}
			scale.put(s, Float.parseFloat(s));
			// Float.parseFloat(s.trim());
		}
		// } catch (NumberFormatException nfe) {
		// return false;
		// }
		return scale;
	}
	private Set<String> extractChoices(List<String> list, String... ignore) {
		Set<String> differentAnswers = new HashSet<String>();
		int skipped = 0;
		outerloop : for (String s : list) {
			s = s.trim();
			if (s.length() < 1) {
				skipped++;
				continue;
			}
			for (String i : ignore)
				if (s.equals(i)) {
					skipped++;
					continue outerloop;
				}
			differentAnswers.add(s);
		}
		if (differentAnswers.size() / (1.0 * (list.size() - skipped)) < 0.9)
			return differentAnswers;
		else return null;
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
		int from, to, question;
		float score;
		Tie(int from, int to, int question) {
			this.from = from;
			this.to = to;
			this.question = question;
		}
		@Override
		public boolean equals(Object o) {
			Tie t = (Tie) o;
			return from == t.from && to == t.to && question == t.question;
		}
	}
	class Person {
		int ID;
		Map<String, String> answers = new HashMap<String, String>();
		Map<String, String> attributes = new HashMap<String, String>();
		String name, email, completed, team;
		String location, building, floor;
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
	class Floor {
		String building, name, alias;
		Floor(String alias) {
			this.alias = alias;
		}
	}
	public JSONObject
			getStaticData(String filePath, String fileid, int studyID)
					throws SQLException, ParseException {

		Dataset dst = new Dataset().expand(filePath);
		Map<String, List<String>> staticData =
				new HashMap<String, List<String>>();
		Set<String> teams = new HashSet<String>();
		for (Person p : dst.people.values()) {
			// System.out.println(p.);
			teams.add(p.team);
		}
		staticData.put("DEPARTMENT_LIST", new ArrayList<String>(teams));
		Map<String, Floor> floors = new HashMap<String, Floor>();
		for (Person p : dst.people.values()) {
			// System.out.println(p.);
			if (floors.containsKey(p.location)) continue;
			Floor f = new Floor(p.location);
			if (p.building != null) f.building = p.building;
			if (p.floor != null) f.name = p.floor;
			floors.put(p.location, f);
		}
		staticData.put("FLOOR_LIST", new ArrayList<String>(floors.keySet()));
		JSONArray databaseTeams =
				Database.selectAllFromTableWhere("teams", "study_id=?", studyID);
		JSONArray databaseFloors =
				Database.selectAllFromTableWhere("spaces", "study_id=?",
						studyID);
		JSONArray databaseQuestions = new JSONArray();
		// Database.customQuery("SELECT interview_questions.id,interview_questions.alias,interview_questions.parent_id,"
		// + "(SELECT alias FROM interview_questions "
		// +
		// "WHERE interview_questions.id=parent_questions.parent_id) AS parent FROM interview_questions JOIN "
		// +
		// "interview_questions AS parent_questions ON interview_questions.id=parent_questions.id;");

		JSONObject out = new JSONObject();
		for (String key : staticData.keySet()) {
			JSONArray arr;
			arr = new JSONArray();
			if (key.equalsIgnoreCase("QUESTION_LIST")) {
				// for (String alias : questions.keySet()) {
				// Question q = questions.get(alias);
				// JSONObject o = new JSONObject();
				// String [] theAlias = clearQuestionAlias(alias);
				// String clearAlias = theAlias[0];
				// // String clearID = theAlias[1];
				//
				// o.put("alias", alias);
				// // o.put("alias", clearAlias);
				// // o.put("id", clearID);
				// o.put("title", q.title);
				// if (q.parent != null) {
				// // String [] parentAlias =
				// // clearQuestionAlias(q.parent.alias);
				// o.put("parent", q.parent.alias);
				// // o.put("parent", parentAlias[0]);
				// // o.put("parent_id", parentAlias[1]);
				// }
				// if (q.choices != null) {
				// o.put("choicesReference", new JSONArray(
				// q.choicesReference));
				// o.put("choices", new JSONArray(q.choices));
				// }
				// outerloop : for (int i = 0; i < databaseQuestions.length();
				// i++) {
				// JSONObject dbQ = databaseQuestions.getJSONObject(i);
				// String dbAlias = dbQ.getString("alias");
				// int dbID = dbQ.getInt("id");
				// if (clearAlias.equalsIgnoreCase(dbAlias)) {
				// Question currentQ = q;
				// JSONObject currentDBQ = dbQ;
				// int breakcounter = 100;
				// while (breakcounter > 1) {
				// for (int j = 0; j < 100 - breakcounter; j++)
				// System.out.print(" ");
				// if (currentQ.parent != null
				// && !currentDBQ.has("parent"))
				// continue outerloop;
				// if (currentQ.parent == null
				// && currentDBQ.has("parent"))
				// continue outerloop;
				// if (currentQ.parent == null
				// && !currentDBQ.has("parent")) {
				// if (currentDBQ
				// .getString("alias")
				// .equalsIgnoreCase(
				// clearQuestionAlias(currentQ.alias)[0]))
				// break;
				// }
				// if (!currentDBQ
				// .getString("parent")
				// .equalsIgnoreCase(
				// clearQuestionAlias(currentQ.parent.alias)[0]))
				// continue outerloop;
				// currentQ = currentQ.parent;
				// currentDBQ =
				// findDBQ(databaseQuestions,
				// currentDBQ.getInt("parent_id"));
				// breakcounter--;
				// }
				// o.put("prematchproperty", "id");
				// o.put("prematch", dbID);
				// break;
				// }
				// }
				// arr.put(o);
				// }
			} else if (key.equalsIgnoreCase("DEPARTMENT_LIST")) {
				for (String alias : staticData.get(key)) {
					alias = alias.trim();
					JSONObject o = new JSONObject();
					o.put("alias", alias);
					arr.put(o);
					for (int i = 0; i < databaseTeams.length(); i++) {
						String teamDB =
								databaseTeams.getJSONObject(i).getString(
										"alias");
						if (teamDB.equalsIgnoreCase(alias)) {
							o.put("prematchproperty", "id");
							o.put("prematch", teamDB);

							break;
						}
					}
				}
			} else if (key.equalsIgnoreCase("FLOOR_LIST")) {
				for (String alias : staticData.get(key)) {
					Floor f = floors.get(alias);
					JSONObject o = new JSONObject();
					o.put("alias", alias);
					if (f.building != null) o.put("building", f.building);
					if (f.name != null) o.put("floor", f.name);
					arr.put(o);
					for (int i = 0; i < databaseFloors.length(); i++) {
						String floorDB =
								databaseFloors.getJSONObject(i).getString(
										"alias");
						if (floorDB.equalsIgnoreCase(alias)) {
							o.put("prematchproperty", "id");
							o.put("prematch", floorDB);
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
		out.put("DATABASE_FLOORS", databaseFloors);
		out.put("DATABASE_QUESTIONS", databaseQuestions);
		out.put("fileid", fileid);
		return out;
	}
}
