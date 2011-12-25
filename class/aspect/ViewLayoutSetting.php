<?php
namespace org\opencomb\mvcmerger\aspect ;

use org\opencomb\mvcmerger\merger\ViewLayerout;
use org\jecat\framework\mvc\view\TransparentViewContainer;
use org\jecat\framework\lang\Type;
use org\jecat\framework\mvc\view\layout\ViewLayoutFrame;
use org\jecat\framework\mvc\view\IView;
use org\jecat\framework\mvc\view\View;
use org\jecat\framework\mvc\controller\IController;
use org\jecat\framework\util\DataSrc;
use org\jecat\framework\system\Application;
use org\jecat\framework\lang\aop\jointpoint\JointPointMethodDefine;

class ViewLayoutSetting
{
	// -------------------------------------------------------------------------------------- //
	// 启动视图布局”所见即所得“编辑操作------------------------------------------------------ //
	
	/**
	 * @pointcut
	 */
	public function pointcutMainRun()
	{
		return array(
			new JointPointMethodDefine('org\\jecat\\framework\\mvc\\controller\\Controller','mainRun') ,
		) ;
	}
		
	/**
	 * @advice before
	 * @for pointcutMainRun
	 */
	public function enableViewLayoutSetting_before()
	{
		if($this->params->bool('mvcmerger_layout_setting'))
		{
			\org\opencomb\advcmpnt\lib\LibManager::singleton()->loadLibrary('jquery') ;
			\org\opencomb\advcmpnt\lib\LibManager::singleton()->loadLibrary('jquery.ui') ;
			
			\org\jecat\framework\resrc\HtmlResourcePool::singleton()->addRequire('mvc-merger:css/view-layout-setting.css',\org\jecat\framework\resrc\HtmlResourcePool::RESRC_CSS) ;
			\org\jecat\framework\resrc\HtmlResourcePool::singleton()->addRequire('mvc-merger:js/view-layout-setting.js',\org\jecat\framework\resrc\HtmlResourcePool::RESRC_JS) ;
		}
	}
	
	
	/**
	 * @pointcut
	 */
	public function pointcutControllerRenderMainView()
	{
		return array(
				new JointPointMethodDefine('org\\jecat\\framework\\mvc\\controller\\Controller','renderMainView') ,
		) ;
	}
	/**
	 * @pointcut
	 */
	public function pointcutControllerDisplayrMainView()
	{
		return array(
				new JointPointMethodDefine('org\\jecat\\framework\\mvc\\controller\\Controller','displayMainView') ,
		) ;
	}
	
	/**
	 * 在 controller 的 renderMainView() 之后反射视图结构
	 * 
	 * @advice after
	 * @for pointcutControllerRenderMainView
	 */
	public function enableViewLayoutSetting_afterRender(IView $aMainView)
	{
		\org\opencomb\mvcmerger\aspect\ViewLayoutSetting::advice_enableViewLayoutSetting_afterRender($this,$aMainView) ;
	}
	
	static function advice_enableViewLayoutSetting_afterRender(IController $aController,IView $aMainView)
	{
		if(!$aController->params()->bool('mvcmerger_layout_setting'))
		{
			return ;
		}
		
		$sJsCode = "\r\n<script>\r\n" ;
		
		// view id,xpath mapping
		foreach($aMainView->nameIterator() as $sViewName)
		{
			$sJsCode.= self::outputViewInfoForLayoutSetting(
				$aMainView->getByName($sViewName)
				, '/'.$sViewName
			) ;
		}
		
		// controller class
		$sJsCode.= "var currentControllerClass = '". addslashes(get_class($aController)) ."' ;\r\n" ;
		
		$sJsCode.= "</script>\r\n" ;
		
		$aController->properties()->set('__scriptLayoutViewStruct',$sJsCode) ;
	}
	
	/**
	 * 在 controller 的 displayMainView() 之后以json格式输出视图结构
	 * 
	 * @advice after
	 * @for pointcutControllerDisplayrMainView
	 */
	public function enableViewLayoutSetting_afterDisplay()
	{
		if($this->params->bool('mvcmerger_layout_setting'))
		{
			echo $this->properties()->get('__scriptLayoutViewStruct') ;
		}
	}
	
	static public function outputViewInfoForLayoutSetting(IView $aView,$sXPath)
	{
		$sJsCode = self::outputViewInfo($aView, $sXPath) ;
		
		foreach($aView->nameIterator() as $sChildName)
		{
			$aChildView = $aView->getByName($sChildName) ;
			// 检查是否父子关系
			
			$aParentOfChild = $aChildView->parent() ;
			if( $aParentOfChild===$aView
				or ( ($aParentOfChild instanceof TransparentViewContainer) and $aParentOfChild->parent()===$aView)
			)
			{
				$sJsCode.= self::outputViewInfoForLayoutSetting($aChildView,$sXPath.'/'.$sChildName) ;
			}
		}
		
		return $sJsCode ;
	} 
	
	static public function outputViewInfo($aView,$sXPath)
	{
		$sIdEsc = addslashes(ViewLayoutFrame::htmlWrapperId($aView)) ;
		$sXPathEsc = addslashes($sXPath) ;
		
		return "jquery('#{$sIdEsc}').data('xpath',\"{$sXPathEsc}\").addClass('mvcmerger-viewlayout') ;\r\n" ;
		
		//__mvcmerger_layout_setting
	}
	
	
	// -------------------------------------------------------------------------------------- //
	// 应用视图布局配置 --------------------------------------------------------------------- //
	
	/**
	 * @pointcut
	 */
	public function pointcutDisplayMainView()
	{		
		$arrJointPoints = array() ;
		$aSetting = Application::singleton()->extensions()->extension('mvc-merger')->setting() ;
		
		// for 视图布局
		foreach(array_keys($aSetting->item('/merge/view_layout','controllers',array())) as $sControllerClass)
		{
			$arrJointPoints[] = new JointPointMethodDefine($sControllerClass,'displayMainView')  ;
		}
		
		return $arrJointPoints ;
	}
	
	/**
	 * 在控制器的 displayMainView() 函数之前根据视图布局设置，重建视图布局结构
	 * @advice before
	 * @for pointcutDisplayMainView
	 */
	public function beforeDisplayMainView(IView $aMainView)
	{
		\org\opencomb\mvcmerger\aspect\ViewLayoutSetting::advice_beforeDisplayMainView($this,$aMainView) ;
	}
	
	static public function advice_beforeDisplayMainView(IController $aController,IView $aMainView)
	{
		$aSetting = \org\jecat\framework\system\Application::singleton()->extensions()->extension('mvc-merger')->setting() ;
		$sControllerClass = get_class($aController) ;
		
		// for 视图布局
		$arrControllers = $aSetting->item('/merge/view_layout','controllers',array()) ;
		if( !empty($arrControllers[$sControllerClass]) )
		{
			$sLayoutConfigCode = '' ;
			if( $is_mvcmerger_layout_setting = $aController->params()->bool('mvcmerger_layout_setting') )
			{			
				$sLayoutConfigCode.= "\r\n<script>\r\n" ;
			}
		
			// 重构视图布局结构
			foreach ($arrControllers[$sControllerClass] as $arrFrame)
			{
				self::layout( $aMainView, $arrFrame, null, $sLayoutConfigCode ) ;
			}
			
			if( $is_mvcmerger_layout_setting )
			{
				$sLayoutConfigCode.= "</script>\r\n" ;
				$aController->properties()->set('__scriptLayoutConfig',$sLayoutConfigCode) ;
			}
		}
	}
	
	/**
	 * @advice after
	 * @for pointcutDisplayMainView
	 */
	public function afterDisplayMainView(IView $aMainView)
	{
		if($this->params->bool('mvcmerger_layout_setting'))
		{
			echo $this->properties()->get('__scriptLayoutConfig') ;
		}
	}
	
	static public function layout(IView $aRootView,&$arrFrameConfig,ViewLayoutFrame $aParentFrame=null,&$sLayoutConfigOutput=null)
	{
		if( !empty($arrFrameConfig['xpath']) )
		{
			// 在指定位置创建 frame
			if( !$aLayoutFrame = View::xpath($aRootView,$arrFrameConfig['xpath']) )
			{
				$sFrameName = basename($arrFrameConfig['xpath']) ;
				$sFrameParentPath = dirname($arrFrameConfig['xpath']) ;
				
				if( $aParentFrame = View::xpath($aRootView,$sFrameParentPath) )
				{			
					$aLayoutFrame = new ViewLayoutFrame($arrFrameConfig['type'],$sFrameName) ;
					$aParentFrame->add($aLayoutFrame,null,($aParentFrame instanceof ViewLayoutFrame)) ;
				}
				else
				{
					// echo "not fount frame: {$arrFrameConfig['xpath']} form ". $aRootView->name() , '<br />';
					return ;
				}
			}
		}
		else
		{
			$aLayoutFrame = new ViewLayoutFrame($arrFrameConfig['type']) ;
			
			if($sLayoutConfigOutput) // 在编辑状态下增加 class
			{
				self::addFrameClass($aLayoutFrame,'mvcmerger-viewlayout') ;
				self::addFrameClass($aLayoutFrame,'mvcmerger-tmp-frame') ;
			}
			
			if($aParentFrame)
			{
				$aParentFrame->add($aLayoutFrame,null,true) ;
			}
		}
		
		// 在 frame view 记录布局配置
		if($sLayoutConfigOutput)
		{
			self::outputLayoutConfigJson($aLayoutFrame,$arrFrameConfig,$sLayoutConfigOutput) ;
		}
		
		// frame 上的样式
		self::setupLayoutItemAttr($aLayoutFrame,$arrFrameConfig) ;
		
		$aLayoutFrame->setType($arrFrameConfig['type']) ;
				
		$arrChildViews = array() ;
		foreach ($arrFrameConfig['items'] as $arrItem)
		{
			if( $arrItem['class']=='frame' )
			{
				if( $aChildFrame=self::layout($aRootView,$arrItem,$aLayoutFrame,$sLayoutConfigOutput) )
				{
					$arrChildViews[] = $aChildFrame ;
				}
			}
			else if( $arrItem['class']=='view' )
			{
				$aView = View::xpath($aRootView,$arrItem['xpath']) ;
				if($aView)
				{					
					$arrChildViews[] = $aView ;
					
					// 在 frame view 记录布局配置
					if($sLayoutConfigOutput)
					{
						self::outputLayoutConfigJson($aView,$arrItem,$sLayoutConfigOutput) ;
					}
					
					self::setupLayoutItemAttr($aView, $arrItem) ;
				}
			}
		}
		
		// 重建 frame 中的内容
		$aLayoutFrame->clear() ;
		foreach($arrChildViews as $aView)
		{
			$aLayoutFrame->add($aView) ;
		}
		
		// 重新渲染 frame
		$aLayoutFrame->outputStream()->clear() ;
		$aLayoutFrame->render(true) ;
		
		return $aLayoutFrame ;
	}
	
	static public function setupLayoutItemAttr(IView $aView,array &$arrConfig)
	{
		if(!empty($arrConfig['attributes']['style']))
		{
			ViewLayoutFrame::setWrapperStyle($aView,$arrConfig['attributes']['style']) ;
		}
		
		if(!empty($arrConfig['attributes']['class']))
		{
			ViewLayoutFrame::addWrapperCssClass($aView,$arrConfig['attributes']['class']) ;
		}
	}
	
	static public function outputLayoutConfigJson(IView $aView,&$arrConfig,&$sOutput)
	{
		$sLayoutConfig = json_encode($arrConfig,true) ;
		$sIdEsc = addslashes(ViewLayoutFrame::htmlWrapperId($aView)) ;
		
		$sOutput.= "jquery('#{$sIdEsc}').data('layout-properties',{$sLayoutConfig}) ;\r\n" ;
	}
	
	static public function addFrameClass(ViewLayoutFrame $aFrame,$sClass)
	{
		$arrClasses =& $aFrame->variables()->getRef('wrapper.classes') ;
		if( !in_array($sClass,$arrClasses) )
		{
			$arrClasses[] = $sClass ;
		}
	}
}

?>