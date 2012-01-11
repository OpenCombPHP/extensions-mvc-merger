<?php
namespace org\opencomb\mvcmerger\merger ;

use org\opencomb\platform\system\PlatformSerializer;
use org\opencomb\platform\ext\Extension;
use org\opencomb\platform\Platform;
use org\opencomb\platform\system\PlatformFactory;
use org\opencomb\mvcmerger\MvcMerger;
use org\jecat\framework\system\Application;
use org\jecat\framework\message\Message;
use org\opencomb\coresystem\mvc\controller\ControlPanel;

class TemplateWeaveList extends ControlPanel
{
	public function process(){
		if(!$this->params->has('namespace') OR !$this->params->has('xpath')){
			return;
		}
		list($sNamespace,$sTemplate) = explode(':',$this->params['namespace']) ;
		$sXpath = $this->params->get('xpath');
		
		// 保存配置
		$aKey = Extension::flyweight('mvc-merger')->setting()->key("/merge/uiweave/{$sNamespace}/{$sTemplate}",true) ;
		
		$arrPatchs = $aKey->item('arrPatchs',array()) ;
		$arrPatchs[$this->params['xpath']][] = array(
				$this->params['position'] , 
				$this->params['source'] , 
		) ;
		$aKey['arrPatchs'] = $arrPatchs ;
		
		$this->createMessage(Message::success,"配置已经保存。") ;
		
		// 清理系统缓存
		PlatformSerializer::singleton()->clearRestoreCache(Platform::singleton()) ;
		
		// 清理模板编译缓存
		MvcMerger::clearTemplateCompiled($sTemplate,$sNamespace) ;
	}
}
?>