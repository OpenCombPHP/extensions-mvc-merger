<?php
namespace org\opencomb\mvcmerger\merger ;

use org\opencomb\platform\Platform;

use org\opencomb\platform\system\PlatformFactory;

use org\opencomb\mvcmerger\MvcMerger;

use org\jecat\framework\system\Application;
use org\jecat\framework\message\Message;
use org\opencomb\coresystem\mvc\controller\ControlPanel;

class PostViewLayoutSetting extends ControlPanel
{
	public function process()
	{
		$this->doActions() ;
	}
	
	protected function actionClear()
	{
		if( empty($this->params['controller']) )
		{
			$this->createMessage(Message::error,"缺少参数 controller") ;
			return ;
		}
		
		$aSetting = Application::singleton()->extensions()->extension('mvc-merger')->setting() ;
		$arrLayoutControllers = $aSetting->item('/merge/view_layout','controllers',array()) ;
		
		unset($arrLayoutControllers[$this->params['controller']]) ;
		
		$aSetting->setItem('/merge/view_layout','controllers',$arrLayoutControllers) ;
		
		// 清理类编译缓存
		MvcMerger::clearClassCompiled($this->params['controller']) ;
		
		// 清理平台缓存
		PlatformFactory::singleton()->clearRestoreCache(Platform::singleton()) ;
		
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
		
		$arrConfig = json_decode($this->params['config'],true) ;
		if(!$arrConfig)
		{
			$this->createMessage(Message::error,"config 数据无效") ;
			return ;
		}
		
		$aSetting = Application::singleton()->extensions()->extension('mvc-merger')->setting() ;
		$arrLayoutControllers = $aSetting->item('/merge/view_layout','controllers',array()) ;
		
		$arrLayoutControllers[$this->params['controller']] = $arrConfig ;
		$aSetting->setItem('/merge/view_layout','controllers',$arrLayoutControllers) ;
		
		// 清理类编译缓存
		MvcMerger::clearClassCompiled($this->params['controller']) ;
		
		// 清理平台缓存
		PlatformFactory::singleton()->clearRestoreCache(Platform::singleton()) ;
		
		$this->createMessage(Message::success,"配置已经保存。") ;
	}
}

?>