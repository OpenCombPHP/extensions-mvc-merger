<?php
namespace org\opencomb\mvcmerger\merger ;

use org\opencomb\platform\ext\Extension;

use org\opencomb\platform\Platform;

use org\opencomb\platform\system\PlatformFactory;

use org\opencomb\mvcmerger\MvcMerger;

use org\jecat\framework\system\Application;
use org\jecat\framework\message\Message;
use org\opencomb\coresystem\mvc\controller\ControlPanel;

class PostTemplateWeave extends ControlPanel
{
	protected function actionClear()
	{
	}
	
	protected function actionSave()
	{
		if( empty($this->params['template']) )
		{
			$this->createMessage(Message::error,"缺少参数 template") ;
			return ;
		}
		if( empty($this->params['xpath']) )
		{
			$this->createMessage(Message::error,"缺少参数 xpath") ;
			return ;
		}
		if( empty($this->params['position']) )
		{
			$this->createMessage(Message::error,"缺少参数 position") ;
			return ;
		}
		if( empty($this->params['source']) )
		{
			$this->createMessage(Message::error,"缺少参数 source") ;
			return ;
		}
		
		list($sNamespace,$sTemplate) = explode(':',$this->params['template']) ;
		$sNamespace = trim($sNamespace) ;
		$sTemplate = trim($sTemplate) ;
		if( empty($sNamespace) or empty($sTemplate) )
		{
			$this->createMessage(Message::error,"参数 position 格式错误") ;
			return ;
		}
		
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
		PlatformFactory::singleton()->clearRestoreCache(Platform::singleton()) ;
		
		// 清理模板编译缓存
		MvcMerger::clearTemplateCompiled($sTemplate,$sNamespace) ;
	}
	
	protected function actionList()
	{
		if( empty($this->params['template']) )
		{
			$this->createMessage(Message::error,"缺少参数 template") ;
			return ;
		}
		if( empty($this->params['namespace']) )
		{
			$this->createMessage(Message::error,"缺少参数 namespace") ;
			return ;
		}
		if( empty($this->params['xpath']) )
		{
			$this->createMessage(Message::error,"缺少参数 xpath") ;
			return ;
		}
		
		$sNamespace = trim($this->params['namespace']) ;
		$sTemplate = trim($this->params['template']) ;
		$xpath = trim($this->params['xpath']) ;
		
		$aKey = Extension::flyweight('mvc-merger')->setting()->key("/merge/uiweave/{$sNamespace}/{$sTemplate}",true) ;
		$arrPatchs = $aKey->item('arrPatchs',array()) ;
		
		$this->mainView()->display() ;
		$this->response()->output( isset($arrPatchs[$xpath])? json_encode($arrPatchs[$xpath]): '{}' ) ;
	}
}

?>