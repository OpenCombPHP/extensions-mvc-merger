<?php
namespace org\opencomb\mvcmerger\merger\ui ;

use org\opencomb\platform\ext\ExtensionManager;
use org\jecat\framework\ui\xhtml\weave\PatchSlotPath;
use org\jecat\framework\ui\xhtml\Text;
use org\jecat\framework\ui\IObject;
use org\jecat\framework\ui\xhtml\AttributeValue;
use org\jecat\framework\ui\xhtml\Attributes;
use org\jecat\framework\ui\xhtml\Tag;
use org\jecat\framework\ui\xhtml\Node;
use org\jecat\framework\ui\IInterpreter;
use org\jecat\framework\ui\ObjectContainer;
use org\jecat\framework\util\String;
use org\jecat\framework\ui\UI;

class UIObjectBrowserInfo implements IInterpreter
{
	public function parse(String $aSource,ObjectContainer $aObjectContainer,UI $aUI)
	{
		$sExtensionName = $aObjectContainer->ns();
		$sTemplateName = $aObjectContainer->templateName();
		$sTemplate = $sExtensionName . ':' . $sTemplateName ;
		
		$sTemplateEsc = addslashes($sTemplate) ;
		// 反射 xpath 
		PatchSlotPath::reflectXPath($aObjectContainer) ;
		
		// output struct
		$sStructJson = "<script>\r\n" ;
		$sStructJson.= "if(typeof(__uitemplates)=='undefined'){ var __uitemplates = {} ;}\r\n" ;
		$sStructJson.= "__uitemplates[\"{$sTemplateEsc}\"] = " ;
		$sStructJson.= $this->buildUIObjectXPath($aObjectContainer , $sExtensionName , $sTemplateName) ;
		$sStructJson.= "\r\n</script>\r\n" ;
		
		// ----------------------
		// 添加 <template> wrapper
		$aTemplateNodeAttrs = new Attributes() ;
		$aTemplateNodeAttrs->add( AttributeValue::createInstance('file',$sTemplate) ) ;
		
		$aTemplateNode = new Node(
				new Tag('uitemplate', $aTemplateNodeAttrs, Tag::TYPE_HEAD,0,0,0,'<template>')
				, new Tag('uitemplate',null,Tag::TYPE_TAIL,0,0,0,'</template>')
		) ;
		foreach($aObjectContainer->iterator() as $aTopObject)
		{
			$aObjectContainer->remove($aTopObject) ;
			$aTemplateNode->add($aTopObject) ;
		}
		$aObjectContainer->add($aTemplateNode) ;
		
		$aObjectContainer->add( new Text(0,0,0,$sStructJson) ) ;
	}
	
	public function buildUIObjectXPath(IObject $aObject, $sExtensionName , $sTemplateName , $nIndent=0)
	{
		$sIndent = str_repeat("\t",$nIndent) ;
		$sStructJson = "{\r\n" ;
 		$sStructJson.= "{$sIndent} className:'".str_replace('\\','\\\\',get_class($aObject))."'\r\n" ;
//  		$sStructJson.= "{$sIndent} , ExtensionName:'".$sExtensionName."'\r\n" ;
//  		$sStructJson.= "{$sIndent} , sTemplateName:'".$sTemplateName."'\r\n" ;

		if( $aObject instanceof Node )
		{
			$sXPath = $aObject->properties()->get('xpath') ;
			
			//计算补丁个数
			$nPatchNum = 0 ;
			$aSetting = ExtensionManager::singleton()->extension('mvc-merger')->setting() ;
			$arrPatchs = $aSetting->value("/merge/uiweave/" . $sExtensionName . '/' . $sTemplateName . 'arrPatchs' ,false);
			if(isset($arrPatchs[$sXPath])){
				$nPatchNum = count($arrPatchs[$sXPath]);
			}
			
			$aObject->attributes()->add( AttributeValue::createInstance('uixpath',$sXPath) ) ;
		
			$sStructJson.= "{$sIndent}	, tag:'".$aObject->tagName()."'\r\n" ;
			$sStructJson.= "{$sIndent}	, uixpath:'{$sXPath}'\r\n" ;
			$sStructJson.= "{$sIndent}	, patchNum:'{$nPatchNum}'\r\n" ;  //补丁个数
		}
		
		$sStructJson.= "{$sIndent}	, children:[" ;
		$arrChildJsons = array() ;
		foreach($aObject->iterator() as $aChildObject)
		{
			if( $aChildObject instanceof Node )
			{
				$arrChildJsons[] = $this->buildUIObjectXPath($aChildObject, $sExtensionName , $sTemplateName ,$nIndent+1) ;
			}
		}
		$sStructJson.= implode(",\r\n{$sIndent}\t",$arrChildJsons)."]\r\n" ;
		
		$sStructJson.= "{$sIndent}}" ;
		
		return $sStructJson ;
	}
	
	public function parentNodeXPath(Node $aObject)
	{
		$aParent = $aObject->parent() ;
		
		if( !($aParent instanceof Node) )
		{
			return '' ;
		}
			
		return $aParent->attributes()->string('xpath') ;
	}
	
	public function compileStrategySignture()
	{
		return '138f35707fa2af07737bc5a5373d8275' ;
	}
}