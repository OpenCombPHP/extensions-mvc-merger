<?php
namespace org\opencomb\mvcmerger\merger ;

use org\opencomb\mvcmerger\MvcMerger;

use org\opencomb\system\PlatformFactory;
use org\opencomb\Platform;
use org\jecat\framework\lang\oop\ClassLoader;
use org\jecat\framework\lang\Type;
use org\jecat\framework\message\Message;
use org\jecat\framework\system\Application;
use org\opencomb\coresystem\mvc\controller\ControlPanel ;

class ControllerMerger extends ControlPanel
{
	public function createBeanConfig()
	{
		return array(
			'view:form' => array(
					'template' => 'ControllerMerger.html' ,
					'class' => 'form' ,
			) ,
		) ;
	}
	
	public function process()
	{
		$this->doActions() ;
		
		$aSetting = Application::singleton()->extensions()->extension('mvc-merger')->setting() ;
		$arrMergedControllers = $aSetting->item('/merge/controller','controllers',array()) ;
		
		$this->form->variables()->set('arrMergedControllers',$arrMergedControllers) ;
	}
	
	protected function actionMerge()
	{
		if( !$this->form->isSubmit($this->params) )
		{
			return ;
		}
		
		$aSetting = Application::singleton()->extensions()->extension('mvc-merger')->setting() ;
		$arrMergedControllers = $aSetting->item('/merge/controller','controllers',array()) ;
		
		foreach(array('目标控制器类'=>'target_controller_class','融入控制器类'=>'source_controller_class') as $sName=>$sDataName)
		{
			if( empty($this->params[$sDataName]) )
			{
				$this->form->createMessage(Message::error,"%s 不能为空",$sName) ;
				return ;
			}
			if( !class_exists($this->params[$sDataName]) )
			{
				$this->form->createMessage(Message::error,"输入的%s控制器类不存在：%s",array($sName,$this->params[$sDataName])) ;
				return ;
			}
			if( !Type::hasImplements($this->params[$sDataName],'org\\jecat\\framework\\mvc\\controller\\IController') )
			{
				$this->form->createMessage(Message::error,"输入的%s不是有效的控制器类：%s",array($sName,$this->params[$sDataName])) ;
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
		PlatformFactory::singleton()->clearRestoreCache(Platform::singleton()) ;
	
		$this->form->createMessage(Message::success,"已经将控制器 %s 融合到控制器 %s 中",array($this->params['source_controller_class'],$this->params['target_controller_class'])) ;
	}
	
	protected function actionRemoveMerge()
	{
		if( empty($this->params['target']) )
		{
			$this->form->createMessage(Message::error,"缺少target参数") ;
			return ;
		}
		
		$aSetting = Application::singleton()->extensions()->extension('mvc-merger')->setting() ;
		$arrMergedControllers = $aSetting->item('/merge/controller','controllers',array()) ;
		
		if( empty($arrMergedControllers[$this->params['target']]) )
		{
			$this->form->createMessage(Message::error,"target参数无效") ;
			return ;
		}
		
		$nIdx = $this->params->int('idx') ;
		
		// 清除target 所有的 融合
		if( $nIdx<0)
		{
			unset($arrMergedControllers[$this->params['target']]) ;
			
			$aSetting->setItem('/merge/controller','controllers',$arrMergedControllers) ;
			$this->form->createMessage(Message::success,"清除了控制器 %s 的所有融合设置",array($this->params['target'])) ;
		}
		// 删除指定的融合
		else if( empty($arrMergedControllers[$this->params['target']][$nIdx]) )
		{
			$this->form->createMessage(Message::error,"idx参数无效") ;
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
			
			$this->form->createMessage(Message::success,"删除了控制器 %s 的指定融合设置",array($this->params['target'])) ;
		}
			
		// 清理 class 编译缓存
		MvcMerger::clearClassCompiled($this->params['target']) ;
		
		// 清理平台缓存
		PlatformFactory::singleton()->clearRestoreCache(Platform::singleton()) ;
	}
}

?>