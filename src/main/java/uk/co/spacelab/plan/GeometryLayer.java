package uk.co.spacelab.plan;

import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

//import org.eclipse.swt.widgets.TreeItem;

import uk.co.spacelab.common.MatrixMath;

public class GeometryLayer extends Layer {
	float xAxis = 1;
	float yAxis = -1;
	abstract class Entity {
		public String layer = "";
		String name;
		public double [] cF;
		Entity() {
			cF = new double [3];
		}
		void move(double [] offset) {
			if (offset.length > 3)
				new Exception("The move vector has more than 3 components")
						.printStackTrace();
			if (offset.length == 0)
				new Exception("The move vector has 0 components")
						.printStackTrace();

			for (int j = 0; j < offset.length; j++)
				cF[j] += offset[j];
		}
		abstract String toCSVString();
	}
	abstract class Geometry extends Entity {
		public double [] vF;
		Geometry() {
			super();
		}
		void move(double [] offset) {
			super.move(offset);
			for (int i = 0; i < vF.length; i += 3) {
				for (int j = 0; j < offset.length; j++)
					vF[i + j] += offset[j];
			}
		}
		void reCentre(double [] prevCentre) {
			for (int j = 0; j < prevCentre.length; j++)
				cF[j] -= prevCentre[j];
		}
		abstract String toDXFString();
	}
	public List<Line> linn = new ArrayList<Line>();
	public Polyline [] plines = new Polyline [0];
	public Arc [] arcs = new Arc [0];
	public Reference [] ref = new Reference [0];
	public MText [] mtext = new MText [0];
	public static float drawScale = 1f;
	int draw3D = 0;
	public boolean built = false;
	// float minX, maxX, minY, maxY, minZ, maxZ;
	public double [] limits = new double [6];
	double [] origin = new double [] {0, 0, 0};
	float [] gmvp;
	public int floor = 0, ID;
	public String floorReferenceID;
	boolean amIaBlock = false;
	String accPrefix = "acc-";
	public String floorName;
	public String building;
	public boolean display = true;
	boolean limitRecDisplay = false;
	// Space space;
	Map<String, String> geometryLayers;
	public Map<String, GeometryLayer> blockz;
	// public List<Integer> deleteLines;
	// ----------------- CREATION
	public GeometryLayer() {
	}
	// public GeometryLayer(Space space, String name) {
	// this.space = space;
	// this.name = name;
	// }
	public void resetObjects() {
		linn.clear();
		plines = new Polyline [0];
		arcs = new Arc [0];
		ref = new Reference [0];
		mtext = new MText [0];
	}
	public List<Entity> getAllObjects() {
		List<Entity> obj = new ArrayList<Entity>();
		obj.addAll(Arrays.asList(plines));
		obj.addAll(Arrays.asList(mtext));
		obj.addAll(linn);
		obj.addAll(Arrays.asList(arcs));
		obj.addAll(Arrays.asList(ref));
		return obj;
	}
	public void removeAllEntities(List<Entity> obj) {
		// selectedMTexts.clear();
		// selectedLines.clear();
		// selectedReferences.clear();
		// selectedPolylines.clear();
		// selectedArcs.clear();
		// for (Entity e : obj) {
		// if (e instanceof Polyline) {
		List<Line> newLines = new ArrayList<Line>();
		for (Line line : linn)
			if (!obj.contains(line)) newLines.add(line);
		// selectedLines.clear();
		linn.clear();
		addLines(newLines);
		// mlselected = null;
		List<MText> newMTexts = new ArrayList<MText>();
		for (MText mt : mtext)
			if (!obj.contains(mt)) newMTexts.add(mt);
		// selectedMTexts.clear();
		mtext = new MText [0];
		addMTexts(newMTexts);
		List<Reference> newReferences = new ArrayList<Reference>();
		for (Reference r : ref)
			if (!obj.contains(r)) newReferences.add(r);
		// selectedReferences.clear();
		ref = new Reference [0];
		addReferences(newReferences);
		List<Polyline> newPolylines = new ArrayList<Polyline>();
		for (Polyline poly : plines)
			if (!obj.contains(poly))
				newPolylines.add(poly);
			else System.out.println(name + " " + poly.layer);

		// selectedPolylines.clear();
		plines = new Polyline [0];
		addPolylines(newPolylines, true);
		List<Arc> newArcs = new ArrayList<Arc>();
		for (Arc arc : arcs)
			if (!obj.contains(arc)) newArcs.add(arc);
		// selectedArcs.clear();
		arcs = new Arc [0];
		addArcs(newArcs, true);
		getOwnLimits();

		// }
		// }
	}
	public void move(double [] offset) {
		for (GeometryLayer.Entity e : plines)
			e.move(offset);
		for (GeometryLayer.Entity e : mtext)
			e.move(offset);
		for (GeometryLayer.Entity e : linn)
			e.move(offset);
		for (GeometryLayer.Entity e : arcs)
			e.move(offset);
		for (GeometryLayer.Entity e : ref)
			e.move(offset);
		resetLimits(limits);
	}
	public BufferedImage getImage(int width) {
		double [] limits = getLimits();
		double minX = limits[0];
		double maxX = limits[1];
		double minY = limits[2];
		double maxY = limits[3];
		double rangeX = maxX - minX;
		double rangeY = maxY - minY;
		double ratio = rangeY / rangeX;
		return getImage(width, (int) (width * ratio));
	}
	public BufferedImage getImage(int width, int height) {

		// float minX, maxX, minY, maxY, minZ, maxZ;
		double [] limits = getLimits();
		double minX = limits[0];
		double maxX = limits[1];
		double minY = limits[2];
		double maxY = limits[3];
		double rangeX = maxX - minX;
		double rangeY = maxY - minY;
		double ratio = rangeY / rangeX;

		int smallest = width;
		if (width * ratio > height) smallest = height;
		System.out.println(minX + " " + maxX + " " + minY + " " + maxY + " "
				+ width + " " + height);
		// on osx when the below method is executed a "bootstrap" application
		// pops up in thedock probably because BufferedImage is part of AWT. To
		// avoid this add "java.awt.headless=true" to catalina.properties (a
		// tomcat server setting), or "-Djava.awt.headless=true" as a vm
		// argument for eclipse
		BufferedImage image =
				new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
		Graphics2D g2d = image.createGraphics();

		double iMaxMinX, iMaxMinY;
		int offsetX, offsetY;
		iMaxMinX = smallest / (maxX - minX);
		iMaxMinY = smallest * ratio / (maxY - minY);
		offsetY = (int) (height * 0.5 - (rangeY * 0.5) * iMaxMinY);
		offsetX = 0;
		if (width * ratio > height) {
			iMaxMinX = smallest / ((maxX - minX) * ratio);
			iMaxMinY = smallest / rangeY;
			offsetY = 0;
			offsetX = (int) (width * 0.5 - (rangeX * 0.5) * iMaxMinX);
		}
		g2d.setBackground(Color.white);
		g2d.setColor(Color.black);
		g2d.clearRect(0, 0, width, height);
		g2d.setStroke(new BasicStroke());
		for (Line line : linn)
			g2d.drawLine( //
					offsetX + (int) ((-minX + line.vF[0]) * iMaxMinX), //
					height - offsetY - (int) ((-minY + line.vF[1]) * iMaxMinY), //
					offsetX + (int) ((-minX + line.vF[3]) * iMaxMinX), //
					height - offsetY - (int) ((-minY + line.vF[4]) * iMaxMinY));
		for (Polyline pline : plines) {
			for (int i = 0; i < pline.vF.length - 3; i += 3) {
				g2d.drawLine(
						//
						offsetX + (int) ((-minX + pline.vF[i + 0]) * iMaxMinX), //
						height - offsetY
								- (int) ((-minY + pline.vF[i + 1]) * iMaxMinY), //
						offsetX + (int) ((-minX + pline.vF[i + 3]) * iMaxMinX), //
						height - offsetY
								- (int) ((-minY + pline.vF[i + 4]) * iMaxMinY));
			}
			if (pline.closed) g2d.drawLine(
					//
					offsetX + (int) ((-minX + pline.vF[pline.vF.length - 6])
							* iMaxMinX), //
					height - offsetY
							- (int) ((-minY + pline.vF[pline.vF.length - 5])
									* iMaxMinY), //
					offsetX + (int) ((-minX + pline.vF[pline.vF.length - 3])
							* iMaxMinX), //
					height - offsetY
							- (int) ((-minY + pline.vF[pline.vF.length - 2])
									* iMaxMinY));
		}
		for (Arc arc : arcs) {
			g2d.drawArc(offsetX + (int) ((-minX + arc.cF[0]) * iMaxMinX),
					height - offsetY - (int) ((-minY + arc.cF[1]) * iMaxMinY),
					(int) (arc.r * 2), (int) (arc.r * 2), (int) (arc.as),
					(int) (arc.ae - arc.as));
		}
		g2d.dispose();
		return image;
	}
//@formatter:off
	public String lineToCSV(double x1,double y1,double z1, double x2, double y2, double z2) {
		return String.format("%.4f", xAxis*(x1)) + "," 
			 + String.format("%.4f", yAxis*(y1)) + "," 
			 + String.format("%.4f", xAxis*(x2)) + "," 
			 + String.format("%.4f", yAxis*(y2));
	}
	public String lineToCSV(double [] vF, double [] c) {
		return String.format("%.4f", xAxis*(vF[0]-c[0])) + "," 
			 + String.format("%.4f", yAxis*(vF[1]-c[1])) + "," 
			 + String.format("%.4f", xAxis*(vF[3]-c[0])) + "," 
			 + String.format("%.4f", yAxis*(vF[4]-c[1]));
	}
	public double [] lineToDoubleArray(double x1,double y1,double z1, double x2, double y2, double z2) {
		return new double [] { xAxis*x1,yAxis*(y1), xAxis*x2, yAxis*(y2)};
	}
	public double [] lineToDoubleArray(double [] vF, double [] c) {
		return new double [] { xAxis*(vF[0]-c[0]),  yAxis*(vF[1]-c[1]),
			 xAxis*(vF[3]-c[0] ), yAxis*(vF[4]-c[1])};
	}
	public double [] getCentre() {
		return new double [] {
			(limits[1]+limits[0])*0.5f,
			(limits[3]+limits[2])*0.5f,
			(limits[5]+limits[4])*0.5f
		};
	}
	public List<String> getAsCSV() {
		List<String> csv = new ArrayList<String>();
			for (GeometryLayer.Entity e : plines)
				csv.add(e.toCSVString());
			for (GeometryLayer.Entity e : mtext)
				csv.add(e.toCSVString());
			for (GeometryLayer.Entity e : linn)
				csv.add(e.toCSVString());
			for (GeometryLayer.Entity e : arcs)
				csv.add(e.toCSVString());
			for (GeometryLayer.Entity e : ref)
				csv.add(e.toCSVString());
			return csv;
	}
	public List<String> getLines(double [] c) {
		List<String> result = new ArrayList<String>();
//		float [] c = getCentre();
		for(Line l:linn) result.add(lineToCSV(l.vF,c));
		for(Polyline p:plines) {
			for(int i = 0; i < p.vF.length-3; i+=3) 
				result.add(lineToCSV(
					p.vF[i]-c[0],p.vF[i+1]-c[1],p.vF[i+2]-c[2],
					p.vF[i+3]-c[0],p.vF[i+4]-c[1],p.vF[i+5]-c[2]
				));
			if(p.closed && p.vF.length > 6) 
				result.add(lineToCSV(
					p.vF[p.vF.length-3]-c[0],p.vF[p.vF.length-2]-c[1],p.vF[p.vF.length-1]-c[2],
					p.vF[0]-c[0],p.vF[1]-c[1],p.vF[2]-c[2]
				));
		}
		for(Arc a:arcs) {
			for(int i = 0; i < a.vF.length-3; i+=3) 
				result.add(lineToCSV(
					a.vF[i]-c[0],a.vF[i+1]-c[1],a.vF[i+2]-c[2],
					a.vF[i+3]-c[0],a.vF[i+4]-c[1],a.vF[i+5]-c[2]
				));
			if(a.coverAngle == 360) 
				result.add(lineToCSV(
					a.vF[a.vF.length-3]-c[0],a.vF[a.vF.length-2]-c[1],a.vF[a.vF.length-1]-c[2],
					a.vF[0]-c[0],a.vF[1]-c[1],a.vF[2]-c[2]
				));
		}
		return result;
	}
	public List<double[]> getLineList(double [] c) {
		List<double[] > result = new ArrayList<double[] >();
//		float [] c = getCentre();
		for(Line l:linn) result.add(lineToDoubleArray(l.vF,c));
		for(Polyline p:plines) {
			for(int i = 0; i < p.vF.length-3; i+=3) 
				result.add(lineToDoubleArray(
					p.vF[i]-c[0],p.vF[i+1]-c[1],p.vF[i+2]-c[2],
					p.vF[i+3]-c[0],p.vF[i+4]-c[1],p.vF[i+5]-c[2]
				));
			if(p.closed && p.vF.length > 6) 
				result.add(lineToDoubleArray(
					p.vF[p.vF.length-3]-c[0],p.vF[p.vF.length-2]-c[1],p.vF[p.vF.length-1]-c[2],
					p.vF[0]-c[0],p.vF[1]-c[1],p.vF[2]-c[2]
				));
		}
		for(Arc a:arcs) {
			for(int i = 0; i < a.vF.length-3; i+=3) 
				result.add(lineToDoubleArray(
					a.vF[i]-c[0],a.vF[i+1]-c[1],a.vF[i+2]-c[2],
					a.vF[i+3]-c[0],a.vF[i+4]-c[1],a.vF[i+5]-c[2]
				));
			if(a.coverAngle == 360) 
				result.add(lineToDoubleArray(
					a.vF[a.vF.length-3]-c[0],a.vF[a.vF.length-2]-c[1],a.vF[a.vF.length-1]-c[2],
					a.vF[0]-c[0],a.vF[1]-c[1],a.vF[2]-c[2]
				));
		}
		return result;
	}
	//@formatter:on
	public void getOwnLimits() {
		resetLimits(limits);
		getLimits(this, 0, MatrixMath.getIdentity());

	}
	public GeometryLayer(final GeometryLayer imported, float scale,
			String spaceReferenceID, int space, String spaceName,
			String building) {
		this.floor = space;
		this.floorReferenceID = spaceReferenceID;
		this.floorName = spaceName;
		this.building = building;
		gmvp = MatrixMath.getIdentityf();
		drawScale = scale;
		resetLimits(limits);
		transferObjects(imported);
		built = true;
		getOwnLimits();
	}
	public GeometryLayer(List<String []> entities, float scale,
			String spaceReferenceID, int space, String spaceName,
			String building) {
		this.floor = space;
		this.floorReferenceID = spaceReferenceID;
		this.floorName = spaceName;
		this.building = building;
		gmvp = MatrixMath.getIdentityf();
		drawScale = scale;
		resetLimits(limits);
		addObjects(entities, MatrixMath.getIdentity());
		built = true;
		getOwnLimits();
	}
	public GeometryLayer(String [] prop, float scale) {
		amIaBlock = true;
		resetLimits(limits);
		GeometryLayer.drawScale = scale;
		name = prop[1];
		for (int i = 0; i < origin.length; ++i) {
			origin[i] = Double.parseDouble(prop[i + 2]) * drawScale;
		}
		built = true;

	}
	public List<String> getAsDXF() {
		List<String> result = new ArrayList<String>();
		for (Polyline p : plines)
			result.add(p.toDXFString());
		for (Line l : linn)
			result.add(l.toDXFString());
		for (MText t : mtext)
			result.add(t.toDXFString());
		for (Arc a : arcs)
			result.add(a.toDXFString());

		return result;
	}
	public void reCentre() {
		double [] c = getCentre();
		for (Line l : linn)
			l.reCentre(c);
		for (Polyline p : plines)
			p.reCentre(c);
		for (Arc a : arcs)
			a.reCentre(c);
		for (Reference r : ref)
			r.reCentre(c);
		for (MText t : mtext)
			t.reCentre(c);
		resetLimits(limits);
		getLimits(this, 0, MatrixMath.getIdentity());
	}
	void transferObjects(GeometryLayer oh) {
		linn = oh.linn;
		plines = oh.plines;
		arcs = oh.arcs;
		ref = oh.ref;
		mtext = oh.mtext;
	}
	public void addObjects(List<String []> entityList, double [] transform) {
		List<Line> lineList = new ArrayList<Line>();
		List<Reference> refList = new ArrayList<Reference>();
		List<Arc> arcList = new ArrayList<Arc>();
		List<MText> mtextList = new ArrayList<MText>();
		for (String [] ent : entityList) {
			if (ent[0].equalsIgnoreCase("LINE")) lineList.add(new Line(ent));
			if (ent[0].equalsIgnoreCase("INSERT"))
				refList.add(new Reference(ent, transform));
			if (ent[0].equalsIgnoreCase("ARC")) arcList.add(new Arc(ent));
			if (ent[0].equalsIgnoreCase("MTEXT")) mtextList.add(new MText(ent));
		}
		addLines(lineList);
		addPolylines(entityList);
		addReferences(refList);
		addArcs(arcList);
		addMTexts(mtextList);
	}
	public void addMTexts(List<MText> mtextList) {
		// mtext = new MText [mtextList.size()];
		// mtextList.toArray(mtext);
		// mtextList = null;
		MText [] temp = new MText [mtext.length + mtextList.size()];
		System.arraycopy(mtext, 0, temp, 0, mtext.length);
		System.arraycopy(mtextList.toArray(), 0, temp, mtext.length,
				mtextList.size());
		mtext = temp;
		temp = null;
		mtextList = null;
	}
	public void addArcs(List<Arc> arcList, boolean erase) {
		if (erase) arcs = new Arc [0];
		Arc [] temp = new Arc [arcs.length + arcList.size()];
		System.arraycopy(arcs, 0, temp, 0, arcs.length);
		System.arraycopy(arcList.toArray(), 0, temp, arcs.length,
				arcList.size());
		arcs = temp;
		temp = null;
		arcList = null;
	}
	public void addArcs(List<Arc> arcList) {
		Arc [] temp = new Arc [arcs.length + arcList.size()];
		System.arraycopy(arcs, 0, temp, 0, arcs.length);
		System.arraycopy(arcList.toArray(), 0, temp, arcs.length,
				arcList.size());
		arcs = temp;
		temp = null;
		arcList = null;
	}
	public void addReferences(List<Reference> refList) {
		Reference [] temp = new Reference [ref.length + refList.size()];
		System.arraycopy(ref, 0, temp, 0, ref.length);
		System.arraycopy(refList.toArray(), 0, temp, ref.length,
				refList.size());
		ref = temp;
		temp = null;
		refList = null;
		// for(int i = 0; i < refList.size(); i++)
		// tempRef[ref.length + i] = refList.get(i);
		// ref = tempRef;
	}
	public void addLines(List<Line> lineList) {
		linn.addAll(lineList);
		lineList = null;
	}
	public void addPolylines(List<Polyline> polyList, boolean erase) {
		if (erase) plines = new Polyline [0];
		Polyline [] temp = new Polyline [plines.length + polyList.size()];
		System.arraycopy(plines, 0, temp, 0, plines.length);
		System.arraycopy(polyList.toArray(), 0, temp, plines.length,
				polyList.size());
		plines = temp;
		temp = null;
		polyList = null;
	}
	void addPolylines(List<String []> entityList) {
		Polyline newPoly = null;
		List<Vertex> vertexList = new ArrayList<Vertex>();
		List<Polyline> polyList = new ArrayList<Polyline>();
		for (String [] entry : entityList) {
			if (entry[0].equalsIgnoreCase("POLYLINE")
					|| entry[0].equalsIgnoreCase("LWPOLYLINE")
			// || entry[0].equalsIgnoreCase("HATCHBOUNDARY")
			) newPoly = new Polyline(entry);
			if (newPoly != null) {
				if (entry[0].equalsIgnoreCase("SEQEND")) {
					newPoly.populate(vertexList);
					polyList.add(newPoly);
					vertexList.clear();
					newPoly = null;
				} else {
					if (entry[0].equalsIgnoreCase("VERTEX"))
						vertexList.add(new Vertex(entry));

				}
			}
		}

		addPolylines(polyList, false);

		// plines = new Polyline [polyList.size()];
		// polyList.toArray(plines);
	}

	// ----------------- LIMITS

	public double [] getLimits(GeometryLayer primary, int depth,
			double [] hierarchyTransform) {
		for (int i = 0; i < plines.length; i++)
			plines[i].translatedLimits(this, hierarchyTransform);
		for (Line l : linn)
			l.translatedLimits(this, hierarchyTransform);
		for (int i = 0; i < arcs.length; i++)
			arcs[i].translatedLimits(this, hierarchyTransform);
		for (int i = 0; i < ref.length; i++)
			ref[i].checkInternalMaxMin(this, primary, depth,
					hierarchyTransform);

		return limits;
	}

	public void checkMaxMin(Double x, Double y, Double z,
			double [] theseLimits) {
		checkLimit(new Double [] {x, y, z}, theseLimits, 1);
		checkLimit(new Double [] {x, y, z}, theseLimits, -1);
	}
	public void checkLimit(Double [] vector, double [] theseLimits,
			int modMaxMin) {
		for (int i = 0; i < 3; i++)
			if (vector[i] != null && modMaxMin * vector[i] > modMaxMin
					* theseLimits[2 * i + (int) ((modMaxMin + 1) * 0.5f)])
				theseLimits[2 * i + (int) ((modMaxMin + 1) * 0.5f)] = vector[i];
	}
	public void resetLimits(double [] oLim) {
		oLim[0] = oLim[2] = oLim[4] = Double.MAX_VALUE;
		oLim[1] = oLim[3] = oLim[5] = -Double.MAX_VALUE;
	}
	public double [] getLimitsCoordinates(double [] limits) {
		double [] vertexCoords = new double [] {
				//@formatter:off
				limits[0], limits[2], 0f,
				limits[0], limits[3], 0f,
				limits[1], limits[3], 0f,
				limits[1], limits[2], 0f,
				limits[0], limits[3], 0f,
				limits[1], limits[3], 0f,
				limits[0], limits[2], 0f,
				limits[1], limits[2], 0f
				//@formatter:on
		};
		return vertexCoords;
	}
	public double [] getLimits() {
		return limits;
	}

	// ------------------ CLASSES

	public class Reference extends Entity {
		GeometryLayer primary;
		public String layer = "0";
		String blockname;
		double [] cF = new double [3];
		double [] sF = new double [3];
		float angle;
		double [] transform;
		double [] refLimits = new double [6];
		Reference(String [] prop, double [] prevTransform) {
			super();
			resetLimits(refLimits);
			layer = prop[1];
			blockname = prop[2];
			for (int i = 0; i < 3; i++)
				cF[i] = Double.parseDouble(prop[i + 3]) * drawScale;
			for (int i = 0; i < 3; i++)
				sF[i] = Double.parseDouble(prop[i + 6]);
			angle = Float.parseFloat(prop[9]);
			angle = (float) Math.toRadians(angle);
			transform = MatrixMath.getIdentity();
			transform = MatrixMath.apply(transform, prevTransform);
			updateTransform(origin[0], origin[1], origin[2]);
		}
		public String toCSVString() {
			String line = "INSERT," + layer + "," + blockname;
			for (int i = 0; i < 3; i++)
				line += "," + cF[i];
			for (int i = 0; i < 3; i++)
				line += "," + sF[i];
			line += Math.toDegrees(angle);
			return line;
		}
		void reCentre(double [] prevCentre) {
			for (int i = 0; i < cF.length; i++)
				cF[i] -= prevCentre[i];
			updateTransform(0, 0, 0);
		}
		void checkInternalMaxMin(GeometryLayer parent, GeometryLayer primary,
				int depth, double [] mvp) {
			this.primary = primary;
			GeometryLayer b = blockz.get(blockname);
			resetLimits(refLimits);
			b.resetLimits(b.limits);
			double [] blockLimits =
					b.getLimits(primary, depth + 1,
							MatrixMath.apply(mvp, transform));
			checkLimit(new Double [] {blockLimits[0], blockLimits[2],
					blockLimits[4]}, refLimits, -1);
			checkLimit(new Double [] {blockLimits[1], blockLimits[3],
					blockLimits[5]}, refLimits, 1);
			checkLimit(new Double [] {refLimits[0], refLimits[2], refLimits[4]},
					parent.limits, -1);
			checkLimit(new Double [] {refLimits[1], refLimits[3], refLimits[5]},
					parent.limits, 1);

		}
		void updateTransform(double [] external) {
			transform = MatrixMath.apply(external, transform);
		}
		void updateTransform(double x, double y, double z) {
			transform = MatrixMath.getIdentity();
			transform = MatrixMath.scale(transform, sF[0], sF[1], sF[2]);
			transform = MatrixMath.rotate(transform, -(float) angle, 0, 0, 1);
			transform[12] += x + cF[0];
			transform[13] += y + cF[1];
			transform[14] += z + cF[2];
		}

	}

	float multi = 0;

	public class Arc extends Geometry {
		float r, as, ae, coverAngle;

		Arc(String [] prop) {
			super();
			layer = prop[1];
			cF[0] = Double.parseDouble(prop[3]) * drawScale;
			cF[1] = Double.parseDouble(prop[4]) * drawScale;
			cF[2] = Double.parseDouble(prop[5]) * drawScale;
			r = Float.parseFloat(prop[6]) * drawScale;
			as = Float.parseFloat(prop[7]);
			ae = Float.parseFloat(prop[8]);
			coverAngle = ae - as;
			if (coverAngle < 0) coverAngle += 360;

			// if(yAxis == -1)
			int sides = 16;
			vF = new double [3 * (sides + 1)];
			for (int i = 0; i < sides + 1; ++i) {
				float newAngle =
						(float) (Math.toRadians(as + i * coverAngle / sides)
								+ Math.PI * 0.5f);
				vF[3 * i] = cF[0] + r * (float) Math.sin(newAngle);
				vF[3 * i + 1] = cF[1] + -r * (float) Math.cos(newAngle);
				vF[3 * i + 2] = cF[2];
			}
		}
		public String toCSVString() {
			String line = "ARC," + layer + ",";
			for (int i = 0; i < cF.length; i++) {
				line += "," + cF[i];
			}
			line += "," + r + "," + as + "," + ae;
			return line;
		}
		public void reCentre(double [] c) {
			super.reCentre(c);
			for (int i = 0; i < vF.length; i += 3) {
				vF[i] -= c[0];
				vF[i + 1] -= c[1];
				vF[i + 2] -= c[2];
			}
		}

		void translatedLimits(GeometryLayer parent,
				double [] hierarchyTransform) {
			for (int i = 0; i < vF.length; i += 3) {
				double [] point = {vF[i], vF[i + 1], vF[i + 2], 1f};
				point = MatrixMath.apply(hierarchyTransform, point);
				checkMaxMin(point[0], point[1], point[2], parent.limits);
			}
		}
		@Override
		String toDXFString() {
			// String lb = ProjectIO.lineSeperator;
			// String s =
			// "0" + lb + "ARC" + lb + "8" + lb + layer + lb + "70" + lb
			// + "129";
			// for (int i = 0; i < vF.length; i += 3)
			// s +=
			// lb + "10" + lb + (vF[i] / drawScale) + lb + "20" + lb
			// + "-" + (vF[i + 1] / drawScale);
//			//@formatter:off
//			return Math.abs(coverAngle - 360) < 0.001 ? 
//					ProjectIO.wrapDXFProperties(
//							"0", "CIRCLE",
//							"8", layer,
//							"10",cF[0] / drawScale,
//							"20",cF[1] / drawScale,
//							"30",cF[2] / drawScale,
//							"40", r
//					) : 
//					ProjectIO.wrapDXFProperties(
//							"0", "ARC",
//							"8", layer,
//							"10", cF[0] / drawScale,
//							"20", cF[1] / drawScale,
//							"30", cF[2] / drawScale,
//							"40", r,
//							"50", as,
//							"51", ae
//					);
			//@formatter:on
			return null;
		}
	}

	class Vertex {
		double x, y, z;
		Vertex(String [] prop) {
			x = Double.parseDouble(prop[1]) * drawScale;
			y = Double.parseDouble(prop[2]) * drawScale;
			if (prop.length > 3)
				z = Double.parseDouble(prop[3]) * drawScale;
			else z = 0;
		}
	}
	public class Polyline extends Geometry {
		public boolean closed;
		double [] transform;
		boolean accommodation;
		Polyline(String [] prop) {
			super();
			closed = false;
			layer = prop[1];
			if (layer.toLowerCase().contains(accPrefix.toLowerCase()))
				accommodation = true;
			name = prop[2];
			if (name.equals("")) name = String.valueOf(this.hashCode());
			if (prop[3].equals("129") || prop[3].equals("1")
					|| prop[3].equals("32"))
				closed = true;
			cF[0] = Double.parseDouble(prop[4]) * drawScale;
			cF[1] = Double.parseDouble(prop[5]) * drawScale;
			cF[2] = Double.parseDouble(prop[6]) * drawScale;
			transform = MatrixMath.getIdentity();
			if (prop.length > 7) {
				List<Vertex> vertices = new ArrayList<Vertex>();
				for (int i = 7; i < prop.length; i += 3) {
					vertices.add(new Vertex(
							new String [] {"", prop[i], prop[1 + i],
									prop[2 + i]}));
				}
				populate(vertices);
			}
		}
		public String toCSVString() {
			String line =
					"POLYLINE," + layer + "," + name + (closed ? ",1" : ",0")
							+ "," + cF[0] + "," + cF[1] + "," + cF[2];
			for (double v : vF) {
				line += "," + v;
			}
			return line;
		}
		public void reCentre(double [] c) {
			cF[0] -= c[0];
			cF[1] -= c[1];
			cF[2] -= c[2];
			for (int i = 0; i < vF.length; i += 3) {
				vF[i] -= c[0];
				vF[i + 1] -= c[1];
				vF[i + 2] -= c[2];
			}
		}
		void updateTransform(double [] external) {
			transform = MatrixMath.apply(external, transform);
		}
		void translatedLimits(GeometryLayer parent,
				double [] hierarchyTransform) {
			for (int i = 0; i < vF.length; i += 3) {
				double [] point = {vF[i], vF[i + 1], vF[i + 2], 1f};
				point = MatrixMath.apply(hierarchyTransform, point);
				checkMaxMin(point[0], point[1], point[2], parent.limits);
			}
		}
		void populate(List<Vertex> vertices) {
			vF = new double [vertices.size() * 3];
			for (int i = 0; i < vertices.size(); i++) {
				vF[3 * i] = vertices.get(i).x;
				vF[3 * i + 1] = vertices.get(i).y;
				vF[3 * i + 2] = vertices.get(i).z;
			}
		}

		public Map<String, Object> getPropertiesMap() {
			Map<String, Object> prop = new HashMap<String, Object>();
			prop.put("name", name);
			prop.put("layer", layer);
			prop.put("closed", closed ? 1 : 0);
			prop.put("stride", "3");
			return prop;
		}
		public double [] getVertexCoords() {
			return vF;
		}
		String toDXFString() {
			return toDXFStringAsLWPOLYLINE();
		}
		String toDXFStringAsLWPOLYLINE() {

			// String result =
			// ProjectIO.wrapDXFProperties("0", "LWPOLYLINE", "8", layer,
			// "70", "1");
			// // @formatter:on
			//
			// for (int i = 0; i < vF.length; i += 3) {
			// result +=
			// ProjectIO.wrapDXFProperty("10",
			// String.valueOf(vF[i] / drawScale));
			// result +=
			// ProjectIO.wrapDXFProperty("20",
			// String.valueOf(vF[i + 1] / drawScale));
			// }
			// return result;
			//
			// // return ProjectIO.wrapDXFProperties(
			// // "0", "LWPOLYLINE",
			// // "8", layer,
			// // "70", 129,
			// // "10", cX / drawScale,
			// // "20", cY / drawScale,
			// // "30", cZ / drawScale,
			// // "40", r,
			// // "50", as,
			// // "51", ae
			// // );
			return null;
		}
	}

	public class Line extends Geometry {
		// public double []

		Line(String [] prop) {
			super();
			vF = new double [6];
			layer = prop[1];
			for (int i = 0; i < vF.length; i++) {
				vF[i] = Double.parseDouble(prop[i + 2]) * drawScale;
			}
		}
		String toCSVString() {
			String line = "LINE," + layer;
			for (int i = 0; i < vF.length; i++)
				line += "," + (vF[i] / drawScale);
			return line;
		}
		public void reCentre(double [] c) {
			for (int i = 0; i < vF.length; i += 3) {
				vF[i] -= c[0];
				vF[i + 1] -= c[1];
				vF[i + 2] -= c[2];
			}

		}

		Line(float x1, float y1, float z1, float x2, float y2, float z2) {
			vF[0] = x1;
			vF[1] = y1;
			vF[2] = z1;
			vF[3] = x2;
			vF[4] = y2;
			vF[5] = z2;
		}
		void translatedLimits(GeometryLayer parent,
				double [] hierarchyTransform) {
			for (int i = 0; i < vF.length; i += 3) {
				double [] point =
						{(float) vF[i], (float) vF[i + 1], (float) vF[i + 2],
								1f};
				point = MatrixMath.apply(hierarchyTransform, point);
				checkMaxMin((double) point[0], (double) point[1],
						(double) point[2], parent.limits);
			}
		}
		void draw(float x, float y, float z, float sX, float sY, float sZ) {
			// line(x + p1x, yAxis * (y + p1y), z + p1z, x + p2x, yAxis
			// * (y + p2y), (z + p2z) * draw3D);
		}
		String toDXFString() {

			//@formatter:off
//			String result =
//				ProjectIO.wrapDXFProperties(
//					"0", "LINE", 
//					"8", layer,
//					"10", vF[0]/drawScale,
//					"20", vF[1]/drawScale,
//					"30", vF[2]/drawScale,
//					"11", vF[3]/drawScale,
//					"21", vF[4]/drawScale,
//					"31", vF[5]/drawScale
//				);
//			//@formatter:on
			//
			// return result;
			return null;
		}

		void updateGLView() {

		}
	}

	public class MText extends Entity {
		// public double cX;
		// public double cY;
		// double cZ;
		float w;
		float h;
		float a;
		public String s;
		MText(String [] prop) {
			super();
			layer = prop[1];
			name = prop[2];
			s = prop[3];
			cF[0] = Double.parseDouble(prop[4]) * drawScale;
			cF[1] = Double.parseDouble(prop[5]) * drawScale;
			cF[2] = Double.parseDouble(prop[6]) * drawScale;
			h = Float.parseFloat(prop[7]) * drawScale;
			w = Float.parseFloat(prop[8]) * drawScale;
			a = Float.parseFloat(prop[9]); // angle of rotation
		}
		public String toCSVString() {
			String clean = s.replace(',', '.');
			String line =
					"MTEXT," + layer + "," + (name == null ? "" : name) + ","
							+ clean;
			for (int i = 0; i < 3; i++) {
				line += "," + cF[i];
			}
			line += "," + h + "," + w + "," + a;
			return line;
		}
		void reCentre(double [] prevCentre) {
			cF[0] -= prevCentre[0];
			cF[1] -= prevCentre[1];
		}
		String toDXFString() {
			//@formatter:off
//			String result =
//				ProjectIO.wrapDXFProperties(
//					"0", "TEXT", 
//					"8", layer,
//					"1", s,
//					"7", "Arial",
//					"10", cF[0]/drawScale,
//					"20", cF[1]/drawScale,
//					"30", cF[2]/drawScale,
//					"40", h/drawScale,
//					"41", 1
//				);
			//@formatter:on
			//
			// return result;
			return null;
		}
	}

	public void setProperties(int floor, String floorName, String building) {
		this.floor = floor;
		this.floorName = floorName;
		this.building = building;

	}
	public Polyline [] getPolyLines() {
		return plines;
	}
	public Map<String, String> getAllLayersFromObjects() {
		if (geometryLayers == null) {
			geometryLayers = new HashMap<String, String>();
			geometryLayers.putAll(findLayersInGeometry(linn, true));
			geometryLayers.putAll(findLayersInGeometry(plines, true));
			geometryLayers.putAll(findLayersInGeometry(arcs, true));
			geometryLayers.putAll(findLayersInGeometry(mtext, true));
			geometryLayers.putAll(findLayersInGeometry(ref, true));
		}
		return geometryLayers;
	}
	public Map<String, String> findLayersInGeometry(List<Line> entities,
			boolean forceLowerCase) {
		return findLayersInGeometry(
				entities.toArray(new Line [entities.size()]), forceLowerCase);
	}
	public Map<String, String> findLayersInGeometry(Entity [] entities,
			boolean forceLowerCase) {
		Map<String, String> layers = new HashMap<String, String>();
		for (Entity e : entities) {
			layers.put(forceLowerCase ? e.layer.toLowerCase() : e.layer,
					e.layer);
		}
		return layers;
	}
	@Override
	public void draw(float [] mvp) {
		// TODO Auto-generated method stub

	}
}
