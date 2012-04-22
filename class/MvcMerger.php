<?php 
namespace org\opencomb\mvcmerger ;

use org\jecat\framework\lang\oop\Package;
use org\jecat\framework\ui\xhtml\Node;
use org\jecat\framework\ui\xhtml\weave\Patch;
use org\jecat\framework\ui\ObjectContainer;
use org\jecat\framework\fs\FSIterator;
use org\jecat\framework\fs\Folder;
use org\jecat\framework\ui\xhtml\weave\WeaveManager;
use org\opencomb\mvcmerger\merger\UITemplateWeave;
use org\opencomb\mvcmerger\merger\ui\UIObjectBrowserInfo;
use org\jecat\framework\lang\oop\ClassLoader;
use org\opencomb\mvcmerger\struct\ui\filter\UILinkHrefFilter;
use org\jecat\framework\lang\aop\AOP;
use org\jecat\framework\mvc\controller\Request;
use org\opencomb\platform\ext\Extension ;
use org\jecat\framework\ui\xhtml\UIFactory ;
use org\jecat\framework\mvc\view\UIFactory as MvcUIFactory ; 
use org\opencomb\platform\mvc\view\widget\Menu;
use org\jecat\framework\bean\BeanFactory;

class MvcMerger extends Extension 
{
	/**
	 * 载入扩展
	 */
	public function load()
	{
		// AOP 注册
		aspect\ControllerMerge::registerAOP() ;
		aspect\ViewLayoutSetting::registerAOP() ;
		AOP::singleton()
				->registerBean(array(
						// jointpoint
						'org\\jecat\\framework\\mvc\\controller\\Controller::mainRun()' ,
						// advice
						array('org\\opencomb\\mvcmerger\\aspect\\MVCBrowser','reflectMvc')
				),__FILE__) ;
		
		
		// 模板编织
		$this->setupTemplateWeaver() ;

		// 注册菜单build事件的处理函数
		Menu::registerBuildHandle(
				'org\\opencomb\\coresystem\\mvc\\controller\\ControlPanelFrame'
				, 'frameView'
				, 'mainMenu'
				, array(__CLASS__,'buildControlPanelMenu')
		) ;
	}
		
	/**
	 * @example /MVC模型/视图/模板编织/应用补丁
	 * @forwiki /MVC模型/视图/模板编织
	 */
	private function setupTemplateWeaver()
	{
		$aWeaveMgr = WeaveManager::singleton() ;
		
		/**
		 * @example /MVC模型/视图/模板编织/过滤器补丁
		 * @example /MVC模型/视图/模板编织/改变Html节点类型[1.注册补丁]
		 * 
		 * 在 coresystem 扩展的模板 FrontFrame.html 中的第1个<div>下的第1个<p> 上注册一个 filter 类型的补丁
		 */
		{
		$aWeaveMgr->registerFilter( 'coresystem:FrontFrame.html', "/div@0/p@0", array(__CLASS__,'filterForFrontFrameMergeIcon') ) ;
		}
		
		// 将 mvc-merger 扩展提供的模板文件 merger/MergeIconMenu.html 做为补丁，应用到  coresystem 扩展的模板 FrontFrame.html 中的第一个<div>下的第一个<p> 内部的末尾
		$aWeaveMgr->registerTemplate( 'coresystem:FrontFrame.html', "/div@0/p@0", 'mvc-merger:merger/MergeIconMenu.html', Patch::insertAfter ) ;
		
		
		// -------------------------------------------------
		// 根据 setting 中保存的信息，应用模板补丁
		foreach($this->setting()->keyIterator("/merge/uiweave") as $sNamespace)
		{
			foreach($this->setting()->keyIterator("/merge/uiweave/".$sNamespace) as $sTemplate)
			{
				//$sTemplate = $aTemplateKey->name() ;
				$arrAllPatchs = $this->setting()->item("/merge/uiweave/".$sNamespace.'/'.$sTemplate,'arrPatchs',array()) ;

				foreach($arrAllPatchs as $sXPath=>$arrPatchList)
				{
					foreach($arrPatchList as $arrPatch)
					{
						$aWeaveMgr->registerCode( $sNamespace.':'.$sTemplate, $sXPath, $arrPatch[1], $arrPatch[0] ) ;
					}
				}
			}
		}
	}
	
	/**
	 * @example /MVC模型/视图/模板编织/改变Html节点类型[2.实现补丁]
	 * 
	 * 将传入的模板上的 node对像，改成 div
	 */
	static public function filterForFrontFrameMergeIcon(ObjectContainer $aObjectContainer,Node $aTargetObject)
	{
		// 将 这个 node 标签改为 div
		$aTargetObject->headTag()->setName('div') ;		// 头部标签
		$aTargetObject->tailTag()->setName('div') ;		// 尾部标签
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
			\org\opencomb\coresystem\lib\LibManager::singleton()->loadLibrary('jquery') ;
			\org\opencomb\coresystem\lib\LibManager::singleton()->loadLibrary('jquery.ui') ;
			\org\opencomb\coresystem\lib\LibManager::singleton()->loadLibrary('jquery.ztree') ;
			\org\jecat\framework\resrc\HtmlResourcePool::singleton()->addRequire('mvc-merger:css/uitemplate-weave.css',\org\jecat\framework\resrc\HtmlResourcePool::RESRC_CSS) ;
			\org\jecat\framework\resrc\HtmlResourcePool::singleton()->addRequire('mvc-merger:js/uitemplate-weave.js',\org\jecat\framework\resrc\HtmlResourcePool::RESRC_JS) ;
			
			$aUIParser = new UIObjectBrowserInfo ;
			
			UIFactory::singleton()->interpreterManager()->add($aUIParser) ;
			UIFactory::singleton()->calculateCompileStrategySignture() ; // 重新计算 ui 的编译策略签名
			
			MvcUIFactory::singleton()->interpreterManager()->add($aUIParser) ;
			MvcUIFactory::singleton()->calculateCompileStrategySignture() ; // 重新计算 ui 的编译策略签名
		}
	}
	
	static public function clearClassCompiled($sClass)
	{
		if( $aClassFile = ClassLoader::singleton()->searchClass($sClass,Package::compiled) )
		{
			$aClassFile->delete() ;
		}
	}
	static public function clearTemplateCompiled($sTemplate,$sNamespace)
	{
		$aSrcMgr = MvcUIFactory::singleton()->sourceFileManager() ;
		
		if( !$aFolder = Folder::singleton()->findFolder($aSrcMgr->compiledFolderPath()) )
		{
			return false ;
		}
		foreach($aFolder->iterator(FSIterator::FOLDER) as $sFolderName)
		{
			$sCompiledPath = $sFolderName . '/' .$sNamespace . '/' . $sTemplate . '.php' ;
			if( $aCompiled=$aFolder->findFile($sCompiledPath) )
			{
				$aCompiled->delete() ;
			}
		}
		
	}

	static public function buildControlPanelMenu(array & $arrConfig)
	{
		// 合并配置数组，增加菜单
		BeanFactory::mergeConfig(
				$arrConfig
				, BeanFactory::singleton()->findConfig('widget/control-panel-frame-menu', 'mvc-merger')
		) ;
	
	}
}