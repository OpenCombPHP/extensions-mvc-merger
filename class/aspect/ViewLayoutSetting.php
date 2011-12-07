<?php
namespace org\opencomb\mvcmerger\aspect ;

use org\jecat\framework\mvc\view\IView;

use org\jecat\framework\mvc\view\View;
use org\jecat\framework\mvc\view\ViewLayout;
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
	 * @advice after
	 * @for pointcutMainRun
	 */
	public function enableViewLayoutSetting_after()
	{
		if(!$this->params->bool('mvcmerger_layout_setting'))
		{
			return ;
		}
		
		$sJsCode = "\r\n<script>\r\n" ;
		
		// view id,xpath mapping
		$sMainViewIdEsc = addslashes(View::htmlWrapperId($this->mainView())) ;
		$sJsCode.= "jquery('#{$sMainViewIdEsc}').addClass('mvcmerger-viewlayout') ;\r\n" ;
		foreach($this->mainView()->iterator() as $aView)
		{
			$sJsCode.= \org\opencomb\mvcmerger\aspect\ViewLayoutSetting::outputViewInfoForLayoutSetting($aView) ;
		}
		
		// controller class
		$sJsCode.= "var currentControllerClass = '". addslashes(get_class($this)) ."' ;\r\n" ;
		
		$sJsCode.= "</script>\r\n" ;
		
		echo $sJsCode ;
	}
	
	static public function outputViewInfoForLayoutSetting(IView $aView,$sXPathPrefix='')
	{		
		if($aParentView=$aView->parent())
		{
			$sName = $aParentView->getName($aView)?: $aView->name() ;
		}
		else
		{
			$sName = $aView->name() ;
		}
		$sXPath = $sXPathPrefix.'/'.$sName ;
		$sXPathEsc = addslashes($sXPath) ;
		
		$sIdEsc = addslashes(View::htmlWrapperId($aView)) ;
		
		$sJsCode = "jquery('#{$sIdEsc}').data('xpath',\"{$sXPath}\").addClass('mvcmerger-viewlayout') ;\r\n" ;
		foreach($aView->iterator() as $aChildView)
		{
			$sJsCode.= self::outputViewInfoForLayoutSetting($aChildView,$sXPath) ;
		}
		
		return $sJsCode ;
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
	 * @advice before
	 * @for pointcutDisplayMainView
	 */
	public function beforeDisplayMainView(IView $aMainView)
	{
		$aSetting = \org\jecat\framework\system\Application::singleton()->extensions()->extension('mvc-merger')->setting() ;
		
		// for 视图布局
		$arrControllers = $aSetting->item('/merge/view_layout','controllers',array()) ;
		if( !empty($arrControllers[__CLASS__]) )
		{
			foreach ($arrControllers[__CLASS__] as $arrFrame)
			{
				$aLayoutFrame = \org\opencomb\mvcmerger\aspect\ViewLayoutSetting::layout( $this, $arrFrame ) ;
			}
		}
	}
	
	static public function layout(IController $aController,&$arrFrameConfig)
	{
		if( !empty($arrFrameConfig['xpath']) )
		{
			// 在指定位置创建 frame
			if( !$aLayoutFrame = View::xpath($aController->mainView(),$arrFrameConfig['xpath']) )
			{
				$sFrameName = basename($arrFrameConfig['xpath']) ;
				$sFrameParentPath = dirname($arrFrameConfig['xpath']) ;
				echo $sFrameParentPath, ':', $sFrameName ;
				
				if( $aFrameParent = View::xpath($aController->mainView(),$sFrameParentPath) )
				{
					$aLayoutFrame = new ViewLayout($arrFrameConfig['type'],$sFrameName) ;
					$aFrameParent->add($aLayoutFrame) ;
				}
				else
				{
					return ;
				}
			}
			
			$aLayoutFrame->clear() ;
			$aLayoutFrame->outputStream()->clear() ;
		}
		else
		{
			$aLayoutFrame = new ViewLayout($arrFrameConfig['type']) ;
			$aLayoutFrame->addCssClass('tmp-frame') ;
		}
				
		foreach ($arrFrameConfig['items'] as $arrItem)
		{
			if( $arrItem['class']=='frame' )
			{
				if( $aView  = self::layout($aController,$arrItem) )
				{
					$aLayoutFrame->add($aView,null) ;
				}
			}
			else if( $arrItem['class']=='view' )
			{
				$aView = View::xpath($aController->mainView(),$arrItem['xpath']) ;
				if($aView)
				{
					$aLayoutFrame->add($aView,null,true) ;
				}
			}
		}
		
		$aLayoutFrame->render() ;
		
		return $aLayoutFrame ;
	}
}

?>