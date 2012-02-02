<?php
namespace org\opencomb\mvcmerger\aspect ;

use org\opencomb\platform\ext\Extension;

use org\jecat\framework\util\DataSrc;
use org\jecat\framework\system\Application;
use org\jecat\framework\lang\aop\jointpoint\JointPointMethodDefine;

class ControllerMerge
{
	/**
	 * @pointcut
	 * @exmaple /配置/读取item
	 * @forwiki /配置
	 */
	public function pointcutInit()
	{
		$arrJointPoints = array() ;
		
		// 扩展 mvc-merger 的 Setting对象
		$aSetting = Extension::flyweight('mvc-merger')->setting() ;
		// 取得 item 数据
		$arrMergeSetting = $aSetting->item('/merge/controller','controllers',array()) ;
		$arrControllerClasses = array_keys($arrMergeSetting) ;
		
		// for 控制器融合
		foreach($arrControllerClasses as $sControllerClass)
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
		// 扩展 mvc-merger 的 Setting对象
		$aSetting = \org\opencomb\platform\ext\Extension::flyweight('mvc-merger')->setting() ;
		
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