<?php
namespace org\opencomb\mvcmerger\aspect ;

use org\jecat\framework\mvc\view\View;

use org\jecat\framework\mvc\model\IModel;
use org\jecat\framework\mvc\controller\IController;
use org\jecat\framework\pattern\composite\IContainer;
use org\jecat\framework\mvc\view\IView;
use org\jecat\framework\mvc\controller\Controller;
use org\jecat\framework\lang\aop\jointpoint\JointPointMethodDefine;

class MVCBrowser
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
		$sJsCode.= "var _mvcstruct = " . \org\opencomb\mvcmerger\aspect\MVCBrowser::generateControllerStructJcCode($this) . "; \r\n" ;
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
			$sJsCode.= \org\opencomb\mvcmerger\aspect\MVCBrowser::generateModelStructJcCode($aModel->child($sModelName),$sModelName,$sIndent+1) ;
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
		$sJsCode.= $sIndent."	, class: \"{$sClassEsc}\"\r\n" ;
		$sJsCode.= $sIndent."	, params: \"\"\r\n" ;
		$sJsCode.= $sIndent."	, title: \"{$sTitleEsc}\"\r\n" ;
		$sJsCode.= $sIndent."	, params: \"".http_build_query($arrParams)."\"\r\n" ;
		
		// models
		$sJsCode.= $sIndent."	, models: [ " ;
		foreach($aController->modelNameIterator() as $idx=>$sModelName)
		{
			if($idx)
			{
				$sJsCode.= "\r\n{$sIndent}	, " ;
			}
			$sJsCode.= \org\opencomb\mvcmerger\aspect\MVCBrowser::generateModelStructJcCode($aController->modelByName($sModelName),$sModelName,$sIndent+1) ;
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
			$sJsCode.= \org\opencomb\mvcmerger\aspect\MVCBrowser::generateViewStructJcCode($aController->mainView()->getByName($sViewName),$sViewName,$sIndent+1) ;
		}
		$sJsCode.= $sIndent." ]\r\n" ;
		
		// controllers
		$sJsCode.= $sIndent."	, controllers: [ " ;
		foreach($aController->nameIterator() as $idx=>$sChildControllerName)
		{
			if($idx)
			{
				$sJsCode.= "\r\n{$sIndent}	, " ;
			}
			$sJsCode.= \org\opencomb\mvcmerger\aspect\MVCBrowser::generateControllerStructJcCode($aController->getByName($sChildControllerName),$sChildControllerName,$sIndent+1) ;
		}
		$sJsCode.= $sIndent." ]\r\n" ;
		
		$sJsCode.= $sIndent."}" ;
		
		return $sJsCode ;
	}
}

?>