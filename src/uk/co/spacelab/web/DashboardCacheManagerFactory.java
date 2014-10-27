package uk.co.spacelab.web;

import net.sf.ehcache.CacheManager;
import org.apache.shiro.util.Factory;

public class DashboardCacheManagerFactory implements Factory<CacheManager> {

	public CacheManager getInstance() {
		return CacheManager.create();
	}
}
