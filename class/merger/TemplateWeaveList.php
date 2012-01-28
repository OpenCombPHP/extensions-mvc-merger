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
	public function process()
	{
		$this->doActions() ;
	}
	
	protected function actionList(){
		if(!$this->params->has('namespace') OR !$this->params->has('xpath')){
			return;
		}
		list($sNamespace,$sTemplate) = explode(':',$this->params['namespace']) ;
		$sXpath = $this->params->get('xpath');
		
		// 提取配置
		$aKey = Extension::flyweight('mvc-merger')->setting()->key("/merge/uiweave/{$sNamespace}/{$sTemplate}",true) ;
		$arrPatchs = $aKey->item('arrPatchs',array()) ;
		if(!array_key_exists($sXpath,$arrPatchs)){
			return;
		}else{
			echo json_encode($arrPatchs[$sXpath]);
			exit(1);
		}
	}
	
	protected function actionDelete(){
		if(!$this->params->has('template') OR !$this->params->has('xpath') OR !$this->params->has('position') OR !$this->params->has('source')){
			return;
		}
		list($sNamespace,$sTemplate) = explode(':',$this->params['template']) ;
		$sXpath = $this->params->get('xpath');
		$sPostion =  $this->params->get('position');
		$sSource =  $this->params->get('source');
		
		// 在setting中搜寻配置
		$aKey = Extension::flyweight('mvc-merger')->setting()->key("/merge/uiweave/{$sNamespace}/{$sTemplate}",true) ;
		$arrPatchs = $aKey->item('arrPatchs',array()) ;
		
		if(!array_key_exists($sXpath,$arrPatchs)){
			return;
		}else{
			$arrPatchKeys = array_keys($arrPatchs[$sXpath]);
			
			foreach($arrPatchKeys as $nKey){
				if($arrPatchs[$sXpath][$nKey][0] == $sPostion && $arrPatchs[$sXpath][$nKey][1] == $sSource){
					unset($arrPatchs[$sXpath][$nKey]);
				}
			}
			
			if(count($arrPatchs[$sXpath])==0){
				unset($arrPatchs[$sXpath]);
				if(count($arrPatchs)==0){
					Extension::flyweight('mvc-merger')->setting()->deleteKey("/merge/uiweave/{$sNamespace}/{$sTemplate}") ;
				}
			}else{
				$aKey['arrPatchs'] = $arrPatchs ;
			}
			
			//清理系统缓存
			PlatformSerializer::singleton()->clearRestoreCache(Platform::singleton()) ;
				
			// 清理模板编译缓存
			MvcMerger::clearTemplateCompiled($sTemplate,$sNamespace) ;
			
			exit(1);
		}
	}
}
?>