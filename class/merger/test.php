<?php
namespace org\opencomb\mvcmerger\merger ;

use org\jecat\framework\mvc\controller\Controller;

class test extends Controller
{
	public function createBeanConfig()
	{
		return array(
				
			'views' => array(
					
				'viewA' => array(
					'template' => 'mvc-merger:test-view.html'
				) ,
				'viewB' => array(
					'template' => 'mvc-merger:test-view.html'
				) ,		
				'viewC' => array(
					'template' => 'mvc-merger:test-view.html'
				) ,		
				'viewE' => array(
					'template' => 'mvc-merger:test-view.html'
				) ,		
				'viewF' => array(
					'template' => 'mvc-merger:test-view.html'
				) ,		
			)		
		) ;
	}
}

?>