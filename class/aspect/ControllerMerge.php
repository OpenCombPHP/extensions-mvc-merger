<?php
namespace org\opencomb\mvcmerger\aspect ;

use org\jecat\framework\lang\aop\jointpoint\JointPointMethodDefine;

class ControllerMerge
{
	/**
	 * @pointcut
	 */
	public function pointcutInit()
	{
		return array(
				new JointPointMethodDefine('org\\jecat\\framework\\mvc\\controller\\Controller','mainRun') ,
		) ;
	}
}

?>