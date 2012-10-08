<?php
namespace org\opencomb\mvcmerger\merger ;

use org\opencomb\coresystem\auth\Id;
use org\opencomb\coresystem\auth\PurviewQuery;
use org\opencomb\platform\service\ServiceSerializer;
use org\opencomb\platform\ext\Extension;
use org\opencomb\platform\service\Service;
use org\opencomb\mvcmerger\MvcMerger;
use org\jecat\framework\message\Message;
use org\opencomb\coresystem\mvc\controller\ControlPanel;

class PostTemplateWeave extends ControlPanel
{
	
	public function process(){
		//权限
		$this->requirePurview(Id::PLATFORM_ADMIN,'coresystem',PurviewQuery::ignore,'您没有权限执行正在请求的操作。');
		$this->doActions();
	}
	
	protected function save()
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
		$aSetting =  Extension::flyweight('mvc-merger')->setting();
		$arrPatchs = $aSetting->value("/merge/uiweave/{$sNamespace}/{$sTemplate}/arrPatchs",array());
		$arrPatchs[$this->params['xpath']][] = array(
				$this->params['position'] ,
				$this->params['source'] ,
		) ;

		$aSetting->setValue("/merge/uiweave/{$sNamespace}/{$sTemplate}/arrPatchs",$arrPatchs);
		
		// 清理系统缓存
		ServiceSerializer::singleton()->clearRestoreCache(Service::singleton()) ;
		// 清理模板编译缓存
		MvcMerger::clearTemplateCompiled($sTemplate,$sNamespace) ;

		$this->createMessage(Message::success,"配置已经保存。") ;
	}
	
	protected function doList()
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
		
		$arrPatchs = Extension::flyweight('mvc-merger')->setting()->value("/merge/uiweave/{$sNamespace}/{$sTemplate}/arrPatchs",array()) ;
		
		$this->mainView()->display() ;
		$this->response()->output( isset($arrPatchs[$xpath])? json_encode($arrPatchs[$xpath]): '{}' ) ;
	}
}
