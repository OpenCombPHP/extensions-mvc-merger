<?php
namespace org\opencomb\mvcmerger\aspect ;

use org\jecat\framework\mvc\view\View;

use org\jecat\framework\mvc\model\IModel;
use org\jecat\framework\mvc\controller\IController;
use org\jecat\framework\pattern\composite\IContainer;
use org\jecat\framework\mvc\view\IView;
use org\jecat\framework\mvc\controller\Controller;
use org\jecat\framework\lang\aop\jointpoint\JointPointMethodDefine;

class ControllerAspect
{
	/**
	 * @pointcut
	 */
	public function pointcutMainRun()
	{
		return array(
			new JointPointMethodDefine('org\\jecat\\framework\\mvc\\controller\\Controller','mainRun') ,
		) ;
	}
	
	// -------------------------------------------------------------------------------------- //
	// for View Layout Setting -------------------------------------------------------------- //
	
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
		foreach($this->mainView()->iterator() as $aChildView)
		{
			$sJsCode.= \org\opencomb\mvcmerger\aspect\ControllerAspect::outputViewInfoForLayoutSetting($aChildView) ;
		}
		
		// controller class
		$sJsCode.= "var currentControllerClass = '". addslashes(get_class($this)) ."' ;\r\n" ;
		
		$sJsCode.= "</script>\r\n" ;
		
		echo $sJsCode ;
	}
	
	static public function outputViewInfoForLayoutSetting(IView $aView,$sXPathPrefix='')
	{
		$sXPath = $sXPathPrefix.'/'. $aView->parent()->getName($aView) ;
		$sXPathEsc = addslashes($sXPath) ;
		
		$sIdEsc = addslashes(View::htmlWrapperId($aView)) ;
		
		$sJsCode = "jquery('#{$sIdEsc}').data('xpath',\"{$sXPath}\") ;\r\n" ;
		foreach($aView->iterator() as $aChildView)
		{
			$sJsCode.= self::outputViewInfoForLayoutSetting($aChildView,$sXPath) ;
		}
		
		return $sJsCode ;
	} 
	
	// -------------------------------------------------------------------------------------- //
	// for MVC Browser----------------------------------------------------------------------- //
	
	/**
	 * @advice after
	 * @for pointcutMainRun
	 */
	public function reflectMvc()
	{
		if(!$this->params->bool('mvcmerger_browser'))
		{
			return ;
		}
		
		$sJsCode = "\r\n<script>\r\n" ;
		$sJsCode.= "if( parent && typeof(parent.structBrowser)!='undefined' ){\r\n" ;
		$sJsCode.= "	var _mvcstruct = " . \org\opencomb\mvcmerger\aspect\ControllerAspect::generateControllerStructJcCode($this) . "; \r\n" ;
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
			$sJsCode.= \org\opencomb\mvcmerger\aspect\ControllerAspect::generateModelStructJcCode($aModel->child($sModelName),$sModelName,$sIndent+1) ;
		}
		$sJsCode.= $sIndent." ]\r\n" ;
		
		$sJsCode.= $sIndent."}" ;
		
		return $sJsCode ;
	}
	
	static public function generateViewStructJcCode(IView $aView,$sName,$nIndent=0)
	{
		$sIndent = str_repeat("\t",$nIndent) ;
		
		$sViewNameEsc = addslashes($sName) ;
		$sTemplateEsc = addslashes($aView->template()) ;
		
		$sJsCode = "{\r\n" ;
		$sJsCode.= "{$sIndent}	name:\"{$sViewNameEsc}\"\r\n" ;
		$sJsCode.= "{$sIndent}	, template:\"{$sTemplateEsc}\"\r\n" ;
		
		$sJsCode.= "{$sIndent}	, views:[" ;
		foreach($aView->nameIterator() as $idx=>$sChildViewName)
		{
			if($idx)
			{
				$sJsCode.= "\r\n{$sIndent}	, " ;
			}
			$sJsCode.= self::generateViewStructJcCode($aView->getByName($sChildViewName),$sChildViewName,$nIndent+1) ;
		}
		$sJsCode.= "]\r\n" ;
		
		$sJsCode.= $sIndent."}" ;
		
		return $sJsCode ;
	}
	
	static public function generateControllerStructJcCode(IController $aController,$sName=null,$nIndent=0)
	{
		$sClass = get_class($aController) ;
		if(!$sName)
		{
			$sName = $aController->name()?: $sClass ;
		}
		$sNameEsc = addslashes($sName) ;
		$sClassEsc = addslashes($sClass) ;
		$sTitleEsc = addslashes($aController->title()) ;
		$sIndent = str_repeat("\t",$nIndent) ;
		
		$sJsCode = "{\r\n" ;
		$sJsCode.= $sIndent."	name: \"{$sNameEsc}\"\r\n" ;
		$sJsCode.= $sIndent."	, class: \"{$sClassEsc}\"\r\n" ;
		$sJsCode.= $sIndent."	, params: \"\"\r\n" ;
		$sJsCode.= $sIndent."	, title: \"{$sTitleEsc}\"\r\n" ;
		
		// models
		$sJsCode.= $sIndent."	, models: [ " ;
		foreach($aController->modelNameIterator() as $idx=>$sModelName)
		{
			if($idx)
			{
				$sJsCode.= "\r\n{$sIndent}	, " ;
			}
			$sJsCode.= \org\opencomb\mvcmerger\aspect\ControllerAspect::generateModelStructJcCode($aController->modelByName($sModelName),$sModelName,$sIndent+1) ;
		}
		$sJsCode.= $sIndent." ]\r\n" ;
		
		// views
		$sJsCode.= $sIndent."	, views: [ " ;
		foreach($aController->mainView()->nameIterator() as $idx=>$sViewName)
		{
			if($idx)
			{
				$sJsCode.= "\r\n{$sIndent}	, " ;
			}
			$sJsCode.= \org\opencomb\mvcmerger\aspect\ControllerAspect::generateViewStructJcCode($aController->mainView()->getByName($sViewName),$sViewName,$sIndent+1) ;
		}
		$sJsCode.= $sIndent." ]\r\n" ;
		
		// controllers
		$sJsCode.= $sIndent."	, controller: [ " ;
		foreach($aController->nameIterator() as $idx=>$sChildControllerName)
		{
			if($idx)
			{
				$sJsCode.= "\r\n{$sIndent}	, " ;
			}
			$sJsCode.= \org\opencomb\mvcmerger\aspect\ControllerAspect::generateControllerStructJcCode($aController->getByName($sChildControllerName),$sChildControllerName,$sIndent+1) ;
		}
		$sJsCode.= $sIndent." ]\r\n" ;
		
		$sJsCode.= $sIndent."}" ;
		
		return $sJsCode ;
	}
}

?>