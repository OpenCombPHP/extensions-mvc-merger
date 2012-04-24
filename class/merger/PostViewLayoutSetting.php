<?php
namespace org\opencomb\mvcmerger\merger ;

use org\opencomb\coresystem\auth\PurviewQuery;
use org\opencomb\coresystem\auth\Id;
use org\opencomb\platform\ext\Extension;
use org\opencomb\platform\service\ServiceSerializer;
use org\jecat\framework\util\DataSrc;
use org\opencomb\platform\service\Service;
use org\opencomb\mvcmerger\MvcMerger;
use org\jecat\framework\system\Application;
use org\jecat\framework\message\Message;
use org\opencomb\coresystem\mvc\controller\ControlPanel;

class PostViewLayoutSetting extends ControlPanel
{
	public function process()
	{
		//权限
		$this->requirePurview(Id::PLATFORM_ADMIN,'coresystem',PurviewQuery::ignore,'您没有这个功能的权限,无法继续浏览');
		
		$this->doActions() ;
	}
	
	protected function actionClear()
	{
		if( empty($this->params['controller']) )
		{
			$this->createMessage(Message::error,"缺少参数 controller") ;
			return ;
		}
		$sClassName = str_replace('\\','.',$this->params['controller']);
		$aSetting = Extension::flyweight('mvc-merger')->setting() ;
		$arrLayoutControllers = $aSetting->deleteKey('/merge/view_layout/'.$sClassName) ;
		
		// 清理类编译缓存
		MvcMerger::clearClassCompiled($this->params['controller']) ;
		
		// 清理平台缓存
		ServiceSerializer::singleton()->clearRestoreCache(Service::singleton()) ;
		
		$this->createMessage(Message::success,"视图设置已经清空。") ;
	}
	
	protected function actionSave()
	{
		if( empty($this->params['config']) )
		{
			$this->createMessage(Message::error,"缺少参数 config") ;
			return ;
		}
		if( empty($this->params['controller']) )
		{
			$this->createMessage(Message::error,"缺少参数 controller") ;
			return ;
		}
		if( empty($this->params['saveType']) )
		{
			$this->createMessage(Message::error,"缺少参数 saveType") ;
			return ;
		}
		
		$arrConfig = json_decode($this->params['config'],true) ;
		if(!$arrConfig)
		{
			$this->createMessage(Message::error,"config 数据无效") ;
			return ;
		}
		$sClassName = str_replace('\\','.',$this->params['controller']);
		
		$aSetting = Application::singleton()->extensions()->extension('mvc-merger')->setting() ;
		
		if($this->params['saveType'] == 'type'){
			$aSetting->setItem('/merge/view_layout/'.$sClassName,'*',$arrConfig) ;
		}else{
			$aSetting->setItem('/merge/view_layout/'.$sClassName,DataSrc::sortQuery($this->params['params']),$arrConfig) ;
		}
		
		// 清理类编译缓存
		MvcMerger::clearClassCompiled($this->params['controller']) ;
		
		// 清理平台缓存
		ServiceSerializer::singleton()->clearRestoreCache(Service::singleton()) ;
		
		$this->createMessage(Message::success,"配置已经保存。") ;
	}
}
