package uk.co.spacelab.plan;

import java.util.ArrayList;
import java.util.List;

public abstract class Layer implements LayerTree {
	boolean isLayer = true;
	public String name;
	int [] flags = new int [3];
	public boolean display;
	public Layer() {

	}
	public Layer(String [] prop) {
		name = prop[1];
		for (int i = 0; i < flags.length; i++)
			flags[i] = Integer.parseInt(prop[i + 2]);
	}
	@Override
	public void printR(int depth) {
		depth++;
	}
	public LayerTree findChild(String childName) {
		return this;
	}
	@Override
	public LayerTree getChild(String childName) {
		return this;
	}
	public List<Layer> getAllChildren() {
		List<Layer> result = new ArrayList<Layer>();
		result.add(this);
		return result;
	}
	abstract public void draw(float [] mvp);
}
