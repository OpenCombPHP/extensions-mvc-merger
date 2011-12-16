<?php
namespace org\opencomb\mvcmerger\aspect ;

use org\jecat\framework\util\DataSrc;
use org\jecat\framework\system\Application;
use org\jecat\framework\lang\aop\jointpoint\JointPointMethodDefine;

class ControllerMerge
{
	/**
	 * @pointcut
	 */
	public function pointcutInit()
	{
		$arrJointPoints = array() ;
		$aSetting = Application::singleton()->extensions()->extension('mvc-merger')->setting() ;
		
		// for 控制器融合		
		foreach(array_keys($aSetting->item('/merge/controller','controllers',array())) as $sControllerClass)
		{
			$arrJointPoints[] = new JointPointMethodDefine($sControllerClass,'init')  ;
		}
		
		return $arrJointPoints ;
	}
	
	/**
	 * @advice after
	 * @for pointcutInit
	 */
	public function init()
	{
		$aSetting = \org\jecat\framework\system\Application::singleton()->extensions()->extension('mvc-merger')->setting() ;
		
		// for 控制器融合
		$arrControllers = $aSetting->item('/merge/controller','controller',array()) ;
		if( !empty($arrControllers[__CLASS__]) )
		{
			foreach($arrControllers[__CLASS__] as $arrMerge)
			{
				if( empty($arrMerge['params']) )
				{
					$aParams = null ;
				}
				else
				{
					parse_str($arrMerge['params'],$params) ;
					$aParams = new \org\jecat\framework\util\DataSrc($params) ;
				}
				$this->add( new $arrMerge['controller']($aParams), empty($arrMerge['name'])? null: $arrMerge['name'] ) ;
			}
		}
	}
}

?>