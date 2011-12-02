<?php 
namespace org\opencomb\mvcmerger ;

use org\opencomb\mvcmerger\struct\ui\filter\UILinkHrefFilter;
use org\jecat\framework\lang\aop\AOP;
use org\jecat\framework\system\Request;
use org\opencomb\ext\Extension ;
use org\jecat\framework\ui\xhtml\UIFactory ;
use org\jecat\framework\mvc\view\UIFactory as MvcUIFactory ; 

class MvcMerger extends Extension 
{
	/**
	 * 载入扩展
	 */
	public function load()
	{
		AOP::singleton()->register('org\\opencomb\\mvcmerger\\aspect\\ControlPanelFrameAspect') ;
		AOP::singleton()->register('org\\opencomb\\mvcmerger\\aspect\\ControllerMerge') ;
		AOP::singleton()->register('org\\opencomb\\mvcmerger\\aspect\\ControllerAspect') ;
	}

	public function active()
	{
		if(Request::singleton()->bool('mvcmerger_browser'))
		{
			// 为 ui 安装 链接 href属性的过滤器 
			UILinkHrefFilter::setupUiFilter(UIFactory::singleton()) ;
			UILinkHrefFilter::setupUiFilter(MvcUIFactory::singleton()) ;
		}
	}
}