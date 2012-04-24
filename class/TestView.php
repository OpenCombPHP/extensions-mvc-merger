<?php
namespace org\opencomb\mvcmerger ;

use org\opencomb\coresystem\mvc\controller\Controller;

class TestView extends Controller
{
	public function createBeanConfig()
	{//throw new \Exception('xxxxxxxxxx') ;
		return array(
				
			/*'frame' => array(
				'frameview' => array(
					'template'=>'TestFrame.html'
				) ,	
			) ,*/
			
			'view' => array(
				'template' => 'TestView.html' ,
				'widgets' => array(
					'menu' => array(
							'class'=>'menu' ,
							'items' => array(
								array(
									'title'=>'xxx' ,
									'menu' => array(
										'items' => array(
											array('title'=>'1') ,
											array('title'=>'2') ,
										)
									)
								) ,		
								array('title'=>'ooo') ,		
								array('title'=>'abc') ,		
								array('title'=>'aadd') ,		
							)
					) ,
				) ,
					
			) ,
		) ;
	}
}
