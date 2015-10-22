package uk.co.spacelab.dxf;

import java.util.ArrayList;
import java.util.List;

public class DXFReader {
    String theDXF;
    public List<dxfEntity> ent;
    public List<dxfEntity> blk;
    public List<dxfEntity> layr;
    public static final String generalIdentifier = "@_";
    public static final String propIdentifier = "properties";
    public static final String baselineIdentifier = "baseline";

    // private final static Distributor INSTANCE =
    // singleton pattern removed. A lurking dxf importer is not necessary apart
    // from the time we want to import dxfs
    public DXFReader() {

    }
    // public static final Distributor getINSTANCE() {
    // return INSTANCE;
    // }

    public void addData(List<String> stringz) {
        ent = getDXFEntities(stringz, "ENTITIES");
        blk = getDXFEntities(stringz, "BLOCKS");
        layr = getDXFEntities(stringz, "TABLES");
    }

    public class dxfEntity {
        String[][] p;

        dxfEntity(List<String[]> properties) {
            p = new String[properties.size()][2];
            properties.toArray(p);
        }
    }

    List<dxfEntity> getDXFEntities(List<String> ent, String section) {
        System.out.println("Getting " + section);

        System.out.println("Found " + ent.size() + " entities");
        ArrayList<dxfEntity> entities = new ArrayList<dxfEntity>();
        int startEntities = -1;
        ArrayList<String[]> newObjectList = new ArrayList<String[]>();
        for (int i = 0; i < ent.size(); i++) {
            String key = ent.get(i).trim();
            String value = ent.get(i + 1).trim();
            if (startEntities != -1) {
                if (key.equalsIgnoreCase("ENDSEC")
                        || value.equalsIgnoreCase("ENDSEC")) {
                    entities.add(new dxfEntity(newObjectList));
                    newObjectList.clear();
                    break;
                } else {
                    if (i - startEntities > 0
                            && (i - startEntities) % 2 == 1) {
                        if (key.equals("0")) {
                            if (newObjectList.size() > 1) {
                                entities.add(new dxfEntity(newObjectList));
                                newObjectList.clear();
                                newObjectList.add(new String[]{"0", value});
                                i++;
                            }
                        } else {
                            newObjectList.add(new String[]{key, value});
                            i++;
                        }
                    }
                }
            }
            if (startEntities == -1 && key.equalsIgnoreCase(section)) {
                startEntities = i;
                if (startEntities + 2 > ent.size() - 1) { // throw exception
                } else {
                    if (!value.equals("0")) { // throw exception
                    } else {
                        newObjectList.add(
                                new String[]{"0", ent.get(i + 2).trim()});
                    }
                }
            }
        }
        System.out.println("Finished getting " + section + " (found: "
                + entities.size() + " )");
        return entities;
    }

    public List<String[]> breakDXFEntities(List<dxfEntity> entityList) {
        List<String[]> stringEntities = new ArrayList<String[]>();
        for (dxfEntity ent : entityList) {
            if (ent.p[0][1].equalsIgnoreCase("LINE"))
                stringEntities.add(extractDXFLine(ent.p));
            else if (ent.p[0][1].equalsIgnoreCase("LAYER"))
                stringEntities.add(extractDXFLayer(ent.p));
            else if (ent.p[0][1].equalsIgnoreCase("ARC"))
                stringEntities.add(extractDXFArc(ent.p, false));
            else if (ent.p[0][1].equalsIgnoreCase("CIRCLE"))
                stringEntities.add(extractDXFArc(ent.p, true));
            else if (ent.p[0][1].equalsIgnoreCase("INSERT"))
                stringEntities.add(extractDXFReference(ent.p));
            else if (ent.p[0][1].equalsIgnoreCase("BLOCK"))
                stringEntities.add(extractDXFBlock(ent.p));
            else if (ent.p[0][1].equalsIgnoreCase("ENDBLK"))
                stringEntities.add(extractDXFEndBlock(ent.p));
            else if (ent.p[0][1].equalsIgnoreCase("POLYLINE"))
                stringEntities.add(extractDXFPolyline(ent.p));
            else if (ent.p[0][1].equalsIgnoreCase("VERTEX"))
                stringEntities.add(extractDXFVertex(ent.p));
            else if (ent.p[0][1].equalsIgnoreCase("SEQEND"))
                stringEntities.add(extractDXFSeqend(ent.p));
            else if (ent.p[0][1].equalsIgnoreCase("LWPOLYLINE"))
                stringEntities.addAll(extractDXFLwPolyline(ent.p));
            else if (ent.p[0][1].equalsIgnoreCase("HATCH"))
                stringEntities.addAll(extractDXFHatchBoundary(ent.p));
            else if (ent.p[0][1].equalsIgnoreCase("MTEXT"))
                stringEntities.add(extractDXFMText(ent.p));
            else if (ent.p[0][1].equalsIgnoreCase("TEXT"))
                stringEntities.add(extractDXFMText(ent.p));
            ent = null;
        }
        return stringEntities;
    }

    String[] extractDXFLine(String[][] prop) {
        String[] p = new String[8];
        p[0] = "LINE";
        // [1] layer
        // [2-4] p1
        // [5-7] p2
        for (int i = 0; i < prop.length; ++i) {
            if (prop[i][0].equals("8")) p[1] = prop[i][1];
            if (prop[i][0].equals("10"))
                p[2] = prop[i][1];
            else if (prop[i][0].equals("20"))
                p[3] = prop[i][1];
            else if (prop[i][0].equals("30"))
                p[4] = prop[i][1];
            else if (prop[i][0].equals("11"))
                p[5] = prop[i][1];
            else if (prop[i][0].equals("21"))
                p[6] = prop[i][1];
            else if (prop[i][0].equals("31")) p[7] = prop[i][1];
        }
        return p;
    }

    String[] extractDXFLayer(String[][] prop) {
        String[] p = new String[5];
        p[0] = "LAYER";
        // [1] name
        // [2] frozen/locked flag (70)
        // [3] color/off flag (62)
        // [2] plot flag (290)
        p[2] = p[3] = p[4] = "0";
        for (int i = 0; i < prop.length; ++i) {
            if (prop[i][0].equals("2"))
                p[1] = prop[i][1];
            else if (prop[i][0].equals("70"))
                p[2] = prop[i][1];
            else if (prop[i][0].equals("62"))
                p[3] = prop[i][1];
            else if (prop[i][0].equals("290")) p[4] = prop[i][1];
        }
        return p;
    }

    /**
     * MText translator
     * <p/>
     * [1] (8) layer
     * <p/>
     * [2] (2) name
     * <p/>
     * [3] (1) Text string. If the text string is less than 250 characters, all
     * characters appear in group 1. If the text string is greater than 250
     * characters, the string is divided into 250-character chunks, which appear
     * in one or more group 3 codes. If group 3 codes are used, the last group
     * is a group 1 and has fewer than 250 characters
     * <p/>
     * [4-6] (10,20,30) cF (insertion point xyz)
     * <p/>
     * [7] (40) Nominal (initial) text height
     * <p/>
     * [8] (41) Reference rectangle width
     */
    String[] extractDXFMText(String[][] prop) {
        /*
		 * Maybe make it into map? Map<Integer,String> extractDXFMText(String
		 * [][] prop) { Map<Integer,String> p = new HashMap<Integer,String>();
		 * p.put(0, "MTEXT"); p.put(30, "1"); p.put(40, "1"); p.put(41, "1");
		 * p.put(50, "0");
		 */
        String[] p = new String[10];
        p[0] = "MTEXT";

        p[6] = p[7] = p[8] = "1";
        p[9] = "0";
        for (int i = 0; i < prop.length; ++i) {
            if (prop[i][0].equals("8")) p[1] = prop[i][1];
            if (prop[i][0].equals("2")) p[2] = prop[i][1];
            if (prop[i][0].equals("1")) p[3] = prop[i][1];
            if (prop[i][0].equals("10")) p[4] = prop[i][1];
            if (prop[i][0].equals("20")) p[5] = prop[i][1];
            if (prop[i][0].equals("30")) p[6] = prop[i][1];
            if (prop[i][0].equals("40")) p[7] = prop[i][1];
            if (prop[i][0].equals("41")) p[8] = prop[i][1];
            if (prop[i][0].equals("50")) p[9] = prop[i][1];

        }
        return p;
    }

    String[] extractDXFBlock(String[][] prop) {
        String[] p = new String[5];
        p[0] = "BLOCK";
        // [1] name
        // [2-4] cF
        p[2] = p[3] = p[4] = "0";
        for (int i = 0; i < prop.length; ++i) {
            if (prop[i][0].equals("2"))
                p[1] = prop[i][1];
            else if (prop[i][0].equals("10"))
                p[2] = prop[i][1];
            else if (prop[i][0].equals("20"))
                p[3] = prop[i][1];
            else if (prop[i][0].equals("30")) p[4] = prop[i][1];
        }
        return p;
    }

    String[] extractDXFEndBlock(String[][] prop) {
        return new String[]{"ENDBLK"};
    }

    String[] extractDXFPolyline(String[][] prop) {
        String[] p = new String[7];
        p[0] = "POLYLINE";
        // [1] layer
        // [2] name
        // [3] flag (closed etc)
        // [4-6] cF
        p[4] = p[5] = p[6] = "0";
        p[1] = p[2] = p[3] = "";
        for (int i = 0; i < prop.length; ++i) {
            if (prop[i][0].equals("8")) p[1] = prop[i][1];
            if (prop[i][0].equals("2")) p[2] = prop[i][1];
            if (prop[i][0].equals("70")) p[3] = prop[i][1];
            if (prop[i][0].equals("10")) p[4] = prop[i][1];
            if (prop[i][0].equals("20")) p[5] = prop[i][1];
            if (prop[i][0].equals("30")) p[6] = prop[i][1];
        }
        return p;
    }

    String[] extractDXFVertex(String[][] prop) {
        String[] p = new String[4];
        p[0] = "VERTEX";
        // [1-3] cF
        p[1] = p[2] = p[3] = "0";
        for (int i = 0; i < prop.length; ++i) {
            if (prop[i][0].equals("10")) p[1] = prop[i][1];
            if (prop[i][0].equals("20")) p[2] = prop[i][1];
            if (prop[i][0].equals("30")) p[3] = prop[i][1];
        }
        return p;
    }

    String[] extractDXFSeqend(String[][] prop) {
        return new String[]{"SEQEND"};
    }

    private List<String[]> extractDXFLwPolyline(String[][] prop) {
        List<String[]> entities = new ArrayList<String[]>();
        String[] p = new String[7];
        // essentially disguise a lwpolyline to a typical polyline

        p[0] = "LWPOLYLINE";
        // [1] layer
        // [2] name
        // [3] flag (closed etc)
        // [4-6] cF (6 = elevation)
        p[1] = p[2] = p[3] = "";
        p[4] = p[5] = p[6] = "0";
        String[] v = new String[3];
        for (int i = 0; i < prop.length; ++i) {
            if (prop[i][0].equals("8")) p[1] = prop[i][1];
            if (prop[i][0].equals("2"))
                p[2] = prop[i][1];
            else if (prop[i][0].equals("70"))
                p[3] = prop[i][1];
            else if (prop[i][0].equals("38"))
                p[6] = prop[i][1];
            else if (prop[i][0].equals("10"))
                v[1] = prop[i][1];
            else if (prop[i][0].equals("20")) v[2] = prop[i][1];
            if (v[1] != null && v[2] != null) {
                v[0] = "VERTEX";
                entities.add(v);
                v = new String[3];
            }
        }
        entities.add(0, p);
        entities.add(entities.size(), new String[]{"SEQEND"});
        return entities;
    }

    private List<String[]> extractDXFHatchBoundary(String[][] prop) {
        List<String[]> entities = new ArrayList<String[]>();
        String[] p = new String[7];
        // essentially disguise a lwpolyline to a typical polyline

        p[0] = "HATCHBOUNDARY";
        // [1] layer
        // [2] name
        // [3] flag (closed etc)
        // [4-6] cF (6 = elevation)
        p[1] = p[3] = "";
        p[4] = p[5] = p[6] = "0";
        String[] v = new String[3];
        int vertexNum = 0;
        for (int i = 0; i < prop.length; ++i) {
            if (prop[i][0].equals("8")) p[1] = prop[i][1];
            if (prop[i][0].equals("2"))
                p[2] = prop[i][1];
            else if (prop[i][0].equals("70"))
                p[3] = prop[i][1];
            else if (prop[i][0].equals("38"))
                p[6] = prop[i][1];
            else if (prop[i][0].equals("93"))
                vertexNum = Integer.parseInt(prop[i][1].trim());
            else if (p[2] != null && vertexNum != 0) {
                if (prop[i][0].equals("10"))
                    v[1] = prop[i][1];
                else if (prop[i][0].equals("20")) v[2] = prop[i][1];
                if (v[1] != null && v[2] != null) {
                    v[0] = "VERTEX";
                    entities.add(v);
                    v = new String[3];
                    vertexNum--;
                }
            }
        }
        if (null == p[2] || p[2].trim().equals(""))
            return new ArrayList<String[]>();
        entities.add(0, p);
        entities.add(entities.size(), new String[]{"SEQEND"});
        return entities;
    }

    String[] extractDXFReference(String[][] prop) {

        String[] p = new String[10];
        p[0] = "INSERT";
        p[1] = p[2] = "";
        // [1] layer
        // [2] name
        // [3-5] cF
        // [6-8] sF
        // [9] angle
        p[6] = p[7] = p[8] = "1";
        p[9] = "0";
        for (int i = 0; i < prop.length; ++i) {
            if (prop[i][0].equals("8")) p[1] = prop[i][1];
            if (prop[i][0].equals("2")) p[2] = prop[i][1];
            if (prop[i][0].equals("10")) p[3] = prop[i][1];
            if (prop[i][0].equals("20")) p[4] = prop[i][1];
            if (prop[i][0].equals("30")) p[5] = prop[i][1];
            if (prop[i][0].equals("41")) p[6] = prop[i][1];
            if (prop[i][0].equals("42")) p[7] = prop[i][1];
            if (prop[i][0].equals("43")) p[8] = prop[i][1];
            if (prop[i][0].equals("50")) p[9] = prop[i][1];
        }

        return p;
    }

    String[] extractDXFArc(String[][] prop, boolean circle) {
        String[] p = new String[9];
        if (circle) {
            p[7] = "0";
            p[8] = "360";
        }
        p[0] = "ARC";
        // [1] layer
        // [2] name
        // [3-5] cF
        // [6] r
        // [7] as
        // [8] ae
        for (int i = 0; i < prop.length; ++i) {
            if (prop[i][0].equals("8")) p[1] = prop[i][1];
            if (prop[i][0].equals("2"))
                p[2] = prop[i][1];
            else if (prop[i][0].equals("10"))
                p[3] = prop[i][1];
            else if (prop[i][0].equals("20"))
                p[4] = prop[i][1];
            else if (prop[i][0].equals("30"))
                p[5] = prop[i][1];
            else if (prop[i][0].equals("40")) p[6] = prop[i][1];
            if (!circle) {
                if (prop[i][0].equals("50"))
                    p[7] = prop[i][1];
                else if (prop[i][0].equals("51")) p[8] = prop[i][1];
            }
        }
        return p;
    }
}
