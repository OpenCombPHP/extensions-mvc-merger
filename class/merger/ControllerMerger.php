<?php
namespace org\opencomb\mvcmerger\merger ;

use org\jecat\framework\ui\SourceFileManager;
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
		$arrMergedControllers = $aSetting->value('/merge/controller/controllers',array()) ;
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
		
		//模板列表
		$arrTemplates = array();
		foreach(SourceFileManager::singleton()->folderNamespacesIterator() as $sNameSpace){
			$sExpresionName = $sNameSpace;
			if($sNameSpace == 'org.jecat.framework'){
				$sExpresionName = 'framework';
			}else if($sNameSpace == 'org.opencomb.platform'){
				$sExpresionName = 'platform';
			}
			$arrParent = array(
					'name'=>"扩展:".$sExpresionName
					, 'children'=>array()
			);
			$arrUnique = array();//防止重复扫描路径
			foreach(SourceFileManager::singleton()->folderIterator($sNameSpace) as $aForlder){
				//后面的覆盖出现过的,比如:template文件夹下有个index.html,在template_coresystem中也有个index.html,那么前面的应该剔除
				//这里通过key唯一的方式来做到上面提到的覆盖效果
				$sPath = $aForlder->path();
				//防止重复扫描路径
				if(in_array($sPath , $arrUnique)){
					continue;
				}
				$arrUnique[] = $sPath;
				
				$this->scanTemplates($sPath ,$arrParent['children']);
			}
			$arrTemplates[] = $arrParent;
		}
		foreach($arrTemplates as $key => $value){
			$value['children'][0]['name'] = $value['name'];
			$arrTemplates[$key] = $value['children'][0];
		}
		
		$this->view->variables()->set('arrTemplateTreeData' , json_encode( $arrTemplates )) ;
		$this->view->variables()->set('sRequestC',AccessRouter::singleton()->transControllerClass($sRequestC)) ;
		$this->view->variables()->set('sRequestParams',implode('&', $arrRequest)) ;
	}
	
	public function scanTemplates($sDir ,&$arrData){
		if (is_dir($sDir)) 
		{
			$arrParent = array(
					'name'=>$sDir
					, 'children' => array()
			);
			$arrChildren = end($arrData);
			$children = scandir($sDir); 
			foreach ($children as $child) { 
				if ($child !== '.' && $child !== '..'){ 
					$this->scanTemplates($sDir.'/'.$child ,$arrParent['children']); 
				} 
			}
			$arrName = explode( DIRECTORY_SEPARATOR , $arrParent['name'] );
			$arrParent['name'] = array_pop($arrName);
			$arrParent['isDir'] = true;
			$arr = array();
			foreach($arrData as $nBrotherKey => $brother){
				if( $brother['isDir'] === true){
					continue;
				}
				$arrSlice = array_slice($arrData,0,$nBrotherKey);
				$arrSlice[] = $arrParent;
				$arr = array_merge( $arrSlice , array_slice($arrData,$nBrotherKey) );
				break;
			}
			if($arr === array()){
				$arrData[] = $arrParent;
			}else{
				$arrData = $arr;
			}
		}else{
			$extend = pathinfo($sDir);
			$extend = strtolower($extend["extension"]);
			if($extend != 'html' && $extend != 'htm'){
				return;
			}
			$arrName = explode( DIRECTORY_SEPARATOR , $sDir );
			$arrData[] = array(
					'name'=>array_pop($arrName)
					, 'isDir' => false
					);
		}
	}
	
	protected function form()
	{
		$aSetting = Application::singleton()->extensions()->extension('mvc-merger')->setting() ;
		$arrMergedControllers = $aSetting->value('/merge/controller/controllers',array()) ;
		$nNum = $aSetting->value('/merge/controller/num',0) ; //命名计数
		
		//目标信息防御
		if( empty($this->params['target']) )
		{
			$this->view->createMessage(Message::error,"%s 不能为空",'控制器类') ;
			return ;
		}
		if( !class_exists($this->params['target']) )
		{
			$this->view->createMessage(Message::error,"输入的%s控制器类不存在：%s",array('控制器类',$this->params['target'])) ;
			return ;
		}
// 		if( $this->params['target'] instanceof \org\jecat\framework\mvc\controller\Controller )
// 		{
// 			$this->view->createMessage(Message::error,"输入的%s不是有效的控制器类：%s",array('控制器类',$this->params['target'])) ;
// 			return ;
// 		}
		
		//保存类型
		$sSaveType = '';
		//如果针对指定页面
		if($this->params['saveType'] == 'current' || $this->params['saveType'] == 'special'){
			$sSaveType = $this->params->string('targetParams');
		}else{
			//针对一类网页
			$sSaveType = 'type';
		}
		if($sSaveType == ''){
			$sSaveType = 'type';
		}
		
		//插入view信息防御及针对处理
		$sMergeType = $this->params['mergeType'];
		
 		if($sMergeType == 'text'){
 			if( empty($this->params['sourceContent']) )
 			{
 				$this->view->createMessage(Message::error,"%s 不能为空",'视图内容') ;
 				return ;
 			}
 			if( empty($this->params['target']) )
 			{
 				$this->view->createMessage(Message::error,"%s 不能为空",'控制器类') ;
 				return ;
 			}
 			
 			$arrMergedControllers[ $this->params['target'] ][$sSaveType][$nNum+1] = array(
 					'mergeType' => $sMergeType 
 					, 'params' => $this->params->string('targetParams') 
 					, 'name' => $this->params->string('sourceTitle') == '' ? 'mergeTextViewBySystem'.($nNum+1) : $this->params->string('sourceTitle')
 					, 'content' => $this->params->string('sourceContent') 
 					, 'comment' => $this->params->string('sourceRemark')
 					, 'enable' => true
 			) ;
 			
 		}else if($sMergeType == 'page'){
 			if( empty($this->params['source']) )
 			{
 				$this->view->createMessage(Message::error,"%s 不能为空",'视图内容') ;
 				return ;
 			}
 			if( empty($this->params['target']) )
 			{
 				$this->view->createMessage(Message::error,"%s 不能为空",'控制器类') ;
 				return ;
 			}
 			$arrMergedControllers[ $this->params['target'] ][$sSaveType][$nNum+1] = array(
 					'mergeType' => $sMergeType 
 					, 'controller' => $this->params['source'] 
 					, 'params' => $this->params->string('sourceParams') 
 					, 'name' => 'mergeController'+($nNum+1)
 					, 'comment' => $this->params->string('sourceRemark')
 					, 'enable' => true
 			) ;
 			
 		}else if($sMergeType == 'template'){
 			if( empty($this->params['sourceTemplate']) 
 					|| (substr($this->params['sourceTemplate'], -5) !=='.html' 
 					&& substr($this->params['sourceTemplate'],-4) !== '.htm' ))
 			{
 				$this->view->createMessage(Message::error,"%s 不能为空",'模板') ;
 				return ;
 			}
 			if( empty($this->params['target']) )
 			{
 				$this->view->createMessage(Message::error,"%s 不能为空",'控制器类') ;
 				return ;
 			}
 			
 			$arrMergedControllers[ $this->params['target'] ][$sSaveType][$nNum+1] = array(
 					'mergeType' => $sMergeType
 					, 'name' => 'mergeTemplateBySystem'.($nNum+1)
 					, 'params' => $this->params->string('sourceParams')
 					, 'template' => $this->params->string('sourceTemplate')
 					, 'comment' => $this->params->string('sourceRemark')
 					, 'enable' => true
 			) ;
 		}else{
 			//其他可能?
 		}
 		
 		$aSetting->setValue('/merge/controller/controllers',$arrMergedControllers) ;
 		$aSetting->setValue('/merge/controller/num',$nNum+1) ;
		
		// 清理类编译缓存
		MvcMerger::clearClassCompiled($this->params['target_controller_class']) ;
		
		// 清理平台缓存
		ServiceSerializer::singleton()->clearRestoreCache(Service::singleton());
	
		$this->view->createMessage(Message::success,"已经将控制器 %s 融合到控制器 %s 中,刷新页面可查看改动",array($this->params['source_controller_class'],$this->params['target_controller_class'])) ;
	}
	
	protected function removeMerge()
	{
		if( empty($this->params['target']) )
		{
			$this->view->createMessage(Message::error,"缺少target参数") ;
			return ;
		}
		
		$aSetting = Application::singleton()->extensions()->extension('mvc-merger')->setting() ;
		$arrMergedControllers = $aSetting->value('/merge/controller/controllers',array()) ;
		if( $arrMergedControllers[$this->params['target']] === null)
		{
			$this->view->createMessage(Message::error,"target参数无效") ;
			return ;
		}
		
		$nIdx = $this->params->int('idx') ;
		
		// 清除target 所有的 融合
		if( $nIdx<0)
		{
			unset($arrMergedControllers[$this->params['target']]) ;
			
			$aSetting->setValue('/merge/controller/controllers',$arrMergedControllers) ;
			$this->view->createMessage(Message::success,"清除了控制器 %s 的所有融合设置,刷新页面可查看改动",array($this->params['target'])) ;
		}
		// 删除指定的融合
// 		else if( empty($arrMergedControllers[$this->params['target']][$nIdx]) )
// 		{
// 			$this->view->createMessage(Message::error,"idx参数无效") ;
// 			return ;
// 		}
		else
		{
			foreach($arrMergedControllers[$this->params['target']] as $sSaveType => $arrSaveType){
				foreach($arrSaveType as $key => $arrPatchs){
					if($key != $nIdx){
						continue;
					}
					unset($arrMergedControllers[$this->params['target']][$sSaveType][$nIdx]) ;
						
					if(empty($arrMergedControllers[$this->params['target']][$sSaveType]))
					{
						unset($arrMergedControllers[$this->params['target']][$sSaveType]) ;
					}
				}
			}
			
			if(empty($arrMergedControllers[$this->params['target']]))
			{
				unset($arrMergedControllers[$this->params['target']]) ;
			}
			
			$aSetting->setValue('/merge/controller/controllers',$arrMergedControllers) ;
			
			$this->view->createMessage(Message::success,"删除了控制器 %s 的指定融合设置,刷新页面可查看改动",array($this->params['target'])) ;
		}
			
		// 清理 class 编译缓存
		MvcMerger::clearClassCompiled($this->params['target']) ;
		
		// 清理平台缓存
		ServiceSerializer::singleton()->clearRestoreCache(Service::singleton());
	}
	
	
	protected function disMerge()
	{
		if( empty($this->params['target']) )
		{
			$this->view->createMessage(Message::error,"缺少target参数") ;
			return ;
		}
		
		$aSetting = Application::singleton()->extensions()->extension('mvc-merger')->setting() ;
		$arrMergedControllers = $aSetting->value('/merge/controller/controllers',array()) ;
		if( $arrMergedControllers[$this->params['target']] === null)
		{
			$this->view->createMessage(Message::error,"target参数无效") ;
			return ;
		}
		
		$nIdx = $this->params->int('idx') ;
		
		foreach($arrMergedControllers[$this->params['target']] as $sSaveType => $arrSaveType){
			foreach($arrSaveType as $key => $arrPatchs){
				if($key != $nIdx){
					continue;
				}
				$arrMergedControllers[$this->params['target']][$sSaveType][$nIdx]['enable'] = ! $arrMergedControllers[$this->params['target']][$sSaveType][$nIdx]['enable'];
			}
		}
		
		$aSetting->setValue('/merge/controller/controllers',$arrMergedControllers) ;
		
		$this->view->createMessage(Message::success,"修改控制器 %s 的指定融合设置,刷新页面可查看改动",array($this->params['target'])) ;
			
		// 清理 class 编译缓存
		MvcMerger::clearClassCompiled($this->params['target']) ;
		
		// 清理平台缓存
		ServiceSerializer::singleton()->clearRestoreCache(Service::singleton());
	}
	
	protected function doList(){
		$this->view->variables()->set( 'onlyList' , true ); 
	}
}
