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
				
			'views' => array(
				'A'=>array('template'=>'TestView.html') ,		
				'B'=>array('template'=>'TestView.html') ,		
				'C'=>array('template'=>'TestView.html') ,		
				'D'=>array('template'=>'TestView.html') ,		
				'e'=>array('template'=>'TestView.html') ,		
				'f'=>array('template'=>'TestView.html') ,		
				'g'=>array('template'=>'TestView.html') ,		
				'h'=>array('template'=>'TestView.html') ,		
			)
		) ;
	}
}

?>