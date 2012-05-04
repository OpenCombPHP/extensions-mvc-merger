<?php 
namespace org\opencomb\mvcmerger ;


use org\opencomb\platform\service\Service;

use org\jecat\framework\util\EventReturnValue;

use org\jecat\framework\mvc\view\ViewAssembler;

use org\jecat\framework\mvc\view\View;

use org\jecat\framework\ui\UI;

use org\jecat\framework\mvc\controller\Response;

use org\opencomb\mvcmerger\merger\MergePannel;

use org\jecat\framework\mvc\controller\Controller;
use org\jecat\framework\util\EventManager;
use org\jecat\framework\lang\oop\Package;
use org\jecat\framework\ui\xhtml\Node;
use org\jecat\framework\ui\xhtml\weave\Patch;
use org\jecat\framework\ui\ObjectContainer;
use org\jecat\framework\fs\FSIterator;
use org\jecat\framework\fs\Folder;
use org\jecat\framework\ui\xhtml\weave\WeaveManager;
use org\opencomb\mvcmerger\merger\ui\UIObjectBrowserInfo;
use org\jecat\framework\lang\oop\ClassLoader;
use org\opencomb\mvcmerger\struct\ui\filter\UILinkHrefFilter;
use org\jecat\framework\lang\aop\AOP;
use org\jecat\framework\mvc\controller\Request;
use org\opencomb\platform\ext\Extension;
use org\jecat\framework\ui\xhtml\UIFactory;
use org\opencomb\platform\mvc\view\widget\Menu;
use org\jecat\framework\bean\BeanFactory;
use org\jecat\framework\mvc\view\UIFactory as MvcUIFactory;

class MvcMerger extends Extension 
{
	/**
	 * 载入扩展
	 */
	public function load()
	{
		// AOP 注册
		/*aspect\ControllerMerge::registerAOP() ;
		aspect\ViewLayoutSetting::registerAOP() ;
		AOP::singleton()
				->registerBean(array(
						// jointpoint
						'org\\jecat\\framework\\mvc\\controller\\Controller::mainRun()' ,
						// advice
						array('org\\opencomb\\mvcmerger\\aspect\\MVCBrowser','reflectMvc')
				),__FILE__) ;*/

		// 注册菜单build事件的处理函数
		Menu::registerBuildHandle(
				'org\\opencomb\\coresystem\\mvc\\controller\\ControlPanelFrame'
				, 'frameView'
				, 'mainMenu'
				, array(__CLASS__,'buildControlPanelMenu')
		) ;
	}

	
	public function initRegisterEvent(EventManager $aEventMgr)
	{
		$aEventMgr->registerEventHandle(
				'org\\jecat\\framework\\mvc\\controller\\Response'
				, Response::beforeRespond
				, array(__CLASS__,'onBeforeRespond')
			)
			->registerEventHandle(
				'org\\jecat\\framework\\mvc\\view\\ViewAssembler'
				, ViewAssembler::assemble
				, array(__CLASS__,'onAssemble')
			) ;
	}
	
	static public function onBeforeRespond(Response $aResponse,Controller $aController)
	{
		if( !Request::singleton()->has('mvcmerger') )
		{
			return ;
		}

		// 向控制器插入 mvc pannel dialog 视图
		$aView = new View('MergePannelDialog','mvc-merger:MergePannelDialog.html') ;
		$sImageFolder = Service::singleton()->publicFolders()->find('image','mvc-merger',true) ;
		$aView->variables()->set('sImageFolder',$sImageFolder) ;
		$aView->variables()->set('sControllerClass',str_replace('\\','.',get_class($aController))) ;
		$aController->mainView()->add($aView) ;
	}
	static public function onAssemble(ViewAssembler $aViewAssembler,Controller $aController)
	{
		$sClassName = str_replace('\\','.',get_class($aController)) ;
		
		$aSetting = Extension::flyweight('mvc-merger')->setting() ;
		if( $arrLayout=$aSetting->item('/merge/layout/'.$sClassName,'*',null) )
		{
			return EventReturnValue::returnByRef($arrLayout) ;
		}
	}


	/**
	 * @example /MVC模型/视图/模板编织/应用补丁
	 * @forwiki /MVC模型/视图/模板编织
	 */
	public function initRegisterUITemplateWeave(WeaveManager $aWeaveManager)
	{
		/**
		 * @example /MVC模型/视图/模板编织/过滤器补丁
		 * @example /MVC模型/视图/模板编织/改变Html节点类型[1.注册补丁]
		 *
		 * 在 coresystem 扩展的模板 FrontFrame.html 中的第1个<div>下的第1个<p> 上注册一个 filter 类型的补丁
		 */
		{
			$aWeaveManager->registerFilter( 'coresystem:FrontFrame.html', "/div@0/p@0", array(__CLASS__,'filterForFrontFrameMergeIcon') ) ;
		}
	
		// 将 mvc-merger 扩展提供的模板文件 merger/MergeIconMenu.html 做为补丁，应用到  coresystem 扩展的模板 FrontFrame.html 中的第一个<div>下的第一个<p> 内部的末尾
		$aWeaveManager->registerTemplate( 'coresystem:FrontFrame.html', "/div@0/p@0", 'mvc-merger:merger/MergeIconMenu.html', Patch::insertAfter ) ;
	
	
		// -------------------------------------------------
		// 根据 setting 中保存的信息，应用模板补丁
		foreach($this->setting()->key("/merge/uiweave",true)->keyIterator() as $aNsKey)
		{
			$sNamespace = $aNsKey->name() ;
			foreach($aNsKey->keyIterator() as $aTemplateKey)
			{
				$sTemplate = $aTemplateKey->name() ;
				$arrAllPatchs = $aTemplateKey->item('arrPatchs',array()) ;
	
				foreach($arrAllPatchs as $sXPath=>$arrPatchList)
				{
					foreach($arrPatchList as $arrPatch)
					{
						$aWeaveManager->registerCode( $sNamespace.':'.$sTemplate, $sXPath, $arrPatch[1], $arrPatch[0] ) ;
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
