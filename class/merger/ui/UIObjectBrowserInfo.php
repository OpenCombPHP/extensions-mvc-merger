<?php
namespace org\opencomb\mvcmerger\merger\ui ;

use org\jecat\framework\ui\xhtml\Text;

use org\jecat\framework\ui\IObject;
use org\jecat\framework\ui\xhtml\AttributeValue;
use org\jecat\framework\ui\xhtml\Attributes;
use org\jecat\framework\ui\xhtml\Tag;
use org\jecat\framework\ui\xhtml\Node;
use org\jecat\framework\ui\IInterpreter;
use org\jecat\framework\ui\ObjectContainer ;
use org\jecat\framework\util\String;
use org\jecat\framework\ui\UI;

class UIObjectBrowserInfo implements IInterpreter
{
	public function parse(String $aSource,ObjectContainer $aObjectContainer,UI $aUI)
	{
		$sTemplate = $aObjectContainer->ns().':'.$aObjectContainer->templateName() ;
		$sTemplateEsc = addslashes($sTemplate) ;
		
		// xpath
		$sStructJson = "<script>\r\n" ;
		$sStructJson.= "if(typeof(__uitemplates)=='undefined'){ var __uitemplates = {} ;}\r\n" ;
		$sStructJson.= "__uitemplates[\"{$sTemplateEsc}\"] = " ;
		$this->buildUIObjectXPath($aObjectContainer,0,$sStructJson) ;
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
	
	public function buildUIObjectXPath(IObject $aObject,$nIdx=0,&$sStructJson,$nIndent=0)
	{
		$sIndent = str_repeat("\t",$nIndent) ;
		$sStructJson.= "{\r\n" ;
		$sStructJson.= "{$sIndent}	class:'".get_class($aObject)."'\r\n" ;
		
		if( $aObject instanceof Node )
		{
			$sXPath = $this->parentNodeXPath($aObject) . '/' . strtolower($aObject->tagName()) . '@' . $nIdx ;
			$aObject->attributes()->add( AttributeValue::createInstance('xpath',$sXPath) ) ;
		
			$sStructJson.= "{$sIndent}	, tag:'".$aObject->tagName()."'\r\n" ;
			$sStructJson.= "{$sIndent}	, xpath:'{$sXPath}'\r\n" ;
		}
		
		$sStructJson.= "{$sIndent}	, children:[" ;
		foreach($aObject->iterator() as $nIdx=>$aChildObject)
		{
			if($nIdx)
			{
				$sStructJson.= ",\r\n{$sIndent}	" ;
			}
			$this->buildUIObjectXPath($aChildObject,$nIdx,$sStructJson,$nIndent+1) ;
		}
		$sStructJson.= "]\r\n" ;
		
		$sStructJson.= "{$sIndent}}" ;
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

?>