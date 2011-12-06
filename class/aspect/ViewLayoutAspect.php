<?php
namespace org\opencomb\mvcmerger\aspect ;

use org\jecat\framework\mvc\view\IView;

use org\jecat\framework\mvc\view\View;
use org\jecat\framework\mvc\view\ViewLayout;
use org\jecat\framework\mvc\controller\IController;
use org\jecat\framework\util\DataSrc;
use org\jecat\framework\system\Application;
use org\jecat\framework\lang\aop\jointpoint\JointPointMethodDefine;

class ViewLayoutAspect
{
	/**
	 * @pointcut
	 */
	public function pointcutDisplayMainView()
	{		
		$arrJointPoints = array() ;
		$aSetting = Application::singleton()->extensions()->extension('mvc-merger')->setting() ;
		
		// for 视图布局
		foreach(array_keys($aSetting->item('/merge/view_layout','controllers',array())) as $sControllerClass)
		{
			$arrJointPoints[] = new JointPointMethodDefine($sControllerClass,'displayMainView')  ;
		}
		
		return $arrJointPoints ;
	}
	
	/**
	 * @advice before
	 * @for pointcutDisplayMainView
	 */
	public function beforeDisplayMainView(IView $aMainView)
	{
		$aSetting = \org\jecat\framework\system\Application::singleton()->extensions()->extension('mvc-merger')->setting() ;
		
		// for 视图布局
		$arrControllers = $aSetting->item('/merge/view_layout','controllers',array()) ;
		if( !empty($arrControllers[__CLASS__]) )
		{
			foreach ($arrControllers[__CLASS__] as $arrFrame)
			{
				$aLayoutFrame = \org\opencomb\mvcmerger\aspect\ViewLayoutAspect::layout( $this, $arrFrame ) ;
			}
		}
	}
	
	static public function layout(IController $aController,&$arrFrameConfig)
	{
		if( !empty($arrFrameConfig['name']) )
		{
			$aLayoutFrame = ViewLayout::flyweight($arrFrameConfig['name']) ;
			$aLayoutFrame->clear() ;
			$aLayoutFrame->outputStream()->clear() ;
		}
		else
		{
			$aLayoutFrame = new ViewLayout($arrFrameConfig['type']) ;
			$aLayoutFrame->addCssClass('tmp-frame') ;
			//$aLayoutFrame->setName(null) ;
		}
				
		foreach ($arrFrameConfig['items'] as $arrItem)
		{
			if( $arrItem['class']=='frame' )
			{
				$aLayoutFrame->add(self::layout($aController,$arrItem),null,true) ;
			}
			else if( $arrItem['class']=='view' )
			{
				$aView = View::xpath($aController->mainView(),$arrItem['xpath']) ;
				if($aView)
				{
					$aLayoutFrame->add($aView,null,true) ;
				}
			}
		}
		
		$aLayoutFrame->render() ;
		
		return $aLayoutFrame ;
	}
}

?>