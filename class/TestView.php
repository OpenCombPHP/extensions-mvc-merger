<?php
namespace org\opencomb\mvcmerger ;

use org\jecat\framework\io\OutputStreamBuffer;
use org\jecat\framework\ui\xhtml\UIFactory;
use org\jecat\framework\lang\Exception;
use org\opencomb\coresystem\mvc\controller\Controller;

class TestView extends Controller
{
	public function createBeanConfig()
	{
		return array(
				
			'frame' => array(
				'frameview' => array(
					'template'=>'TestFrame.html'
				) ,	
			) ,
			
			'view' => array( 'template'=>'TestView.html' ) ,
		) ;
	}
}

?>