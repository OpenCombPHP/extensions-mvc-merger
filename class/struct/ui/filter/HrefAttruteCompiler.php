<?php
namespace org\opencomb\mvcmerger\struct\ui\filter ;

use org\jecat\framework\ui\ObjectContainer;
use org\jecat\framework\ui\xhtml\compiler\TextCompiler;
use org\jecat\framework\lang\Type;
use org\jecat\framework\ui\TargetCodeOutputStream;
use org\jecat\framework\ui\CompilerManager;
use org\jecat\framework\ui\IObject;

class HrefAttruteCompiler extends TextCompiler
{
	public function compile(IObject $aObject, ObjectContainer $aObjectContainer,TargetCodeOutputStream $aDev,CompilerManager $aCompilerManager)
	{
		Type::check("org\\jecat\\framework\\ui\\xhtml\\AttributeValueLink",$aObject) ;

		$aDev->putCode("\$__oriDeviceForLinkHrefStrategy = \$aDevice ;");
		$aDev->putCode("\$aDevice = \\org\\opencomb\\mvcmerger\\struct\\ui\\filter\\UILinkHrefFilter::singleton() ;");

		parent::compile($aObject, $aObjectContainer, $aDev, $aCompilerManager) ;
		
		$aDev->putCode("\$__oriDeviceForLinkHrefStrategy->write( \$aDevice->output() ) ;") ;
		$aDev->putCode("\$aDevice = \$__oriDeviceForLinkHrefStrategy ;") ;
	}
}
