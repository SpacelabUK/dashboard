package uk.co.spacelab.backend;

import java.util.Map;

public class Util {

	public static boolean
			validParam(Map<String, String []> params, String param) {
		return params.containsKey(param) && params.get(param) != null
				&& params.get(param).length == 1;
	}
}
