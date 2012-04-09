<?php
namespace org\opencomb\mvcmerger\aspect ;

use org\jecat\framework\lang\aop\AOP;

use org\opencomb\platform\ext\Extension;
use org\jecat\framework\util\DataSrc;
use org\jecat\framework\system\Application;
use org\jecat\framework\lang\aop\jointpoint\JointPointMethodDefine;

class ControllerMerge
{
	static public function registerAOP()
	{
		// 扩展 mvc-merger 的 Setting对象
		$aSetting = Extension::flyweight('mvc-merger')->setting() ;
		// 取得 item 数据
		$arrMergeSetting = $aSetting->item('/merge/controller','controllers',array()) ;
		$arrControllerClasses = array_keys($arrMergeSetting) ;
		
		// jointpoint
		$arrBeanConfig = array() ;
		foreach($arrControllerClasses as $sControllerClass)
		{
			$arrBeanConfig[] = $sControllerClass.'::init()'  ;
		}		
		
		// advice
		$arrBeanConfig[] = array(__CLASS__,'init') ;
		
		
		AOP::singleton()->registerBean($arrBeanConfig,__CLASS__) ;
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