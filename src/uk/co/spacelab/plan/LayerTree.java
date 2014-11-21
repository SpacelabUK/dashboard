package uk.co.spacelab.plan;

//import java.util.HashMap;
//import java.util.Iterator;
import java.util.List;
//import java.util.Map;

public interface LayerTree {
	public void printR(int depth);
	public LayerTree getChild(String childName);
	public LayerTree findChild(String childName);
	public List<Layer> getAllChildren();
}
