<?php
namespace org\opencomb\mvcmerger\merger ;

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
		
		
		
		$this->createMessage(Message::success,"配置已经保存。") ;
	}
}

?>