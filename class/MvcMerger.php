<?php 
namespace org\opencomb\mvcmerger ;


use org\jecat\framework\auth\IdManager;
use org\jecat\framework\mvc\view\IAssemblable;
use org\jecat\framework\mvc\view\View;
use org\jecat\framework\mvc\view\IView;
use org\jecat\framework\mvc\model\IModel;
use org\opencomb\platform\service\Service;
use org\jecat\framework\util\EventReturnValue;
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
// 		aspect\ControllerMerge::registerAOP() ;
// 		aspect\ViewLayoutSetting::registerAOP() ;
	}

	public function initRegisterEvent(EventManager $aEventMgr)
	{
		$aEventMgr->registerEventHandle(
				'org\\jecat\\framework\\mvc\\controller\\Response'
				, Response::beforeRespond
				, array(__CLASS__,'onBeforeRespond')
		)
		->registerEventHandle(
				'org\\jecat\\framework\\mvc\\controller\\Response'
				, Response::beforeRenderViews
				, array(__CLASS__,'onAssemble')
		)
		->registerEventHandle(/*视图布局*/
				'org\\jecat\\framework\\mvc\\controller\\Controller'
				, Controller::afterMainRun
				, array(__CLASS__,'reflectMvc')
		);
		/*页面融合*/
		// 扩展 mvc-merger 的 Setting对象
		$aSetting = Extension::flyweight('mvc-merger')->setting() ;
		// 取得 item 数据
		$arrMergeSetting = $aSetting->value('/merge/controller/controllers',array()) ;
		$arrControllerClasses = array_keys($arrMergeSetting) ;
		
		foreach($arrControllerClasses as $sControllerClass)
		{
			$aEventMgr->registerEventHandle(
					'org\\jecat\\framework\\mvc\\controller\\Controller'
					, Controller::beforeBuildBean
					, array(__CLASS__,'addController')
					, null
					, $sControllerClass
			);
		}
	}
	
	public function addController($aController ,& $arrBean)
	{
		$arrTargetParms = explode('&', $aController->params()->toUrlQuery());
		
		$sClassName = get_class($aController);
		
		// 扩展 mvc-merger 的 Setting对象
		$aSetting = \org\opencomb\platform\ext\Extension::flyweight('mvc-merger')->setting() ;
	
		// for 控制器融合
		$arrControllers = $aSetting->value('/merge/controller/controllers',array()) ;
		if( !empty($arrControllers[$sClassName]) )
		{
			$nNum = 0; //命名计数
			foreach($arrControllers[$sClassName] as $sKey => $arrMergeArray)
			{
				if($sKey != 'type' && array_intersect(  explode('&', $sKey) , $arrTargetParms ) != explode('&', $sKey)){
					continue;
				}
				
				foreach($arrMergeArray as $arrMerge){
					
					if(!$arrMerge['enable']){
						continue;
					}
					
					if($arrMerge['mergeType'] == 'text'){
						$arrViewBean = array();
						
						$arrViewBean['template'] = "mvc-merger:ControllerMergeView.html";
						$arrViewBean['vars']['content'] = $arrMerge['content'];
						
						$arrBean['view:mergeViewBySystem'.$nNum] = $arrViewBean;
						$nNum++;
					}else if($arrMerge['mergeType'] == 'template'){
						$arrViewBean = array();
						
						if( empty($arrMerge['params']) )
						{
							$aParams = null ;
						}
						else
						{
							$arrParams = explode('&', $arrMerge['params']);
							foreach($arrParams as $arrPar){
								$arrKeyValue = explode('=', $arrPar);
								$arrViewBean['vars'][$arrKeyValue[0]] = $arrKeyValue[1];
							}
						}
						
						$arrViewBean['template'] = $arrMerge['template'];
						
						$arrBean['view:mergeViewBySystem'.$nNum] = $arrViewBean;
						$nNum++;
					}else if($arrMerge['mergeType'] == 'page'){
						$arrControllersBean = array();
						if( empty($arrMerge['params']) )
						{
							$aParams = null ;
						}
						else
						{
							$arrParams = explode('&', $arrMerge['params']);
							foreach($arrParams as $arrPar){
								$arrKeyValue = explode('=', $arrPar);
								$arrControllersBean['params'][$arrKeyValue[0]] = $arrKeyValue[1];
							}
						}
						$arrControllersBean['class'] = $arrMerge['controller'];
						$arrControllersBeanName = empty($arrMerge['name'])? 'mergeControllerBySystem'.$nNum : $arrMerge['name'];
							
						$arrBean['controller:'.$arrControllersBeanName] = $arrControllersBean;
						$nNum++;
					}
				}
			}
		}
	}
	
	static public function reflectMvc($aController)
	{
		if($aController->params()->bool('mvcmerger'))
		{
			self::printFrameCode($aController);
		}
		
		if($aController->params()->bool('mvcmerger_browser'))
		{
			self::printBrowserCode($aController);
		}
	}
	
	static private function printFrameCode($aController){
		$sViewContainerId = $aController->frame()->viewContainer()->id();
		$sAssembledParentId = $aController->view()->assembledParent()->id();
		echo <<<CODE

<script>
var __viewContainerId = '{$sViewContainerId}';
var __assembledParentId = '{$sAssembledParentId}';
</script>

CODE;
	}
	
	private function printBrowserCode($aController){
		$sJsCode = "\r\n<script>\r\n" ;
		$sJsCode.= "var _mvcstruct = { \r\n";
		$sJsCode.= "	'controller':" . self::generateControllerStructJcCode($aController) . ", \r\n" ;
		$sJsCode.= "	'view':" . self::generateViewStructJcCode($aController->view()) . " \r\n" ;
		$sJsCode.= "};\r\n";
		$sJsCode.= "if( parent && typeof(parent.structBrowser)!='undefined' ){\r\n" ;
		$sJsCode.= "	parent.structBrowser.setMvcStruct(_mvcstruct) ;\r\n" ;
		$sJsCode.= "}\r\n" ;
		$sJsCode.= "</script>\r\n" ;
		
		echo $sJsCode ;
	}
	static public function generateModelStructJcCode(IModel $aModel,$sName,$nIndent=0)
	{
		$sIndent = str_repeat("\t",$nIndent) ;
		$sNameEsc = addslashes($sName) ;
		
		$sJsCode = "{\r\n" ;
		$sJsCode.= $sIndent."	name:\"{$sNameEsc}\"\r\n" ;
		
		$sJsCode.= $sIndent."	, models: [ " ;
		foreach($aModel->childNameIterator() as $idx=>$sModelName)
		{
			if($idx)
			{
				$sJsCode.= "\r\n{$sIndent}	, " ;
			}
			$sJsCode.= self::generateModelStructJcCode($aModel->child($sModelName),$sModelName,$sIndent+1) ;
		}
		$sJsCode.= $sIndent." ]\r\n" ;
		
		$sJsCode.= $sIndent."}" ;
		
		return $sJsCode ;
	}
	
	static public function generateViewStructJcCode(IView $aView,$sName='',$nIndent=0)
	{
		$sIndent = str_repeat("\t",$nIndent) ;
		
		$sViewNameEsc = addslashes($sName) ;
		$sTemplateEsc = addslashes($aView->template()) ;
		
		$sJsCode = "{\r\n" ;
		$sJsCode.= "{$sIndent}	name:\"{$sViewNameEsc}\"\r\n" ;
		$sJsCode.= "{$sIndent}	, template:\"{$sTemplateEsc}\"\r\n" ;
		$sJsCode.= "{$sIndent}, id:\"{$aView->id()}\"\r\n" ;
		
		if($aView->viewNames())
		{
			$sJsCode.= "{$sIndent}	, views:[" ;
			foreach($aView->viewNames() as $idx=>$sChildViewName)
			{
				if($idx)
				{
					$sJsCode.= "\r\n{$sIndent}	, " ;
				}
				$sJsCode.= self::generateViewStructJcCode($aView->viewByName($sChildViewName),$sChildViewName,$nIndent+1) ;
			}
			$sJsCode.= "]\r\n" ;
		}
		
		$sJsCode.= $sIndent."}" ;
		
		return $sJsCode ;
	}
	
	static public function generateControllerStructJcCode(Controller $aController,$sName=null,$nIndent=0)
	{
		$sClass = get_class($aController) ;
		if(!$sName)
		{
			$sName = $aController->name()?: $sClass ;
		}
		
		$arrParams = array() ;
		$aController->params()->exportToArray($arrParams) ;
		unset($arrParams['mvcmerger_browser']) ;
		unset($arrParams['c']) ;
		
		$sNameEsc = addslashes($sName) ;
		$sClassEsc = addslashes($sClass) ;
		$sTitleEsc = addslashes($aController->title()) ;
		$sIndent = str_repeat("\t",$nIndent) ;
		
		$sJsCode = "{\r\n" ;
		$sJsCode.= $sIndent."	name: \"{$sNameEsc}\"\r\n" ;
		$sJsCode.= $sIndent."	, 'class': \"{$sClassEsc}\"\r\n" ;
		$sJsCode.= $sIndent."	, params: \"\"\r\n" ;
		$sJsCode.= $sIndent."	, title: \"{$sTitleEsc}\"\r\n" ;
		$sJsCode.= $sIndent."	, params: \"".http_build_query($arrParams)."\"\r\n" ;
		
		// views
		if($aView = $aController->view()){
			$sJsCode.= $sIndent."	, view: " ;
			
			$sJsCode.= self::generateViewStructJcCode($aView,$aView->id(),$sIndent+1) ;
			$sJsCode.= $sIndent." \r\n" ;
		}
		
		// controllers
		$sJsCode.= $sIndent."	, controllers: [ " ;
		foreach($aController->nameIterator() as $idx=>$sChildControllerName)
		{
			if($idx)
			{
				$sJsCode.= "\r\n{$sIndent}	, " ;
			}
			$sJsCode.= self::generateControllerStructJcCode($aController->getByName($sChildControllerName),$sChildControllerName,$sIndent+1) ;
		}
		$sJsCode.= $sIndent." ]\r\n" ;
		
		$sJsCode.= $sIndent."}" ;
		
		return $sJsCode ;
	}

	static public function onBeforeRespond(Response $aResponse,Controller $aController)
	{
		if( Request::singleton()->has('mvcmerger') )
		{
			$arrParmasTemp = explode('&', $_SERVER['QUERY_STRING']);
			$arrParmas = array();
			foreach($arrParmasTemp as $value){
				if( strpos( $value , 'c=' ) !== 0 and strpos( $value , 'mvcmerger=' ) !== 0 ){
					$arrParmas[] = $value;
				}
			}
			natsort($arrParmas);
			$sParams = implode('&', $arrParmas);
			if($sParams === ''){
				$sParams = '*';
			}
			
			$sClassName = str_replace('\\','.',get_class($aController)) ;
			$aSetting = Extension::flyweight('mvc-merger')->setting() ;
			$arrProperties = $aSetting->value('/merge/layout/'.$sClassName.'/'.$sParams ,null) ;
			if(!$arrProperties){
				$arrProperties = $aSetting->value('/merge/layout/'.$sClassName ,null) ;
			}
			if(!isset($arrProperties['properties'])){
				$arrProperties['properties'] = array();
			}
			// 向控制器插入 mvc pannel dialog 视图
			$aView = new View('mvc-merger:MergePannelDialog.html') ;
			$sImageFolder = Service::singleton()->publicFolders()->find('image','mvc-merger',true) ;
			$aView->variables()->set('sImageFolder',$sImageFolder) ;
			$aView->variables()->set('sControllerClass',$sClassName) ;
			$aView->variables()->set('log',Request::singleton()->bool('log')) ;
			$aView->variables()->set('arrLayoutProperties', $arrProperties['properties'] ? json_encode($arrProperties['properties']) : '{}') ;
			$aView->removeWrapperClasses('jc-layout') ;
			
			$arrSkins = array();
			$arrSkins = $aSetting->value('/merge/skin',array());
			
			$aView->variables()->set('__arrSkins',json_encode($arrSkins) );
			$aView->variables()->set('arrSkins',$arrSkins);
			
			$aView->removeWrapperClasses('jc-layout') ;
			$aView->removeWrapperClasses('jc-frame') ;
			$aController->view()->addView('MergePannelDialog',$aView) ;
		}
	}
	static public function onAssemble(Response $aResponse, View $aWebpage,Controller $aController)
	{
		$sClassName = str_replace('\\','.',get_class($aController)) ;
		
		$arrParmasTemp = explode('&', $_SERVER['QUERY_STRING']);
		$arrParmas = array();
		foreach($arrParmasTemp as $value){
			if( strpos( $value , 'c=') !== 0 and strpos( $value , 'mvcmerger=') !== 0 ){
				$arrParmas[] = $value;
			}
		}
		natsort($arrParmas);
		$sParams = implode('&', $arrParmas);
		if($sParams === ''){
			$sParams = '*';
		}
		
		$aSetting = Extension::flyweight('mvc-merger')->setting() ;
		
		$arrLayout=$aSetting->value('/merge/layout/'.$sClassName.'/'. $sParams ,null);
		if(!$arrLayout){
			$arrLayout = $aSetting->value('/merge/layout/'.$sClassName.'/*' ,null) ;
		}
		
		if(! isset($arrLayout['assemble']) || $arrLayout['assemble'] == array() )
		{
			return;
		}
		
		$arrViewsInStore = array();
		foreach ( $arrLayout['assemble'] as $assemble){
			self::assembleViewAndFrame($aController , $assemble , null, & $arrViewsInStore);
		}
	}
	
	private function assembleViewAndFrame($aRootController, $arrView , $aContainerView=null ,& $arrViewsInStore){
		if($arrView === array()){
			return;
		}
		
		$aRootView = $aRootController->view();
		
		$aView = isset($arrViewsInStore[$arrView['xpath']]) ? $arrViewsInStore[$arrView['xpath']] : null;
		
		if(!$aView && !$aView = View::findXPath( $aRootView,$arrView['xpath'])){
			//还原自定义frame
			if(isset($arrView['customFrame']) and $arrView['customFrame']){
				$aView = new View() ;
				if($arrView['layout'] == 'v'){
					$aView->setFrameType('jc-frame-vertical');
				}else{
					$aView->setFrameType('jc-frame-horizontal');
				}
				$aView->addWrapperClasses('cusframe');
				$aParentView = View::findXPath( $aRootView , dirname($arrView['xpath']));
				$aParentView->addView($arrView['id'], $aView);
			}else{
				//do nothing , 如果有找不到的view或者frame,又不是自定义frame,就不管了
				return;
			}
		}
		
		$aView->setId($arrView['id']);
		
		$arrViewsInStore[$arrView['xpath']] = $aView;

		if(isset($arrView['layout'])){
			if($arrView['layout'] == 'v'){
				$aView->setFrameType('jc-frame-vertical');
			}else if($arrView['layout'] == 'h'){
				$aView->setFrameType('jc-frame-horizontal');
			}else{
				//tab?
			}
		}
		
		if(isset($arrView['cssClass'])){
			$aView->clearWrapperClasses();
			foreach( $arrView['cssClass'] as $sClass ){
				$aView->addWrapperClasses($sClass);
			}
		}
		
		if(isset($arrView['style'])){
			$aView->setWrapperStyle($arrView['style']);
		}
		
		if($aContainerView !== null){
			$aContainerView->assemble( $aView , IAssemblable::zhard );
		}
		
		if(isset($arrView['items'])){
			foreach($arrView['items'] as $arrChild){
				self::assembleViewAndFrame($aRootController,$arrChild,$aView ,& $arrViewsInStore);
			}
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
		foreach($this->setting()->value("/merge/uiweave",array()) as $sNamespace => $aNsKey)
		{
			//$sNamespace = $aNsKey->name() ;
			foreach($aNsKey as $sTemplate => $aTemplateKey)
			{
				//$sTemplate = $aTemplateKey->name() ;
				$arrAllPatchs = $aTemplateKey['arrPatchs'];
				if( ! is_array($arrAllPatchs)){
					continue;
				}
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
		if(Request::singleton()->bool('mvcmerger'))
		{
			\org\opencomb\coresystem\lib\LibManager::singleton()->loadLibrary('jquery') ;
			\org\opencomb\coresystem\lib\LibManager::singleton()->loadLibrary('jquery.ui') ;
			\org\opencomb\coresystem\lib\LibManager::singleton()->loadLibrary('jquery.ztree') ;
			\org\jecat\framework\resrc\HtmlResourcePool::singleton()->addRequire('mvc-merger:css/uitemplate-weave.css',\org\jecat\framework\resrc\HtmlResourcePool::RESRC_CSS) ;
			\org\jecat\framework\resrc\HtmlResourcePool::singleton()->addRequire('mvc-merger:js/merge-pannel-uitemplate-weave.js',\org\jecat\framework\resrc\HtmlResourcePool::RESRC_JS) ;
			
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
			unlink($aClassFile);
		}
	}
	
	static public function clearTemplateCompiled($sTemplate,$sNamespace)
	{
		$aSrcMgr = MvcUIFactory::singleton()->sourceFileManager() ;
		$dir = $aSrcMgr->compiledFolderPath() . '/';
		self::rrmdir($dir);
	}
	//删除非空文件夹
	private function rrmdir($dir){
		foreach(glob($dir . '/*') as $file) {
			if(is_dir($file))
				self::rrmdir($file);
			else
				unlink($file);
		}
		rmdir($dir);
	}
}
