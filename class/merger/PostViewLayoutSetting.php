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
		$this->requirePurview(Id::PLATFORM_ADMIN,'coresystem',PurviewQuery::ignore,'您没有权限执行正在请求的操作。');
		$this->doActions();
	}
	
	protected function clean()
	{
		if( empty($this->params['controller']) )
		{
			$this->createMessage(Message::error,"缺少参数 controller") ;
			return ;
		}
		
		if( empty($this->params['requestparams']) )
		{
			$this->createMessage(Message::error,"缺少参数 requestparams") ;
			return ;
		}
		$sParams = $this->unserializeParams($this->params['requestparams']);
		
		$sClassName = str_replace('\\','.',$this->params['controller']);
		$aSetting = Extension::flyweight('mvc-merger')->setting() ;
		$aSetting->deleteItem('/merge/layout/'.$sClassName , $sParams) ;
						
		$this->createMessage(Message::success,"视图设置已经清空。刷新页面查看更改。") ;
	}
	
	protected function save()
	{
		if( empty($this->params['layout']) )
		{
			$this->createMessage(Message::error,"缺少参数 layout") ;
			return ;
		}
		if(!is_array($this->params['layout']))
		{
			$this->createMessage(Message::error,"layout 数据无效") ;
			return ;
		}
		
		if( empty($this->params['controller']) )
		{
			$this->createMessage(Message::error,"缺少参数 controller") ;
			return ;
		}
		$sClassName = str_replace('\\','.',$this->params['controller']);
		
		if( empty($this->params['requestparams']) )
		{
			$this->createMessage(Message::error,"缺少参数 requestparams") ;
			return ;
		}
		
		$sParams = $this->unserializeParams($this->params['requestparams']);
		
		$arrSetting = array();
		$arrSetting['assemble'] = $this->params['layout'];
		if(!empty($this->params['properties']))
		{
			$arrSetting['properties'] = $this->params['properties'];
		}
		
		$aSetting = Extension::flyweight('mvc-merger')->setting() ;
		
		// 保存设定
		$aSetting->setItem('/merge/layout/'.$sClassName , $sParams , $arrSetting) ;
		
		$this->createMessage(Message::success,"视图布局配置已经保存。") ;
	}
	
	static public function unserializeParams($sParams){
		$sParams = str_replace('@', '&', $sParams);
		$sParams = str_replace('^', '=', $sParams);
		$arrParams = explode("&", $sParams);
		natsort($arrParams);
		return implode('&', $arrParams);
	}
}
