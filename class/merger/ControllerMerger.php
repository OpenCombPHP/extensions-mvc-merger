<?php
namespace org\opencomb\mvcmerger\merger ;

use org\jecat\framework\system\AccessRouter;
use org\jecat\framework\mvc\controller\Request;
use org\opencomb\coresystem\auth\Id;
use org\opencomb\platform\service\ServiceSerializer;
use org\opencomb\mvcmerger\MvcMerger;
use org\opencomb\platform\system\PlatformFactory;
use org\opencomb\platform\service\Service;
use org\jecat\framework\lang\Type;
use org\jecat\framework\message\Message;
use org\jecat\framework\system\Application;
use org\opencomb\coresystem\mvc\controller\ControlPanel;

class ControllerMerger extends ControlPanel
{
	protected $arrConfig = array(
		'title'=>'模板编制',
		'view' => array(
				'template' => 'ControllerMerger.html' ,
		) ,
		'perms' => array(
			// 权限类型的许可
			'perm.purview'=>array(
				'namespace'=>'coresystem',
				'name' => Id::PLATFORM_ADMIN,
			) ,
		) ,
	) ;

	public function process()
	{
		$this->doActions() ;
		
		$aSetting = Application::singleton()->extensions()->extension('mvc-merger')->setting() ;
		$arrMergedControllers = $aSetting->item('/merge/controller','controllers',array()) ;
		
		$this->view->variables()->set('arrMergedControllers',$arrMergedControllers) ;
		//表单默认值
		$sRequestC ='';
		$arrRequest = array();
		if($this->params->request){
			$sRequest = str_replace('^','=',str_replace('@', '&', $this->params->request));
			$arrRequest = explode('&',$sRequest);
			$sRequestC= '';
			foreach($arrRequest as $key=>$value){
				if(strpos($value,'c=')===0){
					$sRequestC = substr($value ,2);
					unset($arrRequest[$key]);
				}else if(strpos($value,'mvcmerger')===0){
					unset($arrRequest[$key]);
				}
			}
		}
		$this->view->variables()->set('sRequestC',AccessRouter::singleton()->transControllerClass($sRequestC)) ;
		$this->view->variables()->set('sRequestParams',implode('&', $arrRequest)) ;
	}
	
	protected function merge()
	{
		if( !$this->view->isSubmit($this->params) )
		{
			return ;
		}
		
		$aSetting = Application::singleton()->extensions()->extension('mvc-merger')->setting() ;
		$arrMergedControllers = $aSetting->item('/merge/controller','controllers',array()) ;
		
		foreach(array('目标控制器类'=>'target_controller_class','融入控制器类'=>'source_controller_class') as $sName=>$sDataName)
		{
			if( empty($this->params[$sDataName]) )
			{
				$this->view->createMessage(Message::error,"%s 不能为空",$sName) ;
				return ;
			}
			if( !class_exists($this->params[$sDataName]) )
			{
				$this->view->createMessage(Message::error,"输入的%s控制器类不存在：%s",array($sName,$this->params[$sDataName])) ;
				return ;
			}
			if( $this->params[$sDataName] instanceof \org\jecat\framework\mvc\controller\Controller )
			{
				$this->view->createMessage(Message::error,"输入的%s不是有效的控制器类：%s",array($sName,$this->params[$sDataName])) ;
				return ;
			}
	
		}
	
		$arrMergedControllers[ $this->params['target_controller_class'] ][] = array(
					'controller' => $this->params['source_controller_class'] ,
					'params' => $this->params->string('source_controller_params') ,
					'name' => $this->params->string('source_controller_name') ,
					'comment' => $this->params->string('source_controller_comment') ,
		) ;
		$aSetting->setItem('/merge/controller','controllers',$arrMergedControllers) ;
		
		// 清理类编译缓存
		MvcMerger::clearClassCompiled($this->params['target_controller_class']) ;
		
		// 清理平台缓存
		ServiceSerializer::singleton()->clearRestoreCache(Service::singleton());
	
		$this->view->createMessage(Message::success,"已经将控制器 %s 融合到控制器 %s 中",array($this->params['source_controller_class'],$this->params['target_controller_class'])) ;
	}
	
	protected function removeMerge()
	{
		if( empty($this->params['target']) )
		{
			$this->view->createMessage(Message::error,"缺少target参数") ;
			return ;
		}
		
		$aSetting = Application::singleton()->extensions()->extension('mvc-merger')->setting() ;
		$arrMergedControllers = $aSetting->item('/merge/controller','controllers',array()) ;
		
		if( empty($arrMergedControllers[$this->params['target']]) )
		{
			$this->view->createMessage(Message::error,"target参数无效") ;
			return ;
		}
		
		$nIdx = $this->params->int('idx') ;
		
		// 清除target 所有的 融合
		if( $nIdx<0)
		{
			unset($arrMergedControllers[$this->params['target']]) ;
			
			$aSetting->setItem('/merge/controller','controllers',$arrMergedControllers) ;
			$this->view->createMessage(Message::success,"清除了控制器 %s 的所有融合设置",array($this->params['target'])) ;
		}
		// 删除指定的融合
		else if( empty($arrMergedControllers[$this->params['target']][$nIdx]) )
		{
			$this->view->createMessage(Message::error,"idx参数无效") ;
			return ;
		}
		else
		{
			unset($arrMergedControllers[$this->params['target']][$nIdx]) ;
			
			if(empty($arrMergedControllers[$this->params['target']]))
			{
				unset($arrMergedControllers[$this->params['target']]) ;
			}
			
			$aSetting->setItem('/merge/controller','controllers',$arrMergedControllers) ;
			
			$this->view->createMessage(Message::success,"删除了控制器 %s 的指定融合设置",array($this->params['target'])) ;
		}
			
		// 清理 class 编译缓存
		MvcMerger::clearClassCompiled($this->params['target']) ;
		
		// 清理平台缓存
// 		PlatformFactory::singleton()->clearRestoreCache(Service::singleton()) ;
	}
}
