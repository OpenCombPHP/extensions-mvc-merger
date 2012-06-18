<?php
namespace org\opencomb\mvcmerger\merger ;

use org\opencomb\platform\service\ServiceSerializer;
use org\opencomb\platform\ext\Extension;
use org\opencomb\platform\service\Service;
use org\opencomb\mvcmerger\MvcMerger;
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
		if(!$this->params->has('template')
				 OR !$this->params->has('xpath')
				 OR !$this->params->has('position')
				 OR !$this->params->has('key')){
			return;
		}
		list($sNamespace,$sTemplate) = explode(':',$this->params['template']) ;
		$sXpath = $this->params->get('xpath');
		$sPostion =  $this->params->get('position');
		$sKey =  $this->params->get('key');
		// 在setting中搜寻配置
		$aKey = Extension::flyweight('mvc-merger')->setting()->key("/merge/uiweave/{$sNamespace}/{$sTemplate}",true) ;
		$arrPatchs = $aKey->item('arrPatchs',array()) ;
		
		if(!array_key_exists($sXpath,$arrPatchs)){
			return;
		}else{
			$arrPatchKeys = array_keys($arrPatchs[$sXpath]);
			foreach($arrPatchKeys as $nKey){
				if($arrPatchs[$sXpath][$nKey][0] == $sPostion 
						&& $nKey == $sKey ){
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
			ServiceSerializer::singleton()->clearRestoreCache(Service::singleton()) ;
				
			// 清理模板编译缓存
			MvcMerger::clearTemplateCompiled($sTemplate,$sNamespace) ;
			
			exit(1);
		}
	}
}
