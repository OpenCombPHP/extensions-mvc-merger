<?php 
namespace org\opencomb\mvcmerger ;

use org\opencomb\mvcmerger\merger\ui\UIObjectBrowserInfo;

use org\jecat\framework\lang\oop\ClassLoader;
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
		AOP::singleton()->register('org\\opencomb\\mvcmerger\\aspect\\ViewLayoutSetting') ;
		AOP::singleton()->register('org\\opencomb\\mvcmerger\\aspect\\MVCBrowser') ;
	}

	public function active()
	{
		// for MVC Browser ---------
		if(Request::singleton()->bool('mvcmerger_browser'))
		{
			// 为 ui 安装 链接 href属性的过滤器 
			UILinkHrefFilter::setupUiFilter(UIFactory::singleton()) ;
			UILinkHrefFilter::setupUiFilter(MvcUIFactory::singleton()) ;
		}
		
		// for UI Object Browser ---------
		if(Request::singleton()->bool('mvcmerger_ui_browser'))
		{
			\org\opencomb\advcmpnt\lib\LibManager::singleton()->loadLibrary('jquery') ;
			\org\opencomb\advcmpnt\lib\LibManager::singleton()->loadLibrary('jquery.ui') ;
			\org\jecat\framework\resrc\HtmlResourcePool::singleton()->addRequire('mvc-merger:js/uitemplate-weave.js',\org\jecat\framework\resrc\HtmlResourcePool::RESRC_JS) ;
			echo __METHOD__ ;
			
			$aUIParser = new UIObjectBrowserInfo ;
			
			UIFactory::singleton()->interpreterManager()->add($aUIParser) ;
			UIFactory::singleton()->calculateCompileStrategySignture() ; // 重新计算 ui 的编译策略签名
			
			MvcUIFactory::singleton()->interpreterManager()->add($aUIParser) ;
			MvcUIFactory::singleton()->calculateCompileStrategySignture() ; // 重新计算 ui 的编译策略签名
		}
	}
	
	static public function clearClassCompiled($sClass)
	{
		if( $aClassFile = ClassLoader::singleton()->searchClass($sClass,ClassLoader::SEARCH_COMPILED) )
		{
			$aClassFile->delete() ;
		}
	} 
}